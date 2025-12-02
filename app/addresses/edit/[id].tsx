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
  Alert
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  MapPin,
  Home,
  Building,
  Flag,
  ChevronLeft,
  Check
} from 'lucide-react-native';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useUserStore } from '@/store/user-store';
import colors from '@/constants/colors';

export default function EditAddressScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { user, updateAddress } = useUserStore();

  const address = user?.addresses.find(addr => addr.id === id);

  const [name, setName] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [country, setCountry] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  const [errors, setErrors] = useState({
    name: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: ''
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (address) {
      setName(address.name);
      setStreet(address.street);
      setCity(address.city);
      setState(address.state);
      setZipCode(address.zipCode);
      setCountry(address.country);
      setIsDefault(address.isDefault);
    }
  }, [address]);

  if (!address) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Không tìm thấy địa chỉ</Text>
          <Button
            title="Quay lại"
            onPress={() => router.back()}
            style={styles.errorButton}
          />
        </View>
      </SafeAreaView>
    );
  }

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
      newErrors.name = 'Tên địa chỉ là bắt buộc';
      isValid = false;
    }

    if (!street.trim()) {
      newErrors.street = 'Địa chỉ chi tiết là bắt buộc';
      isValid = false;
    }

    if (!city.trim()) {
      newErrors.city = 'Thành phố là bắt buộc';
      isValid = false;
    }

    if (!state.trim()) {
      newErrors.state = 'Tỉnh/Thành là bắt buộc';
      isValid = false;
    }

    if (!zipCode.trim()) {
      newErrors.zipCode = 'Mã bưu chính là bắt buộc';
      isValid = false;
    } else if (!/^\d{5}(-\d{4})?$/.test(zipCode)) {
      newErrors.zipCode = 'Mã bưu chính không hợp lệ';
      isValid = false;
    }

    if (!country.trim()) {
      newErrors.country = 'Quốc gia là bắt buộc';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSave = () => {
    if (!validateForm()) return;

    setIsLoading(true);

    setTimeout(() => {
      updateAddress(address.id, {
        name,
        street,
        city,
        state,
        zipCode,
        country,
        isDefault
      });
      setIsLoading(false);
      Alert.alert('Thành công', 'Địa chỉ đã được cập nhật thành công!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    }, 1500);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ChevronLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chỉnh sửa địa chỉ</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.form}>
            <Input
              label="Tên địa chỉ"
              placeholder="Nhà riêng, Công ty, v.v."
              value={name}
              onChangeText={setName}
              error={errors.name}
              leftIcon={<Home size={20} color={colors.textLight} />}
            />
            <Input
              label="Địa chỉ chi tiết"
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
                  placeholder="Nhập tỉnh"
                  value={state}
                  onChangeText={setState}
                  error={errors.state}
                />
              </View>
              <View style={styles.halfInput}>
                <Input
                  label="Mã bưu chính"
                  placeholder="12345"
                  value={zipCode}
                  onChangeText={setZipCode}
                  keyboardType="numeric"
                  error={errors.zipCode}
                />
              </View>
            </View>
            <Input
              label="Quốc gia"
              placeholder="Việt Nam"
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
                title="Lưu thay đổi"
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
    backgroundColor: colors.background,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  placeholder: {
    width: 40,
  },
  scrollContent: {
    padding: 24,
  },
  form: {
    marginBottom: 24,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
  },
  defaultContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.border,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  defaultText: {
    fontSize: 16,
    color: colors.text,
  },
  buttonContainer: {
    marginTop: 8,
  },
  saveButton: {
    marginBottom: 12,
  },
  cancelButton: {
    marginBottom: 24,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 18,
    color: colors.error,
    marginBottom: 24,
  },
  errorButton: {
    paddingHorizontal: 32,
  },
});
