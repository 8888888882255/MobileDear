
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  Switch,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Save } from 'lucide-react-native';
import Toast from 'react-native-toast-message';

import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import colors from '@/constants/colors';
import { api } from '@/src/config/api';

export default function CreateUserScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    taiKhoan: '',
    matKhau: '',
    hoTen: '',
    email: '',
    vaiTro: 0, // 0: User, 1: Admin
  });

  const handleChange = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleCreate = async () => {
    // Validation
    if (!formData.taiKhoan || !formData.matKhau || !formData.hoTen || !formData.email) {
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Vui lòng điền đầy đủ thông tin bắt buộc (*)',
      });
      return;
    }

    // Backend password validation check (client-side pre-check)
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,100}$/;
    if (!passwordRegex.test(formData.matKhau)) {
      Toast.show({
        type: 'error',
        text1: 'Mật khẩu yếu',
        text2: 'Cần: 8+ ký tự, Hoa, Thường, Số, Ký tự đặc biệt (@$!%*?&)',
        visibilityTime: 4000,
      });
      return;
    }

    setIsLoading(true);
    try {
      console.log('📝 Creating user:', formData);
      
      const url = `${api.baseUrl}/api/NguoiDung`;
      
      // Map to backend DTO (NguoiDungCreate)
      // Backend: 1=Admin, 2=User
      // Frontend: 1=Admin, 0=User -> 2
      const roleToSend = formData.vaiTro === 1 ? 1 : 2;

      const payload = {
        HoTen: formData.hoTen,
        Email: formData.email,
        TaiKhoan: formData.taiKhoan,
        MatKhau: formData.matKhau,
        VaiTro: roleToSend
      };
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      console.log('📡 Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'Không thể tạo người dùng';
        try {
            // Try to parse validation errors
            const errorObj = JSON.parse(errorText);
            if (errorObj.errors) {
                const details = Object.values(errorObj.errors).flat().join(', ');
                errorMessage = details || errorObj.title || errorMessage;
            } else if (errorObj.Message) {
                errorMessage = errorObj.Message;
            }
        } catch (e) {
            errorMessage = errorText;
        }
        throw new Error(errorMessage);
      }

      Toast.show({
        type: 'success',
        text1: 'Thành công',
        text2: 'Đã tạo người dùng mới',
      });

      // Go back to user list
      setTimeout(() => {
        router.back();
      }, 500);
      
    } catch (error: any) {
      console.error('❌ Create user user error:', error);
      Toast.show({
        type: 'error',
        text1: 'Tạo thất bại',
        text2: error.message || String(error),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Thêm người dùng</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.formCard}>
            <Text style={styles.sectionTitle}>Thông tin tài khoản</Text>
            
            <Input
              label="Tài khoản *"
              value={formData.taiKhoan}
              onChangeText={(text) => handleChange('taiKhoan', text)}
              placeholder="Nhập tên đăng nhập"
              autoCapitalize="none"
            />

            <Input
              label="Mật khẩu *"
              value={formData.matKhau}
              onChangeText={(text) => handleChange('matKhau', text)}
              placeholder="8+ ký tự (Hoa, thường, số, ký tự đặc biệt)"
              secureTextEntry
            />
            <Text style={styles.hintText}>
              Ví dụ: P@ssw0rd123
            </Text>

            <View style={styles.divider} />

            <Text style={styles.sectionTitle}>Thông tin cá nhân</Text>
            
            <Input
              label="Họ và tên *"
              value={formData.hoTen}
              onChangeText={(text) => handleChange('hoTen', text)}
              placeholder="Nhập họ tên đầy đủ"
            />

            <Input
              label="Email *"
              value={formData.email}
              onChangeText={(text) => handleChange('email', text)}
              placeholder="example@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <View style={styles.rowInput}>
              <View style={styles.switchContainer}>
                <Text style={styles.switchLabel}>Vai trò</Text>
                <View style={styles.switchControl}>
                  <TouchableOpacity 
                    style={[styles.optionBtn, formData.vaiTro === 0 && styles.activeOption]}
                    onPress={() => handleChange('vaiTro', 0)}
                  >
                    <Text style={[styles.optionText, formData.vaiTro === 0 && styles.activeOptionText]}>User</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.optionBtn, formData.vaiTro === 1 && styles.activeOption]}
                    onPress={() => handleChange('vaiTro', 1)}
                  >
                    <Text style={[styles.optionText, formData.vaiTro === 1 && styles.activeOptionText]}>Admin</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <Button
              title="Tạo User"
              onPress={handleCreate}
              loading={isLoading}
              style={styles.submitBtn}
              leftIcon={<Save size={20} color="white" />}
            />
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 8,
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
      default: {},
    }),
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  content: {
    padding: 16,
  },
  formCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    maxWidth: 600,
    width: '100%',
    alignSelf: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
    marginTop: 8,
  },
  hintText: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: -12,
    marginBottom: 16,
    fontStyle: 'italic',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 16,
  },
  rowInput: {
    marginBottom: 16,
  },
  switchContainer: {
    marginBottom: 8,
  },
  switchLabel: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 8,
    fontWeight: '500',
  },
  switchControl: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  optionBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
      default: {},
    }),
  },
  activeOption: {
    backgroundColor: colors.primary,
  },
  optionText: {
    color: colors.textLight,
    fontWeight: '500',
  },
  activeOptionText: {
    color: 'white',
    fontWeight: 'bold', // Dam hon cho de nhin
  },
  submitBtn: {
    marginTop: 24,
  },
});
