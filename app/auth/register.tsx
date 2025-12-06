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
import { useRouter } from 'expo-router';
import { Mail, Lock, User, UserPlus } from 'lucide-react-native';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { AuthService } from '@/src/services/authService';
import colors from '@/constants/colors';
import { SettingsService } from '@/src/services/settingsService';
import { GiaoDien } from '@/types';

interface RegisterFormData {
  hoTen: string;
  email: string;
  taiKhoan: string;
  matKhau: string;
  xacNhanMatKhau: string;
  vaiTro: number;
}

export default function RegisterScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [logo, setLogo] = useState<GiaoDien | null>(null);

  const [formData, setFormData] = useState<RegisterFormData>({
    hoTen: '',
    email: '',
    taiKhoan: '',
    matKhau: '',
    xacNhanMatKhau: '',
    vaiTro: 2 // Mặc định là User
  });

  const [errors, setErrors] = useState({
    hoTen: '',
    email: '',
    taiKhoan: '',
    matKhau: '',
    xacNhanMatKhau: ''
  });

  useEffect(() => {
    loadLogo();
  }, []);

  const loadLogo = async () => {
    try {
      const logos = await SettingsService.getActiveLogos();
      if (logos && logos.length > 0) {
        setLogo(logos[0]);
      }
    } catch (error) {
      console.error('Error loading logo:', error);
    }
  };

  const updateField = (field: keyof RegisterFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing (only for string fields)
    if (field in errors && typeof field === 'string' && errors[field as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    let isValid = true;
    const newErrors = {
      hoTen: '',
      email: '',
      taiKhoan: '',
      matKhau: '',
      xacNhanMatKhau: ''
    };

    // Validate Họ tên
    if (!formData.hoTen.trim()) {
      newErrors.hoTen = 'Họ tên là bắt buộc';
      isValid = false;
    } else if (formData.hoTen.length > 100) {
      newErrors.hoTen = 'Họ tên không được vượt quá 100 ký tự';
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

    // Validate Tài khoản
    if (!formData.taiKhoan.trim()) {
      newErrors.taiKhoan = 'Tài khoản là bắt buộc';
      isValid = false;
    } else if (formData.taiKhoan.length > 50) {
      newErrors.taiKhoan = 'Tài khoản không được vượt quá 50 ký tự';
      isValid = false;
    }

    // Validate Mật khẩu
    if (!formData.matKhau) {
      newErrors.matKhau = 'Mật khẩu là bắt buộc';
      isValid = false;
    } else if (formData.matKhau.length < 8) {
      newErrors.matKhau = 'Mật khẩu phải từ 8 ký tự trở lên';
      isValid = false;
    } else {
      // Kiểm tra mật khẩu mạnh (ít nhất 1 chữ thường, 1 chữ hoa, 1 số, 1 ký tự đặc biệt)
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!passwordRegex.test(formData.matKhau)) {
        newErrors.matKhau = 'Mật khẩu phải chứa ít nhất 1 chữ thường, 1 chữ hoa, 1 số và 1 ký tự đặc biệt';
        isValid = false;
      }
    }

    // Validate Xác nhận mật khẩu
    if (!formData.xacNhanMatKhau) {
      newErrors.xacNhanMatKhau = 'Vui lòng xác nhận mật khẩu';
      isValid = false;
    } else if (formData.matKhau !== formData.xacNhanMatKhau) {
      newErrors.xacNhanMatKhau = 'Mật khẩu xác nhận không khớp';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // Prepare data for API
      const registerData = {
        hoTen: formData.hoTen,
        email: formData.email,
        taiKhoan: formData.taiKhoan,
        matKhau: formData.matKhau,
        vaiTro: formData.vaiTro
      };

      const result = await AuthService.register(registerData);
      
      if (result) {
        // Show success message
        if (Platform.OS === 'web') {
          window.alert('Đăng ký thành công! Vui lòng đăng nhập với tài khoản vừa tạo.');
        } else {
          Alert.alert(
            'Đăng ký thành công',
            'Tài khoản của bạn đã được tạo thành công. Vui lòng đăng nhập để tiếp tục.'
          );
        }
        
        // Navigate to login screen (works for both web and mobile)
        router.replace('/auth/login');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      
      let errorMessage = 'Có lỗi xảy ra khi đăng ký. Vui lòng thử lại.';
      
      if (error.message) {
        if (error.message.includes('Tài khoản đã tồn tại')) {
          errorMessage = 'Tài khoản đã tồn tại. Vui lòng chọn tài khoản khác.';
        } else if (error.message.includes('Email đã tồn tại')) {
          errorMessage = 'Email đã được sử dụng. Vui lòng sử dụng email khác.';
        } else {
          errorMessage = error.message;
        }
      }

      if (Platform.OS === 'web') {
        window.alert(errorMessage);
      } else {
        Alert.alert('Lỗi đăng ký', errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getLogoUrl = (path: string) => {
    return SettingsService.getImageUrl(path);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            {logo && logo.medias && logo.medias.length > 0 ? (
              <Image
                source={{ uri: getLogoUrl(logo.medias[0].duongDan) }}
                style={styles.logo}
                resizeMode="contain"
              />
            ) : null}
            <Text style={styles.title}>Tạo tài khoản mới</Text>
            <Text style={styles.subtitle}>Đăng ký để trở thành thành viên của chúng tôi</Text>
          </View>

          <View style={styles.form}>
            <Input
              label="Họ và tên"
              placeholder="Nhập họ và tên của bạn"
              value={formData.hoTen}
              onChangeText={(value) => updateField('hoTen', value)}
              autoCapitalize="words"
              error={errors.hoTen}
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
              label="Tài khoản"
              placeholder="Nhập tên tài khoản"
              value={formData.taiKhoan}
              onChangeText={(value) => updateField('taiKhoan', value)}
              autoCapitalize="none"
              error={errors.taiKhoan}
              leftIcon={<User size={20} color={colors.textLight} />}
            />

            <Input
              label="Mật khẩu"
              placeholder="Nhập mật khẩu"
              value={formData.matKhau}
              onChangeText={(value) => updateField('matKhau', value)}
              secureTextEntry
              error={errors.matKhau}
              leftIcon={<Lock size={20} color={colors.textLight} />}
            />

            <Input
              label="Xác nhận mật khẩu"
              placeholder="Nhập lại mật khẩu"
              value={formData.xacNhanMatKhau}
              onChangeText={(value) => updateField('xacNhanMatKhau', value)}
              secureTextEntry
              error={errors.xacNhanMatKhau}
              leftIcon={<Lock size={20} color={colors.textLight} />}
            />

            <Button
              title="Đăng ký"
              onPress={handleRegister}
              loading={isLoading}
              fullWidth
              style={styles.registerButton}
              leftIcon={<UserPlus size={20} color="#fff" />}
            />

            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Đã có tài khoản?</Text>
              <TouchableOpacity onPress={() => router.push('/auth/login')} style={styles.loginLinkContainer}>
                <Text style={styles.loginLink}> Đăng nhập</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.passwordHint}>
              <Text style={styles.hintTitle}>Mật khẩu phải có:</Text>
              <Text style={styles.hintText}>• Ít nhất 8 ký tự</Text>
              <Text style={styles.hintText}>• 1 chữ thường, 1 chữ hoa</Text>
              <Text style={styles.hintText}>• 1 số, 1 ký tự đặc biệt (@$!%*?&)</Text>
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
  scrollContent: { flexGrow: 1, padding: 24, justifyContent: 'center' },
  header: { marginBottom: 32, alignItems: 'center' },
  logo: { width: 120, height: 120, marginBottom: 24, borderRadius: 60 },
  title: { fontSize: 28, fontWeight: 'bold', color: colors.text, marginBottom: 8 },
  subtitle: { fontSize: 16, color: colors.textLight, textAlign: 'center' },
  form: { marginBottom: 24 },
  registerButton: { marginBottom: 16 },
  loginContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 8 },
  loginText: { color: colors.textLight, fontSize: 14 },
  loginLinkContainer: { flexDirection: 'row', alignItems: 'center' },
  loginLink: { color: colors.primary, fontSize: 14, fontWeight: '500', marginLeft: 4 },
  passwordHint: {
    marginTop: 20,
    padding: 16,
    backgroundColor: colors.card,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  hintTitle: { fontSize: 14, fontWeight: 'bold', color: colors.text, marginBottom: 8 },
  hintText: { fontSize: 12, color: colors.textLight, marginBottom: 2 },
});