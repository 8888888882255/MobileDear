import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Image,
  Switch,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import {
  ChevronLeft,
  Save,
  Upload,
  Trash2,
  Image as ImageIcon,
} from 'lucide-react-native';
import Constants from 'expo-constants';
import colors from '@/constants/colors';
import { GiaoDien, GiaoDienEdit, Media, SETTING_TYPES } from '@/types';
import { SettingsService } from '@/src/services/settingsService';

const API_URL = Constants?.expoConfig?.extra?.apiUrl || 'http://localhost:5083';

export default function EditSettingScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [item, setItem] = useState<GiaoDien | null>(null);
  const [formData, setFormData] = useState<GiaoDienEdit>({});

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const data = await SettingsService.getById(Number(id));
      setItem(data);
      setFormData({
        maGiaoDien: data.maGiaoDien,
        tenGiaoDien: data.tenGiaoDien,
        loaiGiaoDien: data.loaiGiaoDien,
        moTa: data.moTa,
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
        metaKeywords: data.metaKeywords,
        trangThai: data.trangThai,
      });
    } catch (error) {
      console.error('Error loading setting:', error);
      Alert.alert('Lỗi', 'Không thể tải dữ liệu.');
      router.back();
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!id || !formData.tenGiaoDien?.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên');
      return;
    }

    setIsSaving(true);
    try {
      // Ensure required fields are present
      const payload: GiaoDienEdit = {
        ...formData,
        maGiaoDien: Number(id),
        loaiGiaoDien: formData.loaiGiaoDien || item?.loaiGiaoDien || 1,
      };
      
      await SettingsService.update(Number(id), payload);
      Alert.alert('Thành công', 'Đã cập nhật thành công!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể cập nhật. Vui lòng thử lại.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Lỗi', 'Cần quyền truy cập thư viện ảnh');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      await uploadImage(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri: string) => {
    if (!id) return;

    setIsUploading(true);
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      
      await SettingsService.uploadMedia(Number(id), blob);
      Alert.alert('Thành công', 'Đã upload ảnh!');
      loadData(); // Reload to show new media
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Lỗi', 'Không thể upload ảnh.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteMedia = (media: Media) => {
    if (!id) return;

    Alert.alert('Xác nhận', 'Bạn có chắc muốn xóa ảnh này?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          try {
            await SettingsService.removeMedia(Number(id), media.maMedia);
            loadData();
          } catch (error) {
            Alert.alert('Lỗi', 'Không thể xóa ảnh.');
          }
        },
      },
    ]);
  };

  const getImageUrl = (path: string): string => {
    if (!path) return '';
    if (path.startsWith('http') || path.startsWith('data:')) return path;
    return `${API_URL}${path}`;
  };

  const getTypeLabel = (type: number): string => {
    switch (type) {
      case SETTING_TYPES.LOGO:
        return 'Logo';
      case SETTING_TYPES.BANNER:
        return 'Banner';
      case SETTING_TYPES.SLIDER:
        return 'Slider';
      default:
        return 'Khác';
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          Chỉnh sửa {item ? getTypeLabel(item.loaiGiaoDien) : ''}
        </Text>
        <TouchableOpacity
          style={[styles.saveButton, isSaving && styles.savingButton]}
          onPress={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Save size={20} color="#fff" />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Media Gallery */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hình ảnh (Tối đa 1)</Text>
          <View style={styles.mediaGrid}>
            {item?.medias?.map((media) => (
              <View key={media.maMedia} style={styles.mediaItem}>
                <Image
                  source={{ uri: getImageUrl(media.duongDan) }}
                  style={styles.mediaImage}
                />
                <TouchableOpacity
                  style={styles.deleteMediaButton}
                  onPress={() => handleDeleteMedia(media)}
                >
                  <Trash2 size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            ))}
            
            {/* Only show upload button if no media exists */}
            {(!item?.medias || item.medias.length === 0) && (
              <TouchableOpacity
                style={styles.uploadButton}
                onPress={handlePickImage}
                disabled={isUploading}
              >
                {isUploading ? (
                  <ActivityIndicator color={colors.primary} />
                ) : (
                  <>
                    <Upload size={24} color={colors.primary} />
                    <Text style={styles.uploadText}>Upload</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Form Fields */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin chung</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tên *</Text>
            <TextInput
              style={styles.input}
              value={formData.tenGiaoDien}
              onChangeText={(text) =>
                setFormData({ ...formData, tenGiaoDien: text })
              }
              placeholder="Nhập tên"
              placeholderTextColor={colors.textLight}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mô tả</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.moTa || ''}
              onChangeText={(text) => setFormData({ ...formData, moTa: text })}
              placeholder="Nhập mô tả"
              placeholderTextColor={colors.textLight}
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.switchGroup}>
            <Text style={styles.label}>Trạng thái</Text>
            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>
                {formData.trangThai === 1 ? 'Hoạt động' : 'Ẩn'}
              </Text>
              <Switch
                value={formData.trangThai === 1}
                onValueChange={(value) =>
                  setFormData({ ...formData, trangThai: value ? 1 : 0 })
                }
                trackColor={{ false: colors.border, true: colors.primary }}
              />
            </View>
          </View>
        </View>

        {/* SEO Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SEO (Tùy chọn)</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Meta Title</Text>
            <TextInput
              style={styles.input}
              value={formData.metaTitle || ''}
              onChangeText={(text) =>
                setFormData({ ...formData, metaTitle: text })
              }
              placeholder="Tiêu đề SEO"
              placeholderTextColor={colors.textLight}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Meta Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.metaDescription || ''}
              onChangeText={(text) =>
                setFormData({ ...formData, metaDescription: text })
              }
              placeholder="Mô tả SEO"
              placeholderTextColor={colors.textLight}
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Meta Keywords</Text>
            <TextInput
              style={styles.input}
              value={formData.metaKeywords || ''}
              onChangeText={(text) =>
                setFormData({ ...formData, metaKeywords: text })
              }
              placeholder="Từ khóa SEO"
              placeholderTextColor={colors.textLight}
            />
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  saveButton: {
    backgroundColor: colors.primary,
    padding: 10,
    borderRadius: 8,
  },
  savingButton: {
    opacity: 0.7,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  mediaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  mediaItem: {
    width: 100,
    height: 100,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  mediaImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  deleteMediaButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(220, 38, 38, 0.9)',
    padding: 4,
    borderRadius: 4,
  },
  uploadButton: {
    width: 100,
    height: 100,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  uploadText: {
    fontSize: 12,
    color: colors.primary,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.text,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  switchGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  switchLabel: {
    fontSize: 14,
    color: colors.textLight,
  },
});
