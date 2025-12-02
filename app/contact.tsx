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
  TextInput
} from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, User, Mail, MessageSquare, Send, Paperclip } from 'lucide-react-native';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import colors from '@/constants/colors';

export default function ContactScreen() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      name: '',
      email: '',
      subject: '',
      message: ''
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

    if (!subject.trim()) {
      newErrors.subject = 'Vui lòng nhập tiêu đề';
      isValid = false;
    }

    if (!message.trim()) {
      newErrors.message = 'Vui lòng nhập nội dung tin nhắn';
      isValid = false;
    } else if (message.length < 10) {
      newErrors.message = 'Nội dung phải có ít nhất 10 ký tự';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      Alert.alert(
        'Đã gửi tin nhắn',
        'Cảm ơn bạn đã liên hệ. Chúng tôi sẽ phản hồi sớm nhất!',
        [{
          text: 'OK',
          onPress: () => {
            setName('');
            setEmail('');
            setSubject('');
            setMessage('');
            router.back();
          }
        }]
      );
    }, 1500);
  };

  const handleAttachment = () => {
    Alert.alert('Tính năng đính kèm', 'Tính năng này chưa khả dụng trong phiên bản demo', [{ text: 'Đồng ý' }]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ChevronLeft size={24} color={colors.text} />
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.title}>Liên hệ hỗ trợ</Text>
            <Text style={styles.subtitle}>
              Hãy gửi tin nhắn cho chúng tôi và chúng tôi sẽ phản hồi sớm nhất có thể.
            </Text>
          </View>

          <View style={styles.form}>
            <Input
              label="Họ tên"
              placeholder="Nhập họ tên của bạn"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              error={errors.name}
              leftIcon={<User size={20} color={colors.textLight} />}
            />

            <Input
              label="Email"
              placeholder="Nhập email của bạn"
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
              value={subject}
              onChangeText={setSubject}
              error={errors.subject}
              leftIcon={<MessageSquare size={20} color={colors.textLight} />}
            />

            <View style={styles.textAreaContainer}>
              <Text style={styles.label}>Nội dung</Text>
              <View style={[styles.textAreaWrapper, errors.message ? styles.textAreaError : null]}>
                <TextInput
                  style={styles.textArea}
                  placeholder="Nhập nội dung cần hỗ trợ..."
                  value={message}
                  onChangeText={setMessage}
                  multiline
                  numberOfLines={6}
                  textAlignVertical="top"
                  placeholderTextColor="#999"
                />
              </View>
              {errors.message ? <Text style={styles.errorText}>{errors.message}</Text> : null}
            </View>

            <TouchableOpacity style={styles.attachmentButton} onPress={handleAttachment}>
              <Paperclip size={20} color={colors.primary} />
              <Text style={styles.attachmentText}>Đính kèm tệp</Text>
            </TouchableOpacity>

            <Button
              title="Gửi tin nhắn"
              onPress={handleSubmit}
              loading={isLoading}
              fullWidth
              style={styles.submitButton}
              leftIcon={<Send size={18} color="#fff" />}
            />
          </View>

          <View style={styles.contactInfoContainer}>
            <Text style={styles.contactInfoTitle}>Thông tin liên hệ khác</Text>

            <View style={styles.contactInfoItem}>
              <Text style={styles.contactInfoLabel}>Email CSKH:</Text>
              <Text style={styles.contactInfoValue}>support@crocus.com</Text>
            </View>

            <View style={styles.contactInfoItem}>
              <Text style={styles.contactInfoLabel}>Điện thoại:</Text>
              <Text style={styles.contactInfoValue}>1900 636 123</Text>
            </View>

            <View style={styles.contactInfoItem}>
              <Text style={styles.contactInfoLabel}>Thời gian:</Text>
              <Text style={styles.contactInfoValue}>Thứ 2 - Thứ 6, 9h - 18h</Text>
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
  backButton: {
    width: 40, height: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 16
  },
  header: { marginBottom: 32 },
  title: { fontSize: 28, fontWeight: 'bold', color: colors.text, marginBottom: 8 },
  subtitle: { fontSize: 16, color: colors.textLight, lineHeight: 22 },
  form: { marginBottom: 24 },
  label: { fontSize: 14, marginBottom: 6, color: colors.text, fontWeight: '500' },
  textAreaContainer: { marginBottom: 16 },
  textAreaWrapper: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.background,
    padding: 12
  },
  textAreaError: { borderColor: colors.error },
  textArea: { fontSize: 16, color: colors.text, minHeight: 120 },
  errorText: { color: colors.error, fontSize: 12, marginTop: 4 },
  attachmentButton: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  attachmentText: { color: colors.primary, marginLeft: 8, fontSize: 14 },
  submitButton: { marginTop: 8 },
  contactInfoContainer: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24
  },
  contactInfoTitle: { fontSize: 18, fontWeight: 'bold', color: colors.text, marginBottom: 16 },
  contactInfoItem: { flexDirection: 'row', marginBottom: 12 },
  contactInfoLabel: { fontSize: 14, fontWeight: '500', color: colors.text, width: 120 },
  contactInfoValue: { fontSize: 14, color: colors.textLight, flex: 1 },
});
