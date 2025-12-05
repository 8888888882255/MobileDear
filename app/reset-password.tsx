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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Lock, ArrowLeft, CheckCircle, Mail } from 'lucide-react-native';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { AuthService } from '@/src/services/authService';
import colors from '@/constants/colors';

interface ResetPasswordData {
  email: string;
  otp: string;
  matKhauMoi: string;
  xacNhanMatKhau: string;
}

export default function ResetPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState<ResetPasswordData>({
    email: (params.email as string) || '',
    otp: (params.otp as string) || '',
    matKhauMoi: '',
    xacNhanMatKhau: ''
  });

  const [errors, setErrors] = useState({
    email: '',
    otp: '',
    matKhauMoi: '',
    xacNhanMatKhau: ''
  });

  useEffect(() => {
    if (params.email) {
      setFormData(prev => ({ ...prev, email: params.email as string }));
    }
    if (params.otp) {
      setFormData(prev => ({ ...prev, otp: params.otp as string }));
    }
  }, [params.email, params.otp]);

  const updateField = (field: keyof ResetPasswordData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    let isValid = true;
    const newErrors = {
      email: '',
      otp: '',
      matKhauMoi: '',
      xacNhanMatKhau: ''
    };

    // Validate Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email là bắt buộc';
      isValid = false;
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
      isValid = false;
    }

    // Validate OTP
    if (!formData.otp.trim()) {
      newErrors.otp = 'Mã OTP là bắt buộc';
      isValid = false;
    } else if (formData.otp.length !== 6) {
      newErrors.otp = 'Mã OTP phải có 6 chữ số';
      isValid = false;
    }

    // Validate Mật khẩu mới
    if (!formData.matKhauMoi) {
      newErrors.matKhauMoi = 'Mật khẩu mới là bắt buộc';
      isValid = false;
    } else if (formData.matKhauMoi.length < 8) {
      newErrors.matKhauMoi = 'Mật khẩu phải từ 8 ký tự trở lên';
      isValid = false;
    } else {
      // Kiểm tra mật khẩu mạnh
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!passwordRegex.test(formData.matKhauMoi)) {
        newErrors.matKhauMoi = 'Mật khẩu phải chứa ít nhất 1 chữ thường, 1 chữ hoa, 1 số và 1 ký tự đặc biệt';
        isValid = false;
      }
    }

    // Validate Xác nhận mật khẩu
    if (!formData.xacNhanMatKhau) {
      newErrors.xacNhanMatKhau = 'Vui lòng xác nhận mật khẩu';
      isValid = false;
    } else if (formData.matKhauMoi !== formData.xacNhanMatKhau) {
      newErrors.xacNhanMatKhau = 'Mật khẩu xác nhận không khớp';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleResetPassword = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const resetData = {
        email: formData.email,
        otp: formData.otp,
        matKhauMoi: formData.matKhauMoi,
        xacNhanMatKhau: formData.xacNhanMatKhau
      };

      await AuthService.resetPassword(resetData);
      
      // Show success message
      if (Platform.OS === 'web') {
        window.alert('Đặt lại mật khẩu thành công! Bạn có thể đăng nhập với mật khẩu mới.');
      } else {
        Alert.alert(
          'Thành công',
          'Mật khẩu đã được đặt lại thành công! Bạn có thể đăng nhập với mật khẩu mới.'
        );
      }
      
      // Navigate to login screen (works for both web and mobile)
      router.replace('/auth/login');
    } catch (error: any) {
      console.error('Reset password error:', error);
      
      let errorMessage = 'Có lỗi xảy ra khi đặt lại mật khẩu. Vui lòng thử lại.';
      
      if (error.message) {
        if (error.message.includes('OTP không hợp lệ') || error.message.includes('đã hết hạn')) {
          errorMessage = 'Mã OTP không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu mã OTP mới.';
        } else if (error.message.includes('Email không tồn tại')) {
          errorMessage = 'Email không tồn tại trong hệ thống.';
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
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!formData.email.trim()) {
      if (Platform.OS === 'web') {
        window.alert('Vui lòng nhập email trước khi gửi lại mã OTP.');
      } else {
        Alert.alert('Lỗi', 'Vui lòng nhập email trước khi gửi lại mã OTP.');
      }
      return;
    }

    setIsLoading(true);
    try {
      await AuthService.forgotPassword(formData.email);
      
      if (Platform.OS === 'web') {
        window.alert('Mã OTP mới đã được gửi đến email của bạn.');
      } else {
        Alert.alert(
          'Thành công',
          'Mã OTP mới đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư.',
          [{ text: 'OK' }]
        );
      }
    } catch (error: any) {
      console.error('Resend OTP error:', error);
      
      let errorMessage = 'Không thể gửi lại mã OTP. Vui lòng thử lại.';
      
      if (error.message && error.message.includes('Email không tồn tại')) {
        errorMessage = 'Email không tồn tại trong hệ thống.';
      }

      if (Platform.OS === 'web') {
        window.alert(errorMessage);
      } else {
        Alert.alert('Lỗi', errorMessage);
      }
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
          {/* Header with back button */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <ArrowLeft size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <Text style={styles.title}>Đặt lại mật khẩu</Text>
            <Text style={styles.subtitle}>
              {formData.otp ? 
                'Mã OTP đã được xác thực. Vui lòng nhập mật khẩu mới của bạn' :
                'Nhập mã OTP đã gửi đến email và mật khẩu mới của bạn'
              }
            </Text>

            <View style={styles.form}>
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

              {formData.otp ? (
                <View style={styles.otpDisplay}>
                  <Text style={styles.otpLabel}>Mã OTP đã xác thực:</Text>
                  <Text style={styles.otpValue}>{formData.otp}</Text>
                </View>
              ) : (
                <Input
                  label="Mã OTP"
                  placeholder="Nhập mã OTP 6 chữ số"
                  value={formData.otp}
                  onChangeText={(value) => {
                    // Only allow numbers and limit to 6 digits
                    const numericValue = value.replace(/[^0-9]/g, '').slice(0, 6);
                    updateField('otp', numericValue);
                  }}
                  keyboardType="numeric"
                  error={errors.otp}
                  leftIcon={<CheckCircle size={20} color={colors.textLight} />}
                />
              )}

              <Input
                label="Mật khẩu mới"
                placeholder="Nhập mật khẩu mới"
                value={formData.matKhauMoi}
                onChangeText={(value) => updateField('matKhauMoi', value)}
                secureTextEntry
                error={errors.matKhauMoi}
                leftIcon={<Lock size={20} color={colors.textLight} />}
              />

              <Input
                label="Xác nhận mật khẩu mới"
                placeholder="Nhập lại mật khẩu mới"
                value={formData.xacNhanMatKhau}
                onChangeText={(value) => updateField('xacNhanMatKhau', value)}
                secureTextEntry
                error={errors.xacNhanMatKhau}
                leftIcon={<Lock size={20} color={colors.textLight} />}
              />

              <Button
                title="Đặt lại mật khẩu"
                onPress={handleResetPassword}
                loading={isLoading}
                fullWidth
                style={styles.resetButton}
                leftIcon={<CheckCircle size={20} color="#fff" />}
              />

              <TouchableOpacity 
                style={styles.resendButton} 
                onPress={handleResendOTP}
                disabled={isLoading}
              >
                <Text style={styles.resendText}>
                  Không nhận được mã OTP? <Text style={styles.resendLink}>Gửi lại</Text>
                </Text>
              </TouchableOpacity>

              <View style={styles.passwordHint}>
                <Text style={styles.hintTitle}>Mật khẩu phải có:</Text>
                <Text style={styles.hintText}>• Ít nhất 8 ký tự</Text>
                <Text style={styles.hintText}>• 1 chữ thường, 1 chữ hoa</Text>
                <Text style={styles.hintText}>• 1 số, 1 ký tự đặc biệt (@$!%*?&)</Text>
              </View>
            </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.card,
  },
  content: { paddingHorizontal: 24, paddingBottom: 24 },
  title: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    color: colors.text, 
    marginBottom: 8,
    marginTop: 24,
  },
  subtitle: { 
    fontSize: 16, 
    color: colors.textLight, 
    marginBottom: 32,
    lineHeight: 24,
  },
  form: { marginBottom: 24 },
  resetButton: { marginBottom: 16 },
  resendButton: { alignItems: 'center', marginBottom: 24 },
  resendText: { color: colors.textLight, fontSize: 14 },
  resendLink: { color: colors.primary, fontWeight: '500' },
  passwordHint: {
    padding: 16,
    backgroundColor: colors.card,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  hintTitle: { fontSize: 14, fontWeight: 'bold', color: colors.text, marginBottom: 8 },
  hintText: { fontSize: 12, color: colors.textLight, marginBottom: 2 },
  otpDisplay: {
    padding: 16,
    backgroundColor: colors.card,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    marginBottom: 16,
  },
  otpLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  otpValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    letterSpacing: 8,
    textAlign: 'center',
  },
});