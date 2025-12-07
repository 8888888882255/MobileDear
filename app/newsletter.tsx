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
  Image,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { useRouter } from 'expo-router';
import { ChevronLeft, Mail, Check } from 'lucide-react-native';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import colors from '@/constants/colors';

export default function NewsletterScreen() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [preferences, setPreferences] = useState({
    womensFashion: false,
    mensFashion: false,
    kidsFashion: false,
    accessories: false,
    sales: true,
    newArrivals: true,
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
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

  const handleSubscribe = () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      Toast.show({
        type: 'success',
        text1: 'Đăng ký thành công',
        text2: 'Cảm ơn bạn đã đăng ký nhận bản tin!',
      });
      setTimeout(() => router.back(), 1500);
    }, 1500);
  };

  const togglePreference = (key: keyof typeof preferences) => {
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ChevronLeft size={24} color={colors.text} />
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.title}>Đăng ký nhận bản tin</Text>
            <Text style={styles.subtitle}>
              Cập nhật những bộ sưu tập mới, ưu đãi độc quyền và mẹo phối đồ thời trang.
            </Text>
          </View>

          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1607083206968-13611e3d76db?auto=format&fit=crop&w=1050&q=80' }}
            style={styles.bannerImage}
            resizeMode="cover"
          />

          <View style={styles.form}>
            <Input
              label="Địa chỉ Email"
              placeholder="Nhập email của bạn"
              value={email}
              onChangeText={text => {
                setEmail(text);
                if (error) validateForm();
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              error={error}
              leftIcon={<Mail size={20} color={colors.textLight} />}
            />

            <View style={styles.preferencesContainer}>
              <Text style={styles.preferencesTitle}>Chủ đề bạn quan tâm</Text>
              <Text style={styles.preferencesSubtitle}>Chọn các lĩnh vực bạn muốn nhận thông tin:</Text>

              {[
                ['Thời trang nữ', 'womensFashion'],
                ['Thời trang nam', 'mensFashion'],
                ['Thời trang trẻ em', 'kidsFashion'],
                ['Phụ kiện', 'accessories'],
                ['Khuyến mãi & giảm giá', 'sales'],
                ['Sản phẩm mới', 'newArrivals'],
              ].map(([label, key]) => (
                <TouchableOpacity key={key} style={styles.checkboxItem} onPress={() => togglePreference(key as any)}>
                  <View style={[styles.checkbox, preferences[key as keyof typeof preferences] && styles.checkboxChecked]}>
                    {preferences[key as keyof typeof preferences] && <Check size={16} color="#fff" />}
                  </View>
                  <Text style={styles.checkboxLabel}>{label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.privacyNote}>
              <Text style={styles.privacyText}>
                Khi đăng ký, bạn đồng ý với{' '}
                <Text style={styles.privacyLink}>Chính sách bảo mật</Text> và chấp nhận nhận email quảng cáo từ Crocus.
              </Text>
            </View>

            <Button
              title="Đăng ký"
              onPress={handleSubscribe}
              loading={isLoading}
              fullWidth
              style={styles.subscribeButton}
            />
          </View>

          <View style={styles.benefitsContainer}>
            <Text style={styles.benefitsTitle}>Lợi ích khi đăng ký</Text>

            <View style={styles.benefitItem}>
              <View style={styles.benefitIcon}>
                <Text style={styles.benefitIconText}>%</Text>
              </View>
              <View style={styles.benefitContent}>
                <Text style={styles.benefitTitle}>Giảm giá độc quyền</Text>
                <Text style={styles.benefitDescription}>Ưu đãi đặc biệt chỉ dành cho người đăng ký</Text>
              </View>
            </View>

            <View style={styles.benefitItem}>
              <View style={styles.benefitIcon}>
                <Text style={styles.benefitIconText}>★</Text>
              </View>
              <View style={styles.benefitContent}>
                <Text style={styles.benefitTitle}>Bộ sưu tập mới</Text>
                <Text style={styles.benefitDescription}>Thông báo sớm khi có sản phẩm mới</Text>
              </View>
            </View>

            <View style={styles.benefitItem}>
              <View style={styles.benefitIcon}>
                <Text style={styles.benefitIconText}>✓</Text>
              </View>
              <View style={styles.benefitContent}>
                <Text style={styles.benefitTitle}>Bí quyết thời trang</Text>
                <Text style={styles.benefitDescription}>Gợi ý mix đồ, mẹo thời trang mỗi tuần</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textLight,
    lineHeight: 22,
  },
  bannerImage: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    marginBottom: 24,
  },
  form: {
    marginBottom: 24,
  },
  preferencesContainer: {
    marginTop: 16,
    marginBottom: 24,
  },
  preferencesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  preferencesSubtitle: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 16,
  },
  checkboxList: {
    marginTop: 8,
  },
  checkboxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.border,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkboxLabel: {
    fontSize: 16,
    color: colors.text,
  },
  privacyNote: {
    marginBottom: 24,
  },
  privacyText: {
    fontSize: 14,
    color: colors.textLight,
    lineHeight: 20,
  },
  privacyLink: {
    color: colors.primary,
    fontWeight: '500',
  },
  subscribeButton: {
    marginTop: 8,
  },
  benefitsContainer: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  benefitsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  benefitItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  benefitIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary + '30',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  benefitIconText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  benefitContent: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 4,
  },
  benefitDescription: {
    fontSize: 14,
    color: colors.textLight,
    lineHeight: 20,
  },
});