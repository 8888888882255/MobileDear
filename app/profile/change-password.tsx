import React, { useState } from 'react';
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
import Toast from 'react-native-toast-message';
import { useRouter, useNavigation } from 'expo-router';
import { Lock, ChevronLeft } from 'lucide-react-native';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useUserStore } from '@/store/user-store';
import { AuthService } from '@/src/services/authService';
import colors from '@/constants/colors';
import Constants from 'expo-constants';

import { api } from '@/src/config/api';

const API_URL = api.baseUrl;

export default function ChangePasswordScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { user, isAuthenticated } = useUserStore();

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      router.replace('/profile');
    }
  };

  if (!isAuthenticated || !user) {
    router.replace('/auth/login');
    return null;
  }

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    };

    if (!currentPassword) {
      newErrors.currentPassword = 'Vui lòng nhập mật khẩu hiện tại';
      isValid = false;
    }

    if (!newPassword) {
      newErrors.newPassword = 'Vui lòng nhập mật khẩu mới';
      isValid = false;
    } else if (newPassword.length < 6) {
      newErrors.newPassword = 'Mật khẩu phải có ít nhất 6 ký tự';
      isValid = false;
    }

    if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
      isValid = false;
    }

    if (currentPassword === newPassword && currentPassword !== '') {
      newErrors.newPassword = 'Mật khẩu mới phải khác mật khẩu hiện tại';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleChangePassword = async () => {
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const token = await AuthService.getStoredToken();
      
      // Create FormData for [FromForm] binding
      const formData = new FormData();
      formData.append('MaNguoiDung', user.id);
      formData.append('MatKhauCu', currentPassword);
      formData.append('MatKhauMoi', newPassword);
      formData.append('XacNhanMatKhau', confirmPassword);
      // Required fields that backend needs
      formData.append('HoTen', user.name);
      formData.append('Email', user.email);
      formData.append('VaiTro', user.isAdmin ? '1' : '0');
      formData.append('TrangThai', '1');
      
      const response = await fetch(`${API_URL}/api/NguoiDung/${user.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Change password error:', errorText);
        
        // Parse error message
        let errorMessage = 'Đổi mật khẩu thất bại';
        if (errorText.includes('Mật khẩu cũ không đúng')) {
          errorMessage = 'Mật khẩu hiện tại không đúng';
        } else if (errorText.includes('không khớp')) {
          errorMessage = 'Mật khẩu mới và xác nhận không khớp';
        }
        
        throw new Error(errorMessage);
      }
      
      // Success
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      Toast.show({
        type: 'success',
        text1: 'Thành công',
        text2: 'Đổi mật khẩu thành công',
      });
      handleBack();
    } catch (error: any) {
      console.error('Change password failed:', error);
      
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: error.message || 'Có lỗi xảy ra. Vui lòng thử lại.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <ChevronLeft size={24} color={colors.text} />
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.title}>Đổi mật khẩu</Text>
            <Text style={styles.subtitle}>Tạo mật khẩu mới cho tài khoản của bạn</Text>
          </View>

          <View style={styles.form}>
            <Input
              label="Mật khẩu hiện tại"
              placeholder="Nhập mật khẩu hiện tại"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry
              error={errors.currentPassword}
              leftIcon={<Lock size={20} color={colors.textLight} />}
            />

            <Input
              label="Mật khẩu mới"
              placeholder="Nhập mật khẩu mới"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              error={errors.newPassword}
              leftIcon={<Lock size={20} color={colors.textLight} />}
            />

            <Input
              label="Xác nhận mật khẩu mới"
              placeholder="Nhập lại mật khẩu mới"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              error={errors.confirmPassword}
              leftIcon={<Lock size={20} color={colors.textLight} />}
            />

            <Button
              title="Xác nhận đổi mật khẩu"
              onPress={handleChangePassword}
              loading={isLoading}
              fullWidth
              style={styles.submitButton}
            />
            
            <View style={styles.passwordTips}>
              <Text style={styles.tipsTitle}>Gợi ý bảo mật:</Text>
              <Text style={styles.tipsText}>• Dùng ít nhất 6 ký tự</Text>
              <Text style={styles.tipsText}>• Bao gồm số và ký tự đặc biệt</Text>
              <Text style={styles.tipsText}>• Không dùng lại mật khẩu cũ</Text>
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textLight,
  },
  form: {
    marginBottom: 24,
  },
  passwordTips: {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  tipsText: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 4,
  },
  submitButton: {
    marginTop: 8,
  },
});
