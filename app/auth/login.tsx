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
  const { login } = useUserStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    let isValid = true;
    const newErrors = { email: '', password: '' };

    if (!email.trim()) {
      newErrors.email = 'Vui lòng nhập email';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email không hợp lệ';
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

  const handleLogin = () => {
    if (!validateForm()) return;

    setIsLoading(true);

    setTimeout(() => {
      if (email === 'admin@example.com' && password === 'password') {
        login({
          id: '1',
          name: 'Quản trị viên',
          email: 'admin@example.com',
          isAdmin: true,
          addresses: [],
        });
        router.replace('/');
      } else if (email === 'user@example.com' && password === 'password') {
        login({
          id: '2',
          name: 'Người dùng',
          email: 'user@example.com',
          isAdmin: false,
          addresses: [],
        });
        router.replace('/');
      } else {
        Alert.alert(
          'Đăng nhập thất bại',
          "Email hoặc mật khẩu không đúng. Vui lòng thử lại với admin@example.com hoặc user@example.com và mật khẩu 'password'."
        );
      }
      setIsLoading(false);
    }, 1500);
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
              <Text style={styles.forgotPasswordText}>
                <KeyRound size={16} color={colors.primary} /> Quên mật khẩu?
              </Text>
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
              <Text style={styles.registerText}>Bạn chưa có tài khoản? </Text>
              <TouchableOpacity onPress={() => router.push('/auth/register')}>
                <Text style={styles.registerLink}>
                  <UserPlus size={16} color={colors.primary} /> Đăng ký
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.demoCredentials}>
            <Text style={styles.demoTitle}>Tài khoản demo:</Text>
            <Text style={styles.demoText}>Quản trị: admin@example.com / password</Text>
            <Text style={styles.demoText}>Người dùng: user@example.com / password</Text>
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
  forgotPasswordText: { color: colors.primary, fontSize: 14 },
  loginButton: { marginBottom: 16 },
  registerContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 8 },
  registerText: { color: colors.textLight, fontSize: 14 },
  registerLink: { color: colors.primary, fontSize: 14, fontWeight: '500' },
  demoCredentials: {
    marginTop: 40, padding: 16, backgroundColor: colors.card, borderRadius: 8,
    borderLeftWidth: 4, borderLeftColor: colors.primary,
  },
  demoTitle: { fontSize: 16, fontWeight: 'bold', color: colors.text, marginBottom: 8 },
  demoText: { fontSize: 14, color: colors.textLight, marginBottom: 4 },
});