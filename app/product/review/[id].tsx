import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image,
  Alert,
  SafeAreaView
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Star, Camera, X } from 'lucide-react-native';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { products } from '@/mocks/products';
import colors from '@/constants/colors';
import * as ImagePicker from 'expo-image-picker';

export default function ProductReviewScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const product = products.find(p => p.id === id);

  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [review, setReview] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!product) {
    return (
      <SafeAreaView style={styles.notFoundContainer}>
        <Text style={styles.notFoundText}>Không tìm thấy sản phẩm</Text>
        <Button 
          title="Quay lại" 
          onPress={() => router.back()} 
          style={styles.backButton}
        />
      </SafeAreaView>
    );
  }

  const handleRatingChange = (value: number) => setRating(value);

  const handleAddImage = async () => {
    if (images.length >= 5) {
      Alert.alert('Đã đạt giới hạn', 'Bạn chỉ được tải lên tối đa 5 ảnh');
      return;
    }

    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Cần quyền truy cập', 'Vui lòng cho phép truy cập thư viện ảnh');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImages([...images, result.assets[0].uri]);
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const handleSubmitReview = () => {
    if (rating === 0) {
      Alert.alert('Vui lòng đánh giá', 'Bạn cần chọn số sao trước khi gửi đánh giá');
      return;
    }
    if (!review.trim()) {
      Alert.alert('Thiếu nội dung', 'Vui lòng nhập nội dung đánh giá');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      Alert.alert('Đã gửi đánh giá', 'Cảm ơn bạn! Đánh giá sẽ được duyệt trước khi hiển thị.', [
        { text: 'OK', onPress: () => router.push(`/product/${id}`) },
      ]);
    }, 1000);
  };

  return (
    <>
      <Stack.Screen 
        options={{
          title: 'Viết đánh giá',
          headerTitleStyle: { fontWeight: '600' },
        }}
      />

      <SafeAreaView style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.productContainer}>
            <Image source={{ uri: product.images[0] }} style={styles.productImage} resizeMode="cover" />
            <View style={styles.productInfo}>
              <Text style={styles.productName}>{product.name}</Text>
              <Text style={styles.productCategory}>{product.category} • {product.subcategory}</Text>
            </View>
          </View>

          <View style={styles.ratingContainer}>
            <Text style={styles.sectionTitle}>Đánh giá của bạn</Text>
            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => handleRatingChange(star)}
                  style={styles.starButton}
                >
                  <Star 
                    size={32}
                    color={star <= rating ? colors.primary : colors.border}
                    fill={star <= rating ? colors.primary : 'none'}
                  />
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.ratingText}>
              {rating === 0 ? 'Chạm để đánh giá' :
                rating === 1 ? 'Tệ' :
                rating === 2 ? 'Không hài lòng' :
                rating === 3 ? 'Bình thường' :
                rating === 4 ? 'Hài lòng' : 'Tuyệt vời'}
            </Text>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.sectionTitle}>Tiêu đề đánh giá</Text>
            <Input
              placeholder="Tóm tắt trải nghiệm của bạn (không bắt buộc)"
              value={title}
              onChangeText={setTitle}
              style={styles.titleInput}
            />

            <Text style={styles.sectionTitle}>Nội dung đánh giá</Text>
            <Input
              placeholder="Chia sẻ cảm nhận của bạn về sản phẩm này"
              value={review}
              onChangeText={setReview}
              multiline
              numberOfLines={5}
              style={styles.reviewInput}
              textAlignVertical="top"
            />

            <Text style={styles.sectionTitle}>Thêm hình ảnh (không bắt buộc)</Text>
            <Text style={styles.photoHint}>Bạn có thể thêm tối đa 5 hình ảnh</Text>

            <View style={styles.imagesContainer}>
              {images.map((image, index) => (
                <View key={index} style={styles.imageWrapper}>
                  <Image source={{ uri: image }} style={styles.uploadedImage} resizeMode="cover" />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => handleRemoveImage(index)}
                  >
                    <X size={16} color="#fff" />
                  </TouchableOpacity>
                </View>
              ))}

              {images.length < 5 && (
                <TouchableOpacity style={styles.addImageButton} onPress={handleAddImage}>
                  <Camera size={24} color={colors.primary} />
                  <Text style={styles.addImageText}>Thêm ảnh</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </ScrollView>

        <View style={styles.bottomBar}>
          <Button 
            title="Gửi đánh giá" 
            onPress={handleSubmitReview}
            loading={isSubmitting}
            style={styles.submitButton}
          />
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  notFoundText: {
    fontSize: 18,
    marginBottom: 20,
  },
  backButton: {
    width: 200,
  },
  productContainer: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  productInfo: {
    marginLeft: 12,
    justifyContent: 'center',
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  productCategory: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  ratingContainer: {
    padding: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  starButton: {
    padding: 8,
  },
  ratingText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 4,
  },
  formContainer: {
    padding: 16,
  },
  titleInput: {
    marginBottom: 20,
  },
  reviewInput: {
    height: 120,
    marginBottom: 20,
    paddingTop: 12,
  },
  photoHint: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  imagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  imageWrapper: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 12,
    marginBottom: 12,
    position: 'relative',
  },
  uploadedImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.error,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addImageButton: {
    width: 100,
    height: 100,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginBottom: 12,
  },
  addImageText: {
    fontSize: 12,
    color: colors.primary,
    marginTop: 4,
  },
  bottomBar: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: '#fff',
  },
  submitButton: {
    width: '100%',
  },
});