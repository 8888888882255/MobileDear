// app/(admin)/products/new.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Image,
  FlatList,
  Platform,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { useRouter } from 'expo-router';
import { Plus, Trash2 } from 'lucide-react-native';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useUserStore } from '@/store/user-store';
import colors from '@/constants/colors';
import Constants from 'expo-constants';
import * as ImagePicker from 'expo-image-picker';

const API_URL = Constants?.expoConfig?.extra?.apiUrl || 'https://fasion-a-b9cvdggjhudzbfe8.southeastasia-01.azurewebsites.net';

// Kiểu ảnh hỗ trợ tất cả nền tảng
type SelectedImage = {
  uri: string;
  name: string;
  type: string;
  file?: File; // Chỉ có trên Web
};

export default function NewProductScreen() {
  const router = useRouter();
  const { user } = useUserStore();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [discountPrice, setDiscountPrice] = useState('');
  const [maVach, setMaVach] = useState('');
  const [stock, setStock] = useState('');
  const [images, setImages] = useState<SelectedImage[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Danh mục
  const [loaiList, setLoaiList] = useState<{ maDanhMuc: number; tenDanhMuc: string }[]>([]);
  const [thuongHieuList, setThuongHieuList] = useState<{ maDanhMuc: number; tenDanhMuc: string }[]>([]);
  const [hashtagList, setHashtagList] = useState<{ maDanhMuc: number; tenDanhMuc: string }[]>([]);

  const [selectedMaLoai, setSelectedMaLoai] = useState<number | null>(null);
  const [selectedMaThuongHieu, setSelectedMaThuongHieu] = useState<number | null>(null);
  const [selectedMaHashtag, setSelectedMaHashtag] = useState<number | null>(null);

  // Giới tính
  const [gioiTinh, setGioiTinh] = useState<string>('Mặc Định');

  const gioiTinhMap: Record<string, number> = {
    'Mặc Định': 0,
    'Nam': 1,
    'Nữ': 2,
    'Khác': 3,
  };

  // Bảo vệ route admin
  if (!user?.isAdmin) {
    router.replace('/');
    return null;
  }

  useEffect(() => {
    loadDanhMuc();
  }, []);

  const loadDanhMuc = async () => {
    try {
      const [resLoai, resThuongHieu, resHashtag] = await Promise.all([
        fetch(`${API_URL}/api/DanhMuc/filter/type/1`),
        fetch(`${API_URL}/api/DanhMuc/filter/type/2`),
        fetch(`${API_URL}/api/DanhMuc/filter/type/3`),
      ]);

      const [dataLoai, dataThuongHieu, dataHashtag] = await Promise.all([
        resLoai.json(),
        resThuongHieu.json(),
        resHashtag.json(),
      ]);

      setLoaiList(Array.isArray(dataLoai) ? dataLoai : []);
      setThuongHieuList(Array.isArray(dataThuongHieu) ? dataThuongHieu : []);
      setHashtagList(Array.isArray(dataHashtag) ? dataHashtag : []);
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Không tải được danh mục',
      });
    }
  };

  // CHỌN ẢNH – HOẠT ĐỘNG TRÊN WEB + MOBILE + DESKTOP
  const pickImages = async () => {
    if (Platform.OS === 'web') {
      // Web: dùng input file
      const input = document.createElement('input');
      input.type = 'file';
      input.multiple = true;
      input.accept = 'image/*';

      input.onchange = (e: any) => {
        const files: File[] = Array.from(e.target.files || []);
        if (files.length === 0) return;

        const newImages: SelectedImage[] = files.map(file => ({
          uri: URL.createObjectURL(file),
          name: file.name,
          type: file.type || 'image/jpeg',
          file,
        }));

        setImages(prev => [...prev, ...newImages]);
      };

      input.click();
      return;
    }

    // Mobile & Desktop (Android/iOS/Windows/macOS)
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Toast.show({
        type: 'error',
        text1: 'Cần quyền',
        text2: 'Vui lòng cấp quyền truy cập thư viện ảnh',
      });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
      orderedSelection: true,
    });

    if (!result.canceled && result.assets) {
      const newImages: SelectedImage[] = result.assets.map(asset => {
        const fileName = asset.uri.split('/').pop() || `image_${Date.now()}.jpg`;
        const cleanUri = Platform.OS === 'ios' ? asset.uri.replace('file://', '') : asset.uri;
        return {
          uri: asset.uri,
          name: fileName,
          type: asset.type || 'image/jpeg',
        };
      });
      setImages(prev => [...prev, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    if (!name.trim()) {
      Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Tên sản phẩm là bắt buộc' });
      return false;
    }
    if (!description.trim()) {
      Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Mô tả là bắt buộc' });
      return false;
    }
    if (!price || Number(price) <= 0) {
      Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Giá bán phải lớn hơn 0' });
      return false;
    }
    if (!stock || Number(stock) < 0) {
      Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Số lượng tồn kho không hợp lệ' });
      return false;
    }
    if (images.length === 0) {
      Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Cần ít nhất 1 hình ảnh' });
      return false;
    }
    if (!selectedMaLoai) {
      Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Vui lòng chọn Loại sản phẩm' });
      return false;
    }
    if (!selectedMaThuongHieu) {
      Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Vui lòng chọn Thương hiệu' });
      return false;
    }
    return true;
  };

  // GỬI DỮ LIỆU – HOẠT ĐỘNG TRÊN TẤT CẢ NỀN TẢNG
  const handleSave = async () => {
    if (!validateForm()) return;
    setIsSaving(true);

    const formData = new FormData();

    // Text fields
    formData.append('TenSanPham', name.trim());
    formData.append('MoTa', description.trim());
    formData.append('MaVach', maVach.trim());
    formData.append('GioiTinh', gioiTinhMap[gioiTinh].toString());
    formData.append('MaLoai', selectedMaLoai!.toString());
    formData.append('MaThuongHieu', selectedMaThuongHieu!.toString());
    formData.append('GiaBan', price);
    if (discountPrice.trim()) formData.append('GiaSale', discountPrice.trim());
    formData.append('SoLuong', stock);
    if (selectedMaHashtag) formData.append('MaHashtag', selectedMaHashtag.toString());

    // Images – tên field đúng là "Images"
    images.forEach((img) => {
      if (Platform.OS === 'web' && img.file) {
        // Web: dùng File object thật
        formData.append('Images', img.file, img.name);
      } else {
        // Mobile & Desktop
        formData.append('Images', {
          uri: img.uri,
          name: img.name,
          type: img.type,
        } as any);
      }
    });

    try {
      const response = await fetch(`${API_URL}/api/SanPham`, {
        method: 'POST',
        body: formData,
        // Không set headers → tự động thêm boundary đúng
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server error:', errorText);
        throw new Error('Tạo sản phẩm thất bại: ' + errorText.substring(0, 200));
      }

      Toast.show({
        type: 'success',
        text1: 'Thành công!',
        text2: 'Sản phẩm và tất cả hình ảnh đã được tạo thành công!',
      });
      router.back();
    } catch (error: any) {
      console.error('Upload failed:', error);
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: error.message || 'Không thể tạo sản phẩm',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        {/* Thông tin cơ bản */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Thông Tin Cơ Bản</Text>
          <Input label="Tên Sản Phẩm" placeholder="Nhập tên..." value={name} onChangeText={setName} />
          <Input
            label="Mô Tả"
            placeholder="Mô tả chi tiết..."
            value={description}
            onChangeText={setDescription}
            multiline
            style={styles.textArea}
          />
          <Input label="Mã Vạch" placeholder="Nhập mã vạch" value={maVach} onChangeText={setMaVach} />
          <Input label="Giá Bán" placeholder="0.00" value={price} onChangeText={setPrice} keyboardType="decimal-pad" />
          <Input label="Giá Sale (Tùy chọn)" placeholder="0.00" value={discountPrice} onChangeText={setDiscountPrice} keyboardType="decimal-pad" />
          
          <Input label="Số Lượng Tồn Kho" placeholder="0" value={stock} onChangeText={setStock} keyboardType="number-pad" />
        </Card>

        {/* Giới tính */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Giới Tính</Text>
          <View style={styles.categoryButtons}>
            {['Mặc Định', 'Nam', 'Nữ', 'Khác'].map(item => (
              <TouchableOpacity
                key={item}
                style={[styles.categoryButton, gioiTinh === item && styles.activeCategoryButton]}
                onPress={() => setGioiTinh(item)}
              >
                <Text style={[styles.categoryButtonText, gioiTinh === item && styles.activeCategoryButtonText]}>
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Loại sản phẩm */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Loại Sản Phẩm</Text>
          <View style={styles.chipContainer}>
            {loaiList.map(item => (
              <TouchableOpacity
                key={item.maDanhMuc}
                style={[styles.chip, selectedMaLoai === item.maDanhMuc && styles.activeChip]}
                onPress={() => setSelectedMaLoai(item.maDanhMuc)}
              >
                <Text style={[styles.chipText, selectedMaLoai === item.maDanhMuc && styles.activeChipText]}>
                  {item.tenDanhMuc}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Thương hiệu */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Thương Hiệu</Text>
          <View style={styles.chipContainer}>
            {thuongHieuList.map(item => (
              <TouchableOpacity
                key={item.maDanhMuc}
                style={[styles.chip, selectedMaThuongHieu === item.maDanhMuc && styles.activeChip]}
                onPress={() => setSelectedMaThuongHieu(item.maDanhMuc)}
              >
                <Text style={[styles.chipText, selectedMaThuongHieu === item.maDanhMuc && styles.activeChipText]}>
                  {item.tenDanhMuc}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Hashtag (tùy chọn) */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Hashtag (Tùy chọn)</Text>
          <View style={styles.chipContainer}>
            {hashtagList.map(item => (
              <TouchableOpacity
                key={item.maDanhMuc}
                style={[styles.chip, selectedMaHashtag === item.maDanhMuc && styles.activeChip]}
                onPress={() => setSelectedMaHashtag(item.maDanhMuc)}
              >
                <Text style={[styles.chipText, selectedMaHashtag === item.maDanhMuc && styles.activeChipText]}>
                  {item.tenDanhMuc}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Hình ảnh */}
        <Card style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Hình Ảnh ({images.length})</Text>
            <TouchableOpacity onPress={pickImages} style={styles.addButton}>
              <Plus size={22} color={colors.primary} />
              <Text style={styles.addButtonText}>Thêm Hình Ảnh</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={images}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(_, i) => i.toString()}
            renderItem={({ item, index }) => (
              <View style={styles.imageWrapper}>
                <Image source={{ uri: item.uri }} style={styles.previewImage} resizeMode="cover" />
                <TouchableOpacity style={styles.removeImageBtn} onPress={() => removeImage(index)}>
                  <Trash2 size={18} color="#fff" />
                </TouchableOpacity>
              </View>
            )}
            ListEmptyComponent={
              <Text style={{ color: colors.textLight, textAlign: 'center', padding: 30 }}>
                Chưa có hình ảnh nào
              </Text>
            }
          />
        </Card>

        {/* Nút hành động */}
        <View style={styles.actions}>
          <Button title="Hủy" variant="outline" onPress={() => router.back()} style={styles.actionButton} />
          <Button
            title={isSaving ? 'Đang lưu...' : 'Tạo Sản Phẩm'}
            onPress={handleSave}
            disabled={isSaving}
            style={styles.actionButton}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 40 },
  section: { padding: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: colors.text, marginBottom: 12 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  textArea: { minHeight: 100, textAlignVertical: 'top' },
  categoryButtons: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  activeCategoryButton: { backgroundColor: colors.primary, borderColor: colors.primary },
  categoryButtonText: { fontSize: 14, color: colors.text },
  activeCategoryButtonText: { color: '#fff', fontWeight: '600' },
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  activeChip: { backgroundColor: colors.primary + '20', borderColor: colors.primary },
  chipText: { fontSize: 14, color: colors.text },
  activeChipText: { color: colors.primary, fontWeight: '600' },
  addButton: { flexDirection: 'row', alignItems: 'center' },
  addButtonText: { marginLeft: 6, color: colors.primary, fontWeight: '500' },
  imageWrapper: { position: 'relative', marginRight: 12 },
  previewImage: { width: 120, height: 120, borderRadius: 12 },
  removeImageBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
    padding: 6,
  },
  actions: { flexDirection: 'row', marginTop: 20, gap: 12 },
  actionButton: { flex: 1 },
});