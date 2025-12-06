// app/(tabs)/product/review/[id].tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  SafeAreaView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Star, Camera, X } from 'lucide-react-native';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import colors from '@/constants/colors';
import * as ImagePicker from 'expo-image-picker';
import Constants from 'expo-constants';
import { useUserStore } from '@/store/user-store';

const API_URL = Constants.expoConfig?.extra?.apiUrl || 'http://192.168.1.5:5083';

export default function ProductReviewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useUserStore();

  const productId = Array.isArray(id) ? id[0] : id;

  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [review, setReview] = useState('');
  const [images, setImages] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Kiểm tra đăng nhập
  React.useEffect(() => {
    if (!user) {
      Alert.alert('Yêu cầu đăng nhập', 'Vui lòng đăng nhập để viết đánh giá', [
        { text: 'Hủy' },
        { text: 'Đăng nhập', onPress: () => router.push('/auth/login') }
      ]);
    }
  }, [user]);

  const handleRatingChange = (value: number) => setRating(value);

  const handleAddImage = async () => {
    if (images.length >= 5) {
      Alert.alert('Giới hạn', 'Chỉ được tải lên tối đa 5 ảnh');
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Cần quyền truy cập', 'Vui lòng cho phép truy cập thư viện ảnh');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.[0]) {
      setImages([...images, result.assets[0]]);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmitReview = async () => {
    if (!user) {
      Alert.alert('Lỗi', 'Bạn cần đăng nhập để gửi đánh giá');
      return;
    }
    if (rating === 0) {
      Alert.alert('Thiếu đánh giá', 'Vui lòng chọn số sao');
      return;
    }
    if (!review.trim()) {
      Alert.alert('Thiếu nội dung', 'Vui lòng nhập nội dung đánh giá');
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData();

    // ĐÚNG 100% NHƯ CURL CỦA BẠN
    if (title.trim()) formData.append('TieuDe', title.trim());
    formData.append('NoiDung', review.trim());
    formData.append('DanhGia', rating.toString());
    formData.append('TrangThai', '1');
    formData.append('MaNguoiDung', (user.rawData?.maNguoiDung || user.id).toString());
    formData.append('MaSanPham', productId);

    // Nhiều ảnh → field tên là "Images"
    images.forEach((image) => {
      const uri = image.uri;
      const filename = uri.split('/').pop() || 'photo.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const ext = match ? match[1].toLowerCase() : 'jpg';
      const type = ext === 'png' ? 'image/png' : 'image/jpeg';

      formData.append('Images', {
        uri: Platform.OS === 'android' ? uri : uri.replace('file://', ''),
        name: filename,
        type,
      } as any);
    });

    try {
      const response = await fetch(`${API_URL}/api/BinhLuan`, {
        method: 'POST',
        body: formData,
        // Không set Content-Type → trình duyệt tự thêm boundary
      });

      if (response.ok) {
        Alert.alert(
          'Gửi thành công!',
          'Cảm ơn bạn! Đánh giá sẽ được duyệt và hiển thị sớm.',
          [{ text: 'OK', onPress: () => router.back() }]
        );
      } else {
        const error = await response.text();
        console.log('Lỗi server:', error);
        Alert.alert('Gửi thất bại', 'Đã có lỗi xảy ra. Vui lòng thử lại.');
      }
    } catch (err) {
      console.log('Network error:', err);
      Alert.alert('Lỗi mạng', 'Không thể kết nối đến server');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Viết đánh giá', headerTitleStyle: { fontWeight: '600' } }} />

      <SafeAreaView style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Thông tin sản phẩm */}
          <View style={styles.productContainer}>
            <View style={styles.productImagePlaceholder}>
              <Text style={styles.placeholderText}>SP</Text>
            </View>
            <View style={styles.productInfo}>
              <Text style={styles.productName}>Sản phẩm ID: {productId}</Text>
              <Text style={styles.productCategory}>Đang viết đánh giá</Text>
            </View>
          </View>

          {/* Đánh giá sao */}
          <View style={styles.ratingContainer}>
            <Text style={styles.sectionTitle}>Đánh giá của bạn</Text>
            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => handleRatingChange(star)} style={styles.starButton}>
                  <Star size={40} color={star <= rating ? '#facc15' : colors.border} fill={star <= rating ? '#facc15' : 'none'} />
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.ratingText}>
              {rating === 0 ? 'Chạm để chọn sao' :
                rating === 1 ? 'Rất tệ' :
                rating === 2 ? 'Tệ' :
                rating === 3 ? 'Bình thường' :
                rating === 4 ? 'Tốt' : 'Tuyệt vời!'}
            </Text>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            <Text style={styles.sectionTitle}>Tiêu đề (không bắt buộc)</Text>
            <Input placeholder="Ví dụ: Đẹp, giao nhanh" value={title} onChangeText={setTitle} />

            <Text style={styles.sectionTitle}>Nội dung đánh giá</Text>
            <Input
              placeholder="Hãy chia sẻ cảm nhận của bạn..."
              value={review}
              onChangeText={setReview}
              multiline
              numberOfLines={6}
              style={styles.reviewInput}
              textAlignVertical="top"
            />

            <Text style={styles.sectionTitle}>Thêm ảnh (tối đa 5)</Text>
            <Text style={styles.photoHint}>Chụp ảnh thực tế để giúp người mua khác</Text>

            <View style={styles.imagesContainer}>
              {images.map((img, idx) => (
                <View key={idx} style={styles.imageWrapper}>
                  <Image source={{ uri: img.uri }} style={styles.uploadedImage} resizeMode="cover" />
                  <TouchableOpacity style={styles.removeImageButton} onPress={() => handleRemoveImage(idx)}>
                    <X size={18} color="#fff" />
                  </TouchableOpacity>
                </View>
              ))}

              {images.length < 5 && (
                <TouchableOpacity style={styles.addImageButton} onPress={handleAddImage}>
                  <Camera size={28} color={colors.primary} />
                  <Text style={styles.addImageText}>Thêm ảnh</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </ScrollView>

        {/* Nút gửi */}
        <View style={styles.bottomBar}>
          <Button
            title={isSubmitting ? "Đang gửi..." : "Gửi đánh giá"}
            onPress={handleSubmitReview}
            disabled={isSubmitting || !user}
            style={styles.submitButton}
          />
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  productContainer: { flexDirection: 'row', padding: 16, borderBottomWidth: 1, borderBottomColor: colors.border },
  productImagePlaceholder: { width: 60, height: 60, borderRadius: 8, backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center' },
  placeholderText: { fontSize: 18, fontWeight: 'bold', color: '#999' },
  productInfo: { marginLeft: 12, justifyContent: 'center' },
  productName: { fontSize: 16, fontWeight: 'bold' },
  productCategory: { fontSize: 14, color: colors.textLight, marginTop: 4 },
  ratingContainer: { padding: 20, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: colors.border },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
  starsContainer: { flexDirection: 'row', marginBottom: 8 },
  starButton: { padding: 8 },
  ratingText: { fontSize: 16, color: colors.textLight },
  formContainer: { padding: 16 },
  reviewInput: { height: 120, paddingTop: 12 },
  photoHint: { fontSize: 14, color: colors.textLight, marginBottom: 16 },
  imagesContainer: { flexDirection: 'row', flexWrap: 'wrap' },
  imageWrapper: { width: 100, height: 100, borderRadius: 12, marginRight: 12, marginBottom: 12, position: 'relative' },
  uploadedImage: { width: '100%', height: '100%', borderRadius: 12 },
  removeImageButton: { position: 'absolute', top: -8, right: -8, width: 28, height: 28, borderRadius: 14, backgroundColor: colors.error, justifyContent: 'center', alignItems: 'center' },
  addImageButton: { width: 100, height: 100, borderRadius: 12, borderWidth: 2, borderColor: colors.border, borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', marginRight: 12, marginBottom: 12, backgroundColor: '#fafafa' },
  addImageText: { marginTop: 8, color: colors.primary, fontWeight: '600' },
  bottomBar: { padding: 16, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: '#fff' },
  submitButton: { width: '100%' },
});
