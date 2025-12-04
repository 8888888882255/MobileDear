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
import { Mail, Lock, LogIn, UserPlus, KeyRound } from 'lucide-react-native';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useUserStore } from '@/store/user-store';
import colors from '@/constants/colors';

export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoading } = useUserStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({ email: '', password: '' });

  const validateForm = () => {
    let isValid = true;
    const newErrors = { email: '', password: '' };

    if (!email.trim()) {
      newErrors.email = 'Vui lòng nhập email hoặc tên tài khoản.';
      isValid = false;
    }

    if (!password) {
      newErrors.password = 'Vui lòng nhập mật khẩu';
      isValid = false;
    } else if (password.length < 6) {
      newErrors.password = 'Mật khẩu tối thiểu 6 ký tự';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    try {
      const success = await login(email, password);
      
      if (success) {
        // Navigate immediately on success
        router.replace('/');
      } else {
        if (Platform.OS === 'web') {
          window.alert('Email/Tài khoản hoặc mật khẩu không đúng. Vui lòng thử lại.');
        } else {
          Alert.alert(
            'Đăng nhập thất bại',
            'Email/Tài khoản hoặc mật khẩu không đúng. Vui lòng thử lại.'
          );
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = 'Có lỗi xảy ra khi đăng nhập. Vui lòng kiểm tra kết nối mạng và thử lại.';
      if (Platform.OS === 'web') {
        window.alert(errorMessage);
      } else {
        Alert.alert('Lỗi', errorMessage);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>Chào mừng trở lại</Text>
            <Text style={styles.subtitle}>Đăng nhập vào tài khoản của bạn</Text>
          </View>

          <View style={styles.form}>
            <Input
              label="Email hoặc Tài khoản"
              placeholder="Nhập email hoặc tài khoản"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
              leftIcon={<Mail size={20} color={colors.textLight} />}
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

            <TouchableOpacity
              style={styles.forgotPasswordButton}
              onPress={() => router.push('/auth/forgot-password')}
            >
              <View style={styles.forgotPasswordContent}>
                <KeyRound size={16} color={colors.primary} />
                <Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
              </View>
            </TouchableOpacity>

            <Button
              title="Đăng nhập"
              onPress={handleLogin}
              loading={isLoading}
              fullWidth
              style={styles.loginButton}
              leftIcon={<LogIn size={20} color="#fff" />}
            />

            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>Bạn chưa có tài khoản?</Text>
              <TouchableOpacity onPress={() => router.push('/auth/register')} style={styles.registerLinkContainer}>
                <UserPlus size={16} color={colors.primary} />
                <Text style={styles.registerLink}> Đăng ký</Text>
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
  header: { marginBottom: 32, alignItems: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', color: colors.text, marginBottom: 8 },
  subtitle: { fontSize: 16, color: colors.textLight },
  form: { marginBottom: 24 },
  forgotPasswordButton: { alignSelf: 'flex-end', marginBottom: 24 },
  forgotPasswordContent: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  forgotPasswordText: { color: colors.primary, fontSize: 14, marginLeft: 4 },
  loginButton: { marginBottom: 16 },
  registerContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 8 },
  registerText: { color: colors.textLight, fontSize: 14 },
  registerLinkContainer: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  registerLink: { color: colors.primary, fontSize: 14, fontWeight: '500', marginLeft: 4 },
  demoCredentials: {
    marginTop: 40, padding: 16, backgroundColor: colors.card, borderRadius: 8,
    borderLeftWidth: 4, borderLeftColor: colors.primary,
  },
  demoTitle: { fontSize: 16, fontWeight: 'bold', color: colors.text, marginBottom: 8 },
  demoText: { fontSize: 14, color: colors.textLight, marginBottom: 4 },
});
