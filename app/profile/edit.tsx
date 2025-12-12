import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { useRouter, useNavigation } from 'expo-router';
import { ArrowLeft, Save, User, Mail, Phone, Calendar, FileText, Camera } from 'lucide-react-native';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useUserStore } from '@/store/user-store';
import { AuthService } from '@/src/services/authService';
import colors from '@/constants/colors';
import * as ImagePicker from 'expo-image-picker';
import Constants from 'expo-constants';
import { api } from '@/src/config/api';

const API_URL = api.baseUrl;

interface EditProfileData {
  name: string;
  email: string;
  phone: string;
  bio: string;
  gender: number;
  birthDate: string;
}

export default function EditProfileScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { user, updateUserProfile, isLoading } = useUserStore();

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      router.replace('/profile');
    }
  };

  const [formData, setFormData] = useState<EditProfileData>({
    name: '',
    email: '',
    phone: '',
    bio: '',
    gender: 0,
    birthDate: ''
  });

  const [errors, setErrors] = useState({
    name: '',
    email: '',
    phone: '',
    birthDate: ''
  });

  const [isSaving, setIsSaving] = useState(false);
  
  // Avatar state
  type SelectedAvatar = {
    uri: string;
    name: string;
    type: string;
    file?: File; // Only for web
  };
  const [selectedAvatar, setSelectedAvatar] = useState<SelectedAvatar | null>(null);
// Moved to top


  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        bio: user.bio || '',
        gender: user.gender || 0,
        birthDate: user.birthDate || ''
      });
    }
  }, [user]);

  const updateField = (field: keyof EditProfileData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing (only for fields that have errors)
    if (field in errors && typeof field === 'string' && errors[field as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    let isValid = true;
    const newErrors = {
      name: '',
      email: '',
      phone: '',
      birthDate: ''
    };

    // Validate Name
    if (!formData.name.trim()) {
      newErrors.name = 'Họ tên là bắt buộc';
      isValid = false;
    }

    // Validate Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email là bắt buộc';
      isValid = false;
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
      isValid = false;
    }

    // Validate Phone (optional but if provided, should be valid)
    if (formData.phone && !/^[0-9]{10,11}$/.test(formData.phone.replace(/[^0-9]/g, ''))) {
      newErrors.phone = 'Số điện thoại không hợp lệ';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Pick avatar image
  const pickAvatar = async () => {
    if (Platform.OS === 'web') {
      // Web: use file input
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';

      input.onchange = (e: any) => {
        const file: File = e.target.files?.[0];
        if (!file) return;

        setSelectedAvatar({
          uri: URL.createObjectURL(file),
          name: file.name,
          type: file.type || 'image/jpeg',
          file,
        });
      };

      input.click();
      return;
    }

    // Mobile & Desktop
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Toast.show({
        type: 'error',
        text1: 'Cần quyền',
        text2: 'Vui lòng cấp quyền truy cập thư viện ảnh',
      });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const fileName = asset.uri.split('/').pop() || `avatar_${Date.now()}.jpg`;
      setSelectedAvatar({
        uri: asset.uri,
        name: fileName,
        type: 'image/jpeg',
      });
    }
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      // If avatar is selected, upload with FormData directly
      if (selectedAvatar) {
        const token = await AuthService.getStoredToken();
        const formDataToSend = new FormData();
        
        // Add profile data
        formDataToSend.append('MaNguoiDung', user!.id);
        formDataToSend.append('HoTen', formData.name);
        formDataToSend.append('Email', formData.email);
        formDataToSend.append('Sdt', formData.phone || '');
        formDataToSend.append('VaiTro', user!.isAdmin ? '1' : '0');
        formDataToSend.append('TrangThai', '1');
        formDataToSend.append('TieuSu', formData.bio || '');
        formDataToSend.append('GioiTinh', (formData.gender || 0).toString());
        if (formData.birthDate) formDataToSend.append('NgaySinh', formData.birthDate);
        
        // Add avatar image
        if (Platform.OS === 'web' && selectedAvatar.file) {
          formDataToSend.append('imageFile', selectedAvatar.file, selectedAvatar.name);
        } else {
          formDataToSend.append('imageFile', {
            uri: selectedAvatar.uri,
            name: selectedAvatar.name,
            type: selectedAvatar.type,
          } as any);
        }
        
        const response = await fetch(`${API_URL}/api/NguoiDung/${user!.id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formDataToSend,
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || 'Cập nhật thất bại');
        }
        
        // Refresh user profile to get new avatar
        const { refreshUserProfile } = useUserStore.getState();
        await refreshUserProfile();
      } else {
        // No avatar, use normal update
        const success = await updateUserProfile(formData);
        if (!success) throw new Error('Cập nhật thất bại');
      }
      
      Toast.show({
        type: 'success',
        text1: 'Thành công',
        text2: 'Thông tin của bạn đã được cập nhật thành công!',
      });
      router.replace('/(tabs)/profile');
    } catch (error: any) {
      console.error('Profile update error:', error);
      
      let errorMessage = 'Có lỗi xảy ra khi cập nhật thông tin. Vui lòng thử lại.';
      
      if (error.message) {
        if (error.message.includes('Email đã tồn tại')) {
          errorMessage = 'Email đã được sử dụng bởi tài khoản khác.';
        } else if (error.message.includes('Số điện thoại đã tồn tại')) {
          errorMessage = 'Số điện thoại đã được sử dụng bởi tài khoản khác.';
        } else {
          errorMessage = error.message;
        }
      }

      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: errorMessage,
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Không thể tải thông tin người dùng</Text>
          <Button
            title="Quay lại"
            onPress={handleBack}
            style={styles.backButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={handleBack}
            >
              <ArrowLeft size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Chỉnh sửa thông tin</Text>
            <View style={styles.placeholder} />
          </View>

          <View style={styles.form}>
            {/* Avatar Section */}
            <View style={styles.avatarSection}>
              <TouchableOpacity style={styles.avatarContainer} onPress={pickAvatar}>
                {selectedAvatar ? (
                  <Image source={{ uri: selectedAvatar.uri }} style={styles.avatar} />
                ) : user.avatar ? (
                  <Image source={{ uri: user.avatar.startsWith('http') ? user.avatar : `${API_URL}${user.avatar}` }} style={styles.avatar} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <User size={50} color={colors.textLight} />
                  </View>
                )}
                <View style={styles.cameraOverlay}>
                  <Camera size={20} color="#fff" />
                </View>
              </TouchableOpacity>
              <Text style={styles.avatarHint}>Nhấn để thay đổi ảnh đại diện</Text>
            </View>

            <Input
              label="Họ và tên"
              placeholder="Nhập họ và tên của bạn"
              value={formData.name}
              onChangeText={(value) => updateField('name', value)}
              autoCapitalize="words"
              error={errors.name}
              leftIcon={<User size={20} color={colors.textLight} />}
            />

            <Input
              label="Email"
              placeholder="Nhập địa chỉ email"
              value={formData.email}
              onChangeText={(value) => updateField('email', value)}
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
              leftIcon={<Mail size={20} color={colors.textLight} />}
            />

            <Input
              label="Số điện thoại (tùy chọn)"
              placeholder="Nhập số điện thoại"
              value={formData.phone}
              onChangeText={(value) => updateField('phone', value)}
              keyboardType="phone-pad"
              error={errors.phone}
              leftIcon={<Phone size={20} color={colors.textLight} />}
            />

            <Input
              label="Ngày sinh (tùy chọn)"
              placeholder="DD/MM/YYYY"
              value={formData.birthDate}
              onChangeText={(value) => updateField('birthDate', value)}
              keyboardType="numeric"
              error={errors.birthDate}
              leftIcon={<Calendar size={20} color={colors.textLight} />}
            />

            <Input
              label="Tiểu sử (tùy chọn)"
              placeholder="Mô tả ngắn về bạn"
              value={formData.bio}
              onChangeText={(value) => updateField('bio', value)}
              multiline
              numberOfLines={3}
              leftIcon={<FileText size={20} color={colors.textLight} />}
            />

            <View style={styles.infoContainer}>
              <Text style={styles.infoTitle}>Thông tin tài khoản</Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Vai trò:</Text>
                <Text style={styles.infoValue}>
                  {user.isAdmin ? 'Quản trị viên' : 'Người dùng'}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>ID:</Text>
                <Text style={styles.infoValue}>{user.id}</Text>
              </View>
            </View>

            <Button
              title="Lưu thay đổi"
              onPress={handleSave}
              loading={isSaving || isLoading}
              fullWidth
              style={styles.saveButton}
              leftIcon={<Save size={20} color="#fff" />}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  keyboardAvoidingView: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  errorContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 24 
  },
  errorText: { 
    fontSize: 16, 
    color: colors.textLight, 
    marginBottom: 24, 
    textAlign: 'center' 
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.card,
  },
  headerTitle: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: colors.text 
  },
  placeholder: { width: 40 },
  form: { paddingHorizontal: 24, paddingBottom: 24 },
  infoContainer: {
    marginTop: 24,
    marginBottom: 24,
    padding: 16,
    backgroundColor: colors.card,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  infoTitle: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: colors.text, 
    marginBottom: 12 
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: { 
    fontSize: 14, 
    color: colors.textLight 
  },
  infoValue: { 
    fontSize: 14, 
    color: colors.text, 
    fontWeight: '500' 
  },
  saveButton: { marginTop: 8 },
  // Avatar styles
  avatarSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    position: 'relative',
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 12,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: colors.primary,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  cameraOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.background,
  },
  avatarHint: {
    fontSize: 13,
    color: colors.textLight,
    textAlign: 'center',
  },
});
