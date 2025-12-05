import React, { useState } from "react";
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
} from "react-native";
import { useRouter } from "expo-router";
import { Mail, ArrowLeft, Send } from "lucide-react-native";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { AuthService } from "@/src/services/authService";
import colors from "@/constants/colors";

interface ForgotPasswordData {
  email: string;
}

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");

  const validateEmail = (): boolean => {
    let isValid = true;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email.trim()) {
      setEmailError("Email là bắt buộc");
      isValid = false;
    } else if (!emailRegex.test(email)) {
      setEmailError("Email không hợp lệ");
      isValid = false;
    } else {
      setEmailError("");
    }

    return isValid;
  };

  const handleSendOTP = async () => {
    if (!validateEmail()) return;

    setIsLoading(true);
    try {
      await AuthService.forgotPassword(email);

      // Show success message
      if (Platform.OS === "web") {
        window.alert(
          "Mã OTP đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư."
        );
      } else {
        Alert.alert(
          "Thành công",
          "Mã OTP đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư và nhập mã để đặt lại mật khẩu."
        );
      }

      // Navigate to OTP verification screen with email (works for both web and mobile)
      // @ts-ignore - temporarily ignore routing type issue
      router.replace({
        pathname: "/auth/otp-verification",
        params: { email },
      });
    } catch (error: any) {
      console.error("Forgot password error:", error);

      let errorMessage = "Có lỗi xảy ra khi gửi OTP. Vui lòng thử lại.";

      if (error.message) {
        if (error.message.includes("Email không tồn tại")) {
          errorMessage =
            "Email không tồn tại trong hệ thống. Vui lòng kiểm tra lại.";
        } else {
          errorMessage = error.message;
        }
      }

      if (Platform.OS === "web") {
        window.alert(errorMessage);
      } else {
        Alert.alert("Lỗi", errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
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
            <Text style={styles.title}>Quên mật khẩu</Text>
            <Text style={styles.subtitle}>
              Nhập email của bạn và chúng tôi sẽ gửi mã OTP để đặt lại mật khẩu
            </Text>

            <View style={styles.form}>
              <Input
                label="Email"
                placeholder="Nhập địa chỉ email của bạn"
                value={email}
                onChangeText={(value) => {
                  setEmail(value);
                  if (emailError) setEmailError("");
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                error={emailError}
                leftIcon={<Mail size={20} color={colors.textLight} />}
              />

              <Button
                title="Gửi mã OTP"
                onPress={handleSendOTP}
                loading={isLoading}
                fullWidth
                style={styles.sendButton}
                leftIcon={<Send size={20} color="#fff" />}
              />

              <View style={styles.helpText}>
                <Text style={styles.helpTitle}>Bạn cần biết:</Text>
                <Text style={styles.helpItem}>
                  • Mã OTP có hiệu lực trong 5 phút
                </Text>
                <Text style={styles.helpItem}>
                  • Kiểm tra cả thư mục spam nếu không thấy email
                </Text>
                <Text style={styles.helpItem}>
                  • Liên hệ hỗ trợ nếu vẫn không nhận được email
                </Text>
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
    flexDirection: "row",
    alignItems: "center",
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
    fontWeight: "bold",
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
  sendButton: { marginBottom: 24 },
  helpText: {
    padding: 16,
    backgroundColor: colors.card,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  helpTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 8,
  },
  helpItem: {
    fontSize: 12,
    color: colors.textLight,
    marginBottom: 4,
    lineHeight: 18,
  },
});
