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
import { Mail, Lock, LogIn, UserPlus, KeyRound, Smartphone, Download } from 'lucide-react-native';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useUserStore } from '@/store/user-store';
import colors from '@/constants/colors';
import { SettingsService } from '@/src/services/settingsService';
import { GiaoDien } from '@/types';

export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoading } = useUserStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({ email: '', password: '' });
  const [logo, setLogo] = useState<GiaoDien | null>(null);

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

  const getLogoUrl = (path: string) => {
    return SettingsService.getImageUrl(path);
  };

  const openAppStore = () => {
    const appStoreUrl = Platform.OS === 'ios'
      ? 'https://apps.apple.com/app/your-app-id' // Replace with actual App Store URL
      : 'https://play.google.com/store/apps/details?id=com.yourcompany.yourapp'; // Replace with actual Play Store URL

    if (Platform.OS === 'web') {
      window.open(appStoreUrl, '_blank');
    } else {
      // For React Native, you might need to use Linking
      // Linking.openURL(appStoreUrl);
      Alert.alert('Thông báo', `Mở ${Platform.OS === 'ios' ? 'App Store' : 'Google Play'} để tải app`);
    }
  };

  const AppStoreBanner = () => {
    if (Platform.OS === 'web') {
      return (
        <View style={styles.appStoreContainer}>
          <TouchableOpacity style={styles.appStoreBanner} onPress={openAppStore}>
            <Smartphone size={24} color={colors.primary} />
            <View style={styles.appStoreContent}>
              <Text style={styles.appStoreTitle}>Tải app để trải nghiệm tốt hơn</Text>
              <Text style={styles.appStoreSubtitle}>Nhận thông báo, đồng bộ dữ liệu và nhiều tính năng hơn</Text>
            </View>
            <View style={styles.appStoreButton}>
              <Download size={16} color="#fff" />
              <Text style={styles.appStoreButtonText}>Tải ngay</Text>
            </View>
          </TouchableOpacity>
        </View>
      );
    }

    // For native apps, show a different message or hide
    return (
      <View style={styles.nativeAppBanner}>
        <Smartphone size={20} color={colors.primary} />
        <Text style={styles.nativeAppText}>Bạn đang sử dụng phiên bản di động</Text>
      </View>
    );
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

          <AppStoreBanner />
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
  logo: { width: 150, height: 150, marginBottom: 24, borderRadius: 75 },
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
  appStoreContainer: { marginTop: 32 },
  appStoreBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + '10',
    borderWidth: 1,
    borderColor: colors.primary + '30',
    borderRadius: 12,
    padding: 16,
  },
  appStoreContent: { flex: 1, marginLeft: 12 },
  appStoreTitle: { fontSize: 16, fontWeight: 'bold', color: colors.text, marginBottom: 4 },
  appStoreSubtitle: { fontSize: 14, color: colors.textLight },
  appStoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  appStoreButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  nativeAppBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 12,
    marginTop: 32,
  },
  nativeAppText: { fontSize: 14, color: colors.textLight, marginLeft: 8 },
  demoCredentials: {
    marginTop: 40, padding: 16, backgroundColor: colors.card, borderRadius: 8,
    borderLeftWidth: 4, borderLeftColor: colors.primary,
  },
  demoTitle: { fontSize: 16, fontWeight: 'bold', color: colors.text, marginBottom: 8 },
  demoText: { fontSize: 14, color: colors.textLight, marginBottom: 4 },
});
