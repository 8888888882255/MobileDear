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
import { ArrowLeft, CheckCircle, RefreshCw } from 'lucide-react-native';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { AuthService } from '@/src/services/authService';
import colors from '@/constants/colors';

export default function OTPVerificationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  const [email, setEmail] = useState((params.email as string) || '');
  const [otp, setOtp] = useState('');
  const [errors, setErrors] = useState({
    email: '',
    otp: ''
  });

  useEffect(() => {
    if (params.email) {
      setEmail(params.email as string);
    }
  }, [params.email]);

  const validateForm = (): boolean => {
    let isValid = true;
    const newErrors = {
      email: '',
      otp: ''
    };

    // Validate Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      newErrors.email = 'Email là bắt buộc';
      isValid = false;
    } else if (!emailRegex.test(email)) {
      newErrors.email = 'Email không hợp lệ';
      isValid = false;
    }

    // Validate OTP
    if (!otp.trim()) {
      newErrors.otp = 'Mã OTP là bắt buộc';
      isValid = false;
    } else if (otp.length !== 6) {
      newErrors.otp = 'Mã OTP phải có 6 chữ số';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleVerifyOTP = async () => {
    if (!validateForm()) return;

    // For now, we'll just navigate to reset password screen with email and otp
    // In real implementation, you might want to verify OTP here first
    router.replace({
      pathname: '/reset-password',
      params: { email, otp }
    });
  };

  const handleResendOTP = async () => {
    if (!email.trim()) {
      if (Platform.OS === 'web') {
        window.alert('Vui lòng nhập email trước khi gửi lại mã OTP.');
      } else {
        Alert.alert('Lỗi', 'Vui lòng nhập email trước khi gửi lại mã OTP.');
      }
      return;
    }

    setIsLoading(true);
    try {
      await AuthService.forgotPassword(email);
      
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

  const updateField = (field: 'email' | 'otp', value: string) => {
    if (field === 'email') {
      setEmail(value);
    } else {
      // Only allow numbers and limit to 6 digits
      const numericValue = value.replace(/[^0-9]/g, '').slice(0, 6);
      setOtp(numericValue);
    }
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
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
            <Text style={styles.title}>Xác thực mã OTP</Text>
            <Text style={styles.subtitle}>
              Nhập mã OTP đã được gửi đến email của bạn để tiếp tục đặt lại mật khẩu
            </Text>

            <View style={styles.form}>
              <Input
                label="Email"
                placeholder="Nhập địa chỉ email"
                value={email}
                onChangeText={(value) => updateField('email', value)}
                keyboardType="email-address"
                autoCapitalize="none"
                error={errors.email}
              />

              <Input
                label="Mã OTP"
                placeholder="Nhập mã OTP 6 chữ số"
                value={otp}
                onChangeText={(value) => updateField('otp', value)}
                keyboardType="numeric"
                error={errors.otp}
                leftIcon={<CheckCircle size={20} color={colors.textLight} />}
              />

              <Button
                title="Xác thực và tiếp tục"
                onPress={handleVerifyOTP}
                loading={isLoading}
                fullWidth
                style={styles.verifyButton}
                leftIcon={<CheckCircle size={20} color="#fff" />}
              />

              <TouchableOpacity 
                style={styles.resendButton} 
                onPress={handleResendOTP}
                disabled={isLoading}
              >
                <RefreshCw 
                  size={16} 
                  color={colors.primary} 
                  style={isLoading ? { transform: [{ rotate: '360deg' }] } : undefined}
                />
                <Text style={styles.resendText}>
                  {isLoading ? 'Đang gửi...' : 'Không nhận được mã OTP? Gửi lại'}
                </Text>
              </TouchableOpacity>

              <View style={styles.instructions}>
                <Text style={styles.instructionsTitle}>Hướng dẫn:</Text>
                <Text style={styles.instructionsText}>• Kiểm tra hộp thư đến và thư mục spam</Text>
                <Text style={styles.instructionsText}>• Mã OTP có hiệu lực trong 5 phút</Text>
                <Text style={styles.instructionsText}>• Nhập đầy đủ 6 chữ số của mã OTP</Text>
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
  verifyButton: { marginBottom: 16 },
  resendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginBottom: 24,
  },
  resendText: { 
    color: colors.primary, 
    fontSize: 14, 
    fontWeight: '500',
    marginLeft: 8,
  },
  instructions: {
    padding: 16,
    backgroundColor: colors.card,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  instructionsTitle: { 
    fontSize: 14, 
    fontWeight: 'bold', 
    color: colors.text, 
    marginBottom: 8 
  },
  instructionsText: { 
    fontSize: 12, 
    color: colors.textLight, 
    marginBottom: 4, 
    lineHeight: 18 
  },
});