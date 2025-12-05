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
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Save, User, Mail, Phone, Calendar, FileText } from 'lucide-react-native';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useUserStore } from '@/store/user-store';
import colors from '@/constants/colors';

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
  const { user, updateUserProfile, isLoading } = useUserStore();

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

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      const success = await updateUserProfile(formData);
      
      if (success) {
        if (Platform.OS === 'web') {
          window.alert('Cập nhật thông tin thành công!');
          router.replace('/(tabs)/profile');
        } else {
          Alert.alert(
            'Thành công',
            'Thông tin của bạn đã được cập nhật thành công!',
            [
              {
                text: 'OK',
                onPress: () => router.replace('/(tabs)/profile')
              }
            ]
          );
        }
      } else {
        throw new Error('Cập nhật thất bại');
      }
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

      if (Platform.OS === 'web') {
        window.alert(errorMessage);
      } else {
        Alert.alert('Lỗi', errorMessage);
      }
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
            onPress={() => router.back()}
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
              onPress={() => router.back()}
            >
              <ArrowLeft size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Chỉnh sửa thông tin</Text>
            <View style={styles.placeholder} />
          </View>

          <View style={styles.form}>
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
});
