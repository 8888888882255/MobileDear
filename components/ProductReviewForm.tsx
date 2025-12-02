import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Image
} from 'react-native';
import { Star, Image as ImageIcon, X } from 'lucide-react-native';
import { Button } from '@/components/ui/Button';
import * as ImagePicker from 'expo-image-picker';
import colors from '@/constants/colors';

interface ProductReviewFormProps {
  productId: string;
  onSubmit: () => void;
  onCancel: () => void;
}

export const ProductReviewForm: React.FC<ProductReviewFormProps> = ({
  productId,
  onSubmit,
  onCancel
}) => {
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [review, setReview] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [errors, setErrors] = useState({
    rating: '',
    title: '',
    review: ''
  });

  const handleRatingPress = (selectedRating: number) => {
    setRating(selectedRating);
    if (errors.rating) {
      setErrors(prev => ({ ...prev, rating: '' }));
    }
  };

  const handlePickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert('Yêu cầu quyền truy cập', 'Bạn cần cho phép truy cập ảnh để tải lên.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = { rating: '', title: '', review: '' };

    if (rating === 0) {
      newErrors.rating = 'Vui lòng chọn số sao đánh giá';
      isValid = false;
    }

    if (!title.trim()) {
      newErrors.title = 'Vui lòng nhập tiêu đề đánh giá';
      isValid = false;
    }

    if (!review.trim()) {
      newErrors.review = 'Vui lòng nhập nội dung đánh giá';
      isValid = false;
    } else if (review.trim().length < 10) {
      newErrors.review = 'Đánh giá phải có ít nhất 10 ký tự';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;
    setIsLoading(true);

    // Giả lập gọi API
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert(
        'Đánh giá đã gửi',
        'Cảm ơn bạn đã đánh giá sản phẩm!',
        [{ text: 'OK', onPress: onSubmit }]
      );
    }, 1500);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Viết đánh giá</Text>
        <TouchableOpacity onPress={onCancel}>
          <X size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.ratingContainer}>
        <Text style={styles.label}>Số sao</Text>
        <View style={styles.starsContainer}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity
              key={star}
              onPress={() => handleRatingPress(star)}
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
        {errors.rating ? <Text style={styles.errorText}>{errors.rating}</Text> : null}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Tiêu đề</Text>
        <TextInput
          style={[styles.input, errors.title ? styles.inputError : null]}
          placeholder="Tóm tắt trải nghiệm của bạn"
          value={title}
          onChangeText={setTitle}
          maxLength={100}
          placeholderTextColor="#999"
        />
        {errors.title ? <Text style={styles.errorText}>{errors.title}</Text> : null}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Nội dung đánh giá</Text>
        <TextInput
          style={[styles.textArea, errors.review ? styles.inputError : null]}
          placeholder="Hãy chia sẻ cảm nhận của bạn về sản phẩm này"
          value={review}
          onChangeText={setReview}
          multiline
          numberOfLines={6}
          textAlignVertical="top"
          placeholderTextColor="#999"
        />
        {errors.review ? <Text style={styles.errorText}>{errors.review}</Text> : null}
      </View>

      <View style={styles.imageSection}>
        <Text style={styles.label}>Thêm hình ảnh (tuỳ chọn)</Text>
        {image ? (
          <View style={styles.imagePreview}>
            <Image source={{ uri: image }} style={styles.previewImage} />
            <TouchableOpacity
              style={styles.removeImageButton}
              onPress={handleRemoveImage}
            >
              <X size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.addImageButton}
            onPress={handlePickImage}
          >
            <ImageIcon size={24} color={colors.primary} />
            <Text style={styles.addImageText}>Chọn ảnh</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="Gửi đánh giá"
          onPress={handleSubmit}
          loading={isLoading}
          fullWidth
          style={styles.submitButton}
        />
        <Button
          title="Huỷ"
          onPress={onCancel}
          variant="outline"
          fullWidth
          style={styles.cancelButton}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  ratingContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starButton: {
    marginRight: 8,
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.text,
  },
  inputError: {
    borderColor: colors.error,
  },
  textArea: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.text,
    minHeight: 120,
  },
  errorText: {
    color: colors.error,
    fontSize: 12,
    marginTop: 4,
  },
  imageSection: {
    marginBottom: 24,
  },
  addImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    borderStyle: 'dashed',
    padding: 16,
    backgroundColor: colors.card,
  },
  addImageText: {
    marginLeft: 8,
    color: colors.primary,
    fontSize: 16,
    fontWeight: '500',
  },
  imagePreview: {
    position: 'relative',
    borderRadius: 8,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: {
    marginTop: 8,
  },
  submitButton: {
    marginBottom: 12,
  },
  cancelButton: {
    marginBottom: 8,
  },
});
