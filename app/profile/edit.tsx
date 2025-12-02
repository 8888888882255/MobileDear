import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView,
  KeyboardAvoidingView, Platform, ScrollView, Alert, Image
} from 'react-native';
import { useRouter } from 'expo-router';
import { User, Mail, Phone, ChevronLeft, Camera, Calendar, MapPin } from 'lucide-react-native';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useUserStore } from '@/store/user-store';
import * as ImagePicker from 'expo-image-picker';
import colors from '@/constants/colors';

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, updateProfile } = useUserStore();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [birthday, setBirthday] = useState('');
  const [address, setAddress] = useState('');
  const [avatar, setAvatar] = useState<string | undefined>(user?.avatar);
  const [errors, setErrors] = useState({ name: '', email: '', phone: '' });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      router.replace('/auth/login');
    }
  }, [user]);

  const validateForm = () => {
    let isValid = true;
    const newErrors = { name: '', email: '', phone: '' };

    if (!name.trim()) {
      newErrors.name = 'Họ tên không được để trống';
      isValid = false;
    }

    if (!email.trim()) {
      newErrors.email = 'Email không được để trống';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email không hợp lệ';
      isValid = false;
    }

    if (phone.trim() && !/^\d{10,}$/.test(phone.replace(/[^0-9]/g, ''))) {
      newErrors.phone = 'Số điện thoại không hợp lệ';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handlePickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Yêu cầu quyền truy cập', 'Bạn cần cho phép truy cập ảnh để chọn ảnh đại diện.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setAvatar(result.assets[0].uri);
    }
  };

  const handleSave = () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setTimeout(() => {
      updateProfile({ name, email, phone: phone || undefined, avatar });
      setIsLoading(false);
      Alert.alert('Cập nhật thành công', 'Thông tin cá nhân đã được cập nhật.', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    }, 1500);
  };

  if (!user) return null;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardAvoidingView}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ChevronLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chỉnh sửa hồ sơ</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.avatarContainer}>
            {avatar ? (
              <Image source={{ uri: avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitial}>{name.charAt(0).toUpperCase()}</Text>
              </View>
            )}
            <TouchableOpacity style={styles.changePhotoButton} onPress={handlePickImage}>
              <Camera size={16} color="#fff" />
              <Text style={styles.changePhotoText}>Đổi ảnh</Text>
            </TouchableOpacity>
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
              label="Số điện thoại (tùy chọn)"
              placeholder="Nhập số điện thoại"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              error={errors.phone}
              leftIcon={<Phone size={20} color={colors.textLight} />}
            />
            <Input
              label="Ngày sinh (tùy chọn)"
              placeholder="MM/DD/YYYY"
              value={birthday}
              onChangeText={setBirthday}
              leftIcon={<Calendar size={20} color={colors.textLight} />}
            />
            <Input
              label="Địa chỉ (tùy chọn)"
              placeholder="Nhập địa chỉ"
              value={address}
              onChangeText={setAddress}
              leftIcon={<MapPin size={20} color={colors.textLight} />}
            />

            <View style={styles.buttonContainer}>
              <Button title="Lưu thay đổi" onPress={handleSave} loading={isLoading} fullWidth style={styles.saveButton} />
              <Button title="Hủy bỏ" onPress={() => router.back()} variant="outline" fullWidth style={styles.cancelButton} />
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: colors.text },
  placeholder: { width: 40 },
  scrollContent: { padding: 24 },
  avatarContainer: { alignItems: 'center', marginBottom: 32 },
  avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 16 },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarInitial: { fontSize: 40, fontWeight: 'bold', color: '#fff' },
  changePhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  changePhotoText: { color: '#fff', marginLeft: 8, fontWeight: '500' },
  form: { marginBottom: 24 },
  buttonContainer: { marginTop: 16 },
  saveButton: { marginBottom: 12 },
  cancelButton: { marginBottom: 24 },
});
