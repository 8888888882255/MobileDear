import React, { useState } from 'react';
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
  Switch,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, Save } from 'lucide-react-native';
import colors from '@/constants/colors';
import { GiaoDienCreate, SETTING_TYPES } from '@/types';
import { SettingsService } from '@/src/services/settingsService';

export default function CreateSettingScreen() {
  const router = useRouter();
  const { type } = useLocalSearchParams<{ type: string }>();
  const settingType = Number(type) || SETTING_TYPES.LOGO;

  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<GiaoDienCreate>({
    tenGiaoDien: '',
    loaiGiaoDien: settingType,
    moTa: '',
    metaTitle: '',
    metaDescription: '',
    metaKeywords: '',
    trangThai: 1,
  });

  const handleSave = async () => {
    if (!formData.tenGiaoDien?.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên');
      return;
    }

    setIsSaving(true);
    try {
      const result = await SettingsService.create(formData);
      Alert.alert('Thành công', 'Đã tạo thành công!', [
        {
          text: 'Về danh sách',
          onPress: () => router.back(),
        },
        {
          text: 'Thêm ảnh ngay',
          onPress: () =>
            router.replace(`/admin/settings/edit?id=${result.maGiaoDien}`),
        },
      ]);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tạo mới. Vui lòng thử lại.');
    } finally {
      setIsSaving(false);
    }
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          Tạo {getTypeLabel(settingType)} mới
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
        {/* Type Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Loại</Text>
          <View style={styles.typeSelector}>
            {[SETTING_TYPES.LOGO, SETTING_TYPES.BANNER, SETTING_TYPES.SLIDER].map(
              (t) => (
                <TouchableOpacity
                  key={t}
                  style={[
                    styles.typeOption,
                    formData.loaiGiaoDien === t && styles.typeOptionActive,
                  ]}
                  onPress={() =>
                    setFormData({ ...formData, loaiGiaoDien: t })
                  }
                >
                  <Text
                    style={[
                      styles.typeOptionText,
                      formData.loaiGiaoDien === t && styles.typeOptionTextActive,
                    ]}
                  >
                    {getTypeLabel(t)}
                  </Text>
                </TouchableOpacity>
              )
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

        <View style={styles.note}>
          <Text style={styles.noteText}>
            💡 Sau khi tạo, bạn có thể thêm hình ảnh trong màn hình chỉnh sửa.
          </Text>
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
  typeSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  typeOption: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  typeOptionActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  typeOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textLight,
  },
  typeOptionTextActive: {
    color: '#fff',
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
  note: {
    backgroundColor: '#fef3c7',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  noteText: {
    fontSize: 13,
    color: '#92400e',
  },
});
