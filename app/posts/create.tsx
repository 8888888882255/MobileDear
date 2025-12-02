import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { X, Image as ImageIcon, Send } from 'lucide-react-native';
import { Button } from '@/components/ui/Button';
import { usePostsStore } from '@/store/posts-store';
import colors from '@/constants/colors';

export default function CreatePostScreen() {
  const router = useRouter();
  const { addPost } = usePostsStore();
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddImage = () => {
    const demoImages = [
      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1516826957135-700dedea698c?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=400&h=400&fit=crop',
    ];
    const randomImage = demoImages[Math.floor(Math.random() * demoImages.length)];
    setImages(prev => [...prev, randomImage]);
  };

  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!content.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập nội dung bài viết');
      return;
    }

    setIsSubmitting(true);

    try {
      addPost(content.trim(), images.length > 0 ? images : undefined);
      router.back();
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tạo bài viết. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Tạo bài viết',
          headerShown: true,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={!content.trim() || isSubmitting}
              style={[
                styles.headerButton,
                (!content.trim() || isSubmitting) && styles.headerButtonDisabled
              ]}
            >
              <Send size={20} color={content.trim() ? colors.primary : colors.textLight} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <TextInput
          style={styles.textInput}
          placeholder="Bạn đang nghĩ gì?"
          placeholderTextColor={colors.textLight}
          value={content}
          onChangeText={setContent}
          multiline
          autoFocus
          textAlignVertical="top"
        />

        {images.length > 0 && (
          <View style={styles.imagesContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {images.map((image, index) => (
                <View key={index} style={styles.imageContainer}>
                  <Image source={{ uri: image }} style={styles.image} />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => handleRemoveImage(index)}
                  >
                    <X size={16} color="#fff" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        <TouchableOpacity style={styles.addImageButton} onPress={handleAddImage}>
          <ImageIcon size={20} color={colors.primary} />
          <Text style={styles.addImageText}>Thêm ảnh</Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Đăng bài"
          onPress={handleSubmit}
          loading={isSubmitting}
          disabled={!content.trim()}
          style={styles.postButton}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.card,
  },
  headerButton: {
    padding: 4,
  },
  headerButtonDisabled: {
    opacity: 0.5,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  textInput: {
    fontSize: 16,
    color: colors.text,
    minHeight: 120,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  imagesContainer: {
    marginBottom: 20,
  },
  imageContainer: {
    position: 'relative',
    marginRight: 12,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    borderStyle: 'dashed',
  },
  addImageText: {
    fontSize: 16,
    color: colors.primary,
    marginLeft: 8,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  postButton: {
    width: '100%',
  },
});
