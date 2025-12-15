import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Platform
} from 'react-native';
import Toast from 'react-native-toast-message';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Camera, ChevronLeft, Upload } from 'lucide-react-native';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useUserStore } from '@/store/user-store';
import colors from '@/constants/colors';
import { AuthService } from '@/src/services/authService';
import Constants from 'expo-constants';
import * as ImagePicker from 'expo-image-picker';

const parseBackendError = (error: any): string => {
  try {
    let messageToCheck = error?.message || String(error);
    if (messageToCheck.startsWith('Error: ')) {
      messageToCheck = messageToCheck.replace('Error: ', '');
    }
    const parsed = JSON.parse(messageToCheck);
    if (parsed.detail) return parsed.detail;
    if (parsed.message) return parsed.message;
    if (parsed.title) return parsed.title;
    return messageToCheck;
  } catch (e) {
    const msg = error?.message || String(error);
    return msg.replace(/^Error:\s*/, '');
  }
};

export default function EditUserScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user: currentUser, isLoading: isAuthLoading } = useUserStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [avatar, setAvatar] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [originalUser, setOriginalUser] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState<any>(null);

  React.useEffect(() => {
    if (!isAuthLoading && !currentUser?.isAdmin) {
      router.replace('/');
    }
  }, [currentUser, isAuthLoading]);

  React.useEffect(() => {
    fetchUserDetails();
  }, [id]);

  const fetchUserDetails = async () => {
    try {
      setIsLoading(true);
      const data = await AuthService.getUserProfile(Number(id));
      setOriginalUser(data);
      setName(data.hoTen || '');
      setEmail(data.email || '');
      setPhone(data.sdt || '');
      
      // Handle avatar URL
      let avatarUrl = data.avt || '';
      if (avatarUrl && !avatarUrl.startsWith('http') && !avatarUrl.startsWith('data:')) {
        avatarUrl = `${Constants.expoConfig?.extra?.apiUrl}/${avatarUrl}`;
      }
      setAvatar(avatarUrl);
      
      setIsAdmin(data.vaiTro === 1);
    } catch (error) {
      console.error('Error fetching user details:', error);
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Không thể tải thông tin người dùng'
      });
      router.back();
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    if (!name.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Vui lòng nhập họ tên'
      });
      return false;
    }
    if (!email.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Vui lòng nhập email'
      });
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Vui lòng nhập địa chỉ email hợp lệ'
      });
      return false;
    }
    return true;
  };

  const pickImage = async () => {
    if (Platform.OS === 'web') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (e: any) => {
        const file = e.target.files?.[0];
        if (file) {
          setSelectedImage(file);
          setAvatar(URL.createObjectURL(file));
        }
      };
      input.click();
    } else {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Toast.show({
          type: 'error',
          text1: 'Quyền truy cập',
          text2: 'Cần quyền truy cập thư viện ảnh để tải ảnh lên'
        });
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false, // Disabled cropping
        quality: 0.8,
      });

      if (!result.canceled) {
        const asset = result.assets[0];
        // Client-side size check (5MB)
        if (asset.fileSize && asset.fileSize > 5 * 1024 * 1024) {
             Toast.show({
                type: 'error',
                text1: 'Lỗi',
                text2: 'Kích thước ảnh không được vượt quá 5MB'
             });
             return;
        }

        setSelectedImage(asset);
        setAvatar(asset.uri);
      }
    }
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsSaving(true);

    try {
      // Prepare update model matching backend NguoiDungEdit
      const updateModel = {
        MaNguoiDung: Number(id),
        HoTen: name.trim(),
        Email: email.trim(),
        Sdt: phone.trim() || null,
        // If we have a new selected image, we don't send the Avt string field
        // Otherwise, send existing avatar or null
        Avt: selectedImage ? null : (avatar.trim() || null),
        VaiTro: isAdmin ? 1 : 0,
        // Preserve existing fields that are not in the form but required/important
        TrangThai: originalUser?.trangThai ?? 1,
        GioiTinh: originalUser?.gioiTinh ?? 0,
        NgaySinh: originalUser?.ngaySinh,
        TieuSu: originalUser?.tieuSu
      };

      await AuthService.updateUserProfile(Number(id), updateModel, selectedImage);

      Toast.show({
        type: 'success',
        text1: 'Thành công',
        text2: 'Cập nhật người dùng thành công!',
        onHide: () => {
           // router.back();
        }
      });
      // Fallback navigation if onHide doesn't trigger immediately or as expected in some envs
      setTimeout(() => router.back(), 1000);
    } catch (error: any) {
      console.error('Error updating user:', error);
      const errorMessage = parseBackendError(error);
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: errorMessage
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isAuthLoading) {
    return (
        <SafeAreaView style={styles.container}>
             <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                 <ActivityIndicator size="large" color={colors.primary} />
             </View>
        </SafeAreaView>
    );
  }

  if (!currentUser?.isAdmin) {
    return null;
  }

  // Handle safe back navigation
  const handleBack = () => {
    router.push('/admin/users');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
              style={styles.backButton}
              onPress={handleBack}
          >
              <ChevronLeft size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
        <View style={styles.content}>
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Ảnh đại diện</Text>

            <View style={styles.avatarSection}>
              <View style={styles.avatarContainer}>
                {avatar ? (
                  <Image
                    source={{ uri: avatar }}
                    style={styles.avatar}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarText}>
                      {name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                )}
                <TouchableOpacity
                  style={styles.avatarButton}
                  onPress={pickImage}
                >
                  <Camera size={20} color="#fff" />
                </TouchableOpacity>
              </View>

              <TouchableOpacity 
                style={styles.uploadButton}
                onPress={pickImage}
              >
                <Upload size={18} color={colors.primary} />
                <Text style={styles.uploadButtonText}>Chọn ảnh từ thư viện</Text>
              </TouchableOpacity>
            </View>
          </Card>

          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Thông tin cơ bản</Text>

            <Input
              label="Họ tên"
              placeholder="Nhập họ tên"
              value={name}
              onChangeText={setName}
            />

            <Input
              label="Email"
              placeholder="user@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Input
              label="Số điện thoại (Tùy chọn)"
              placeholder="+84 123 456 789"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
          </Card>

          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Phân quyền</Text>

            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => setIsAdmin(!isAdmin)}
            >
              <View style={styles.checkbox}>
                {isAdmin && <View style={styles.checkboxFill} />}
              </View>
              <View style={styles.checkboxContent}>
                <Text style={styles.checkboxLabel}>Quản trị viên</Text>
                <Text style={styles.checkboxDescription}>
                  Cấp toàn quyền quản trị cho người dùng này
                </Text>
              </View>
            </TouchableOpacity>
          </Card>

          <View style={styles.actions}>
            <Button
              title="Hủy"
              onPress={() => router.back()}
              variant="outline"
              style={styles.actionButton}
            />
            <Button
              title={isSaving ? 'Đang lưu...' : 'Cập nhật'}
              onPress={handleSave}
              disabled={isSaving}
              style={styles.actionButton}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  section: {
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  avatarSection: {
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
  },
  avatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.card,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 8,
    gap: 8,
  },
  uploadButtonText: {
    color: colors.primary,
    fontWeight: '500',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkboxFill: {
    width: 14,
    height: 14,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  checkboxContent: {
    flex: 1,
  },
  checkboxLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 4,
  },
  checkboxDescription: {
    fontSize: 14,
    color: colors.textLight,
  },
  actions: {
    flexDirection: 'row',
    marginTop: 8,
    marginBottom: 32,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
});
