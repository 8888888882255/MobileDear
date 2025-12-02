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
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  Home,
  MapPin,
  Building,
  Flag,
  ChevronLeft,
  Check
} from 'lucide-react-native';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useUserStore } from '@/store/user-store';
import colors from '@/constants/colors';

export default function ThemDiaChiScreen() {
  const router = useRouter();
  const { addAddress } = useUserStore();

  const [name, setName] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [country, setCountry] = useState('Việt Nam');
  const [isDefault, setIsDefault] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [errors, setErrors] = useState({
    name: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: ''
  });

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      name: '',
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    };

    if (!name.trim()) {
      newErrors.name = 'Vui lòng nhập tên địa chỉ';
      isValid = false;
    }
    if (!street.trim()) {
      newErrors.street = 'Vui lòng nhập tên đường';
      isValid = false;
    }
    if (!city.trim()) {
      newErrors.city = 'Vui lòng nhập thành phố';
      isValid = false;
    }
    if (!state.trim()) {
      newErrors.state = 'Vui lòng nhập tỉnh/thành';
      isValid = false;
    }
    if (!zipCode.trim()) {
      newErrors.zipCode = 'Vui lòng nhập mã bưu điện';
      isValid = false;
    } else if (!/^\d{5,6}$/.test(zipCode)) {
      newErrors.zipCode = 'Mã bưu điện không hợp lệ';
      isValid = false;
    }
    if (!country.trim()) {
      newErrors.country = 'Vui lòng nhập quốc gia';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSave = () => {
    if (!validateForm()) return;

    setIsLoading(true);

    setTimeout(() => {
      addAddress({
        id: Math.random().toString(36).substring(2, 10),
        name,
        street,
        city,
        state,
        zipCode,
        country,
        isDefault
      });

      setIsLoading(false);
      Alert.alert('Thành công', 'Địa chỉ đã được thêm thành công!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    }, 1500);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ChevronLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Thêm địa chỉ mới</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.form}>
            <Input
              label="Tên địa chỉ"
              placeholder="Nhà, Cơ quan, v.v..."
              value={name}
              onChangeText={setName}
              error={errors.name}
              leftIcon={<Home size={20} color={colors.textLight} />}
            />
            <Input
              label="Tên đường"
              placeholder="Số nhà, tên đường"
              value={street}
              onChangeText={setStreet}
              error={errors.street}
              leftIcon={<MapPin size={20} color={colors.textLight} />}
            />
            <Input
              label="Thành phố"
              placeholder="Nhập thành phố"
              value={city}
              onChangeText={setCity}
              error={errors.city}
              leftIcon={<Building size={20} color={colors.textLight} />}
            />
            <View style={styles.rowContainer}>
              <View style={styles.halfInput}>
                <Input
                  label="Tỉnh/Thành"
                  placeholder="VD: Hà Nội"
                  value={state}
                  onChangeText={setState}
                  error={errors.state}
                />
              </View>
              <View style={styles.halfInput}>
                <Input
                  label="Mã bưu điện"
                  placeholder="VD: 700000"
                  value={zipCode}
                  onChangeText={setZipCode}
                  keyboardType="numeric"
                  error={errors.zipCode}
                />
              </View>
            </View>
            <Input
              label="Quốc gia"
              placeholder="Nhập quốc gia"
              value={country}
              onChangeText={setCountry}
              error={errors.country}
              leftIcon={<Flag size={20} color={colors.textLight} />}
            />

            <TouchableOpacity
              style={styles.defaultContainer}
              onPress={() => setIsDefault(!isDefault)}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, isDefault && styles.checkboxChecked]}>
                {isDefault && <Check size={16} color="#fff" />}
              </View>
              <Text style={styles.defaultText}>Đặt làm địa chỉ mặc định</Text>
            </TouchableOpacity>

            <View style={styles.buttonContainer}>
              <Button
                title="Lưu địa chỉ"
                onPress={handleSave}
                loading={isLoading}
                fullWidth
                style={styles.saveButton}
              />
              <Button
                title="Hủy"
                onPress={() => router.back()}
                variant="outline"
                fullWidth
                style={styles.cancelButton}
              />
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
    backgroundColor: colors.background
  },
  keyboardAvoidingView: {
    flex: 1
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center'
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text
  },
  scrollContent: {
    padding: 24
  },
  form: {
    marginBottom: 24
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  halfInput: {
    width: '48%'
  },
  defaultContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 24
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.border,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center'
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  defaultText: {
    fontSize: 16,
    color: colors.text
  },
  buttonContainer: {
    marginTop: 8
  },
  saveButton: {
    marginBottom: 12
  },
  cancelButton: {
    marginBottom: 24
  }
});
