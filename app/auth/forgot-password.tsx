import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Mail, ChevronLeft, ArrowRight, KeyRound, Repeat, Lock, Check } from 'lucide-react-native';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import colors from '@/constants/colors';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const validateEmail = () => {
    if (!email.trim()) {
      setError('Vui lòng nhập email');
      return false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Email không hợp lệ');
      return false;
    }
    setError('');
    return true;
  };

  const validateOtp = () => {
    if (!otp.trim()) {
      setError('Vui lòng nhập mã OTP');
      return false;
    }
    setError('');
    return true;
  };

  const validatePasswords = () => {
    if (!newPassword || !confirmPassword) {
      setError('Vui lòng nhập đầy đủ mật khẩu');
      return false;
    } else if (newPassword.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return false;
    } else if (newPassword !== confirmPassword) {
      setError('Mật khẩu không khớp');
      return false;
    }
    setError('');
    return true;
  };

  const handleSendOtp = () => {
    if (!validateEmail()) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep(2);
      setMessage('Mã OTP đã được gửi đến email của bạn');
    }, 1500);
  };

  const handleVerifyOtp = () => {
    if (!validateOtp()) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep(3);
    }, 1500);
  };

  const handleResetPassword = () => {
    if (!validatePasswords()) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert('Thành công', 'Mật khẩu đã được đặt lại.', [
        { text: 'Đăng nhập', onPress: () => router.replace('/auth/login') },
      ]);
    }, 1500);
  };

  const renderStep1 = () => (
    <>
      <Text style={styles.title}>Quên mật khẩu</Text>
      <Text style={styles.subtitle}>
        Nhập địa chỉ email của bạn để nhận hướng dẫn đặt lại mật khẩu.
      </Text>
      <Input
        label="Email"
        placeholder="Nhập email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        error={error}
        leftIcon={<Mail size={20} color={colors.textLight} />}
      />
      <Button
        title="Gửi mã OTP"
        onPress={handleSendOtp}
        loading={isLoading}
        fullWidth
        style={styles.submitButton}
        leftIcon={<KeyRound size={18} color="#fff" />}
      />
    </>
  );

  const renderStep2 = () => (
    <>
      <Text style={styles.title}>Nhập mã OTP</Text>
      <Text style={styles.subtitle}>Vui lòng kiểm tra email và nhập mã OTP bên dưới.</Text>
      <Input
        label="Mã OTP"
        placeholder="Nhập mã OTP"
        value={otp}
        onChangeText={setOtp}
        error={error}
        leftIcon={<KeyRound size={20} color={colors.textLight} />}
      />
      <Button
        title="Xác nhận mã OTP"
        onPress={handleVerifyOtp}
        loading={isLoading}
        fullWidth
        style={styles.submitButton}
        leftIcon={<Check size={18} color="#fff" />}
      />
      <TouchableOpacity style={styles.resendLink} onPress={handleSendOtp}>
        <Text style={styles.resendText}>Gửi lại Otp</Text>
      </TouchableOpacity>
      {message && <Text style={styles.instructionsText}>{message}</Text>}
    </>
  );

  const renderStep3 = () => (
    <>
      <Text style={styles.title}>Đặt lại mật khẩu</Text>
      <Text style={styles.subtitle}>Nhập mật khẩu mới cho tài khoản của bạn.</Text>
      <Input
        label="Mật khẩu mới"
        placeholder="Nhập mật khẩu mới"
        secureTextEntry
        value={newPassword}
        onChangeText={setNewPassword}
        error={error}
        leftIcon={<Lock size={20} color={colors.textLight} />}
      />
      <Input
        label="Xác nhận mật khẩu"
        placeholder="Nhập lại mật khẩu"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        error={error}
        leftIcon={<Lock size={20} color={colors.textLight} />}
      />
      <Button
        title="Đặt lại mật khẩu"
        onPress={handleResetPassword}
        loading={isLoading}
        fullWidth
        style={styles.submitButton}
        leftIcon={<Repeat size={18} color="#fff" />}
      />
    </>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.form}>
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          <TouchableOpacity
            style={styles.backToLoginContainer}
            onPress={() => router.push('/auth/login')}
          >
            <Text style={styles.backToLoginText}>Quay lại đăng nhập</Text>
            <ArrowRight size={16} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 24 },
  keyboardAvoidingView: { flex: 1 },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 28, fontWeight: 'bold', color: colors.text, marginBottom: 16 },
  subtitle: { fontSize: 16, color: colors.textLight, lineHeight: 24, marginBottom: 16 },
  form: { flex: 1 },
  submitButton: { marginTop: 8, marginBottom: 16 },
  backToLoginContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 16 },
  backToLoginText: { color: colors.primary, fontSize: 16, fontWeight: '500', marginRight: 8 },
  resendLink: { alignSelf: 'center', marginTop: 8 },
  resendText: { color: colors.primary, fontSize: 14 },
  instructionsText: { color: colors.textLight, fontSize: 14, textAlign: 'center', marginTop: 8 },
});
