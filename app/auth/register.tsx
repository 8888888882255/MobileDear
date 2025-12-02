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
import { useRouter } from 'expo-router';
import { Mail, Lock, User, Phone, Check, ChevronLeft, UserPlus } from 'lucide-react-native';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useUserStore } from '@/store/user-store';
import colors from '@/constants/colors';

export default function RegisterScreen() {
  const router = useRouter();
  const { login } = useUserStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    terms: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      terms: '',
    };

    if (!name.trim()) {
      newErrors.name = 'Vui lòng nhập họ tên';
      isValid = false;
    }

    if (!email.trim()) {
      newErrors.email = 'Vui lòng nhập email';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email không hợp lệ';
      isValid = false;
    }

    if (phone.trim() && !/^\d{10,}$/.test(phone.replace(/[^0-9]/g, ''))) {
      newErrors.phone = 'Số điện thoại không hợp lệ';
      isValid = false;
    }

    if (!password) {
      newErrors.password = 'Vui lòng nhập mật khẩu';
      isValid = false;
    } else if (password.length < 6) {
      newErrors.password = 'Mật khẩu tối thiểu 6 ký tự';
      isValid = false;
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu không khớp';
      isValid = false;
    }

    if (!acceptTerms) {
      newErrors.terms = 'Bạn cần đồng ý với điều khoản sử dụng';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleRegister = () => {
    if (!validateForm()) return;
    setIsLoading(true);
    setTimeout(() => {
      const newUser = {
        id: Math.random().toString(36).substr(2, 9),
        name,
        email,
        phone: phone || undefined,
        isAdmin: false,
        addresses: [],
      };
      login(newUser);
      setIsLoading(false);
      Alert.alert('Đăng ký thành công', 'Tài khoản của bạn đã được tạo!', [
        { text: 'OK', onPress: () => router.replace('/') },
      ]);
    }, 1500);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardAvoidingView}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ChevronLeft size={24} color={colors.text} />
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.title}>Tạo tài khoản</Text>
            <Text style={styles.subtitle}>Đăng ký để bắt đầu sử dụng DearMoment</Text>
          </View>

          <View style={styles.form}>
            <Input
              label="Họ tên"
              placeholder="Nhập họ tên"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              error={errors.name}
              leftIcon={<User size={20} color={colors.textLight} />}
            />

            <Input
              label="Email"
              placeholder="Nhập email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
              leftIcon={<Mail size={20} color={colors.textLight} />}
            />

            <Input
              label="Số điện thoại"
              placeholder="Nhập số điện thoại"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              error={errors.phone}
              leftIcon={<Phone size={20} color={colors.textLight} />}
            />

            <Input
              label="Mật khẩu"
              placeholder="Nhập mật khẩu"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              error={errors.password}
              leftIcon={<Lock size={20} color={colors.textLight} />}
            />

            <Input
              label="Mật khẩu xác nhận"
              placeholder="Mật khẩu xác nhận"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              error={errors.confirmPassword}
              leftIcon={<Lock size={20} color={colors.textLight} />}
            />

            <TouchableOpacity style={styles.termsContainer} onPress={() => setAcceptTerms(!acceptTerms)} activeOpacity={0.7}>
              <View style={[styles.checkbox, acceptTerms && styles.checkboxChecked]}>
                {acceptTerms && <Check size={16} color="#fff" />}
              </View>
              <Text style={styles.termsText}>
                Tôi đồng ý với <Text style={styles.termsLink}>Điều khoản</Text> và <Text style={styles.termsLink}>Chính sách bảo mật</Text>
              </Text>
            </TouchableOpacity>
            {errors.terms ? <Text style={styles.termsError}>{errors.terms}</Text> : null}

            <Button
              title="Tạo tài khoản"
              onPress={handleRegister}
              loading={isLoading}
              fullWidth
              style={styles.registerButton}
              leftIcon={<UserPlus size={20} color="#fff" />}
            />

            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Đã có tài khoản? </Text>
              <TouchableOpacity onPress={() => router.push('/auth/login')}>
                <Text style={styles.loginLink}>Đăng nhập</Text>
              </TouchableOpacity>
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
  scrollContent: { flexGrow: 1, padding: 24 },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  header: { marginBottom: 32 },
  title: { fontSize: 28, fontWeight: 'bold', color: colors.text, marginBottom: 8 },
  subtitle: { fontSize: 16, color: colors.textLight },
  form: { marginBottom: 24 },
  termsContainer: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 16, marginBottom: 8 },
  checkbox: {
    width: 20, height: 20, borderRadius: 4, borderWidth: 2, borderColor: colors.border,
    marginRight: 10, justifyContent: 'center', alignItems: 'center', marginTop: 2,
  },
  checkboxChecked: { backgroundColor: colors.primary, borderColor: colors.primary },
  termsText: { flex: 1, fontSize: 14, color: colors.textLight, lineHeight: 20 },
  termsLink: { color: colors.primary, fontWeight: '500' },
  termsError: { color: colors.error, fontSize: 12, marginTop: 4, marginLeft: 30 },
  registerButton: { marginTop: 24, marginBottom: 16 },
  loginContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 8 },
  loginText: { color: colors.textLight, fontSize: 14 },
  loginLink: { color: colors.primary, fontSize: 14, fontWeight: '500' },
});