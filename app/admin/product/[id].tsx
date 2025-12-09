// app/(admin)/products/[id].tsx  hoặc  edit.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Image,
  FlatList,
  Platform,
  ActivityIndicator,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Plus, Trash2 } from 'lucide-react-native';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useUserStore } from '@/store/user-store';
import colors from '@/constants/colors';
import Constants from 'expo-constants';
import * as ImagePicker from 'expo-image-picker';
import { productApi } from '@/src/services/productApi';
import { showDestructiveConfirm } from '@/src/utils/alert';

const API_URL = Constants?.expoConfig?.extra?.apiUrl || 'http://192.168.1.2:5083';

type MediaItem = { maMedia: number; duongDan: string };
type SelectedImage = {
  uri: string;
  name: string;
  type: string;
  file?: File;
  maMedia?: number;
};

export default function EditProductScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useUserStore();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form
  const [maSanPham, setMaSanPham] = useState(0);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [maVach, setMaVach] = useState('');
  const [price, setPrice] = useState('');
  const [discountPrice, setDiscountPrice] = useState('');
  const [stock, setStock] = useState('');
  const [gioiTinh, setGioiTinh] = useState('Phụ Nữ');

  // Danh mục
  const [loaiList, setLoaiList] = useState<any[]>([]);
  const [thuongHieuList, setThuongHieuList] = useState<any[]>([]);
  const [hashtagList, setHashtagList] = useState<any[]>([]);
  const [selectedMaLoai, setSelectedMaLoai] = useState<number | null>(null);
  const [selectedMaThuongHieu, setSelectedMaThuongHieu] = useState<number | null>(null);
  const [selectedMaHashtag, setSelectedMaHashtag] = useState<number | null>(null);

  // Ảnh
  const [images, setImages] = useState<SelectedImage[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  const gioiTinhMap: Record<string, number> = {
    'Phụ Nữ': 2,
    'Nam': 1,
    'Trẻ Em': 3,
    'Phụ Kiện': 0,
  };

  if (!user?.isAdmin) {
    router.replace('/');
    return null;
  }

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    try {
      await Promise.all([loadProduct(), loadDanhMuc()]);
    } catch {
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Không tải được dữ liệu'
      });
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const loadDanhMuc = async () => {
    const [res1, res2, res3] = await Promise.all([
      fetch(`${API_URL}/api/DanhMuc/filter/type/1`),
      fetch(`${API_URL}/api/DanhMuc/filter/type/2`),
      fetch(`${API_URL}/api/DanhMuc/filter/type/3`),
    ]);
    const [loai, thuonghieu, hashtag] = await Promise.all([res1.json(), res2.json(), res3.json()]);
    setLoaiList(Array.isArray(loai) ? loai : []);
    setThuongHieuList(Array.isArray(thuonghieu) ? thuonghieu : []);
    setHashtagList(Array.isArray(hashtag) ? hashtag : []);
  };

  const loadProduct = async () => {
    const res = await fetch(`${API_URL}/api/SanPham/${id}`);
    if (!res.ok) throw new Error('Không tìm thấy sản phẩm');
    const p = await res.json();

    setMaSanPham(p.maSanPham);
    setName(p.tenSanPham || '');
    setDescription(p.moTa || '');
    setMaVach(p.maVach || '');
    setPrice(p.giaBan?.toString() || '');
    setDiscountPrice(p.giaSale?.toString() || '');
    setStock(p.soLuong?.toString() || '');
    setSelectedMaLoai(p.maLoai);
    setSelectedMaThuongHieu(p.maThuongHieu);
    setSelectedMaHashtag(p.maHashtag);

    const gt = Object.keys(gioiTinhMap).find(k => gioiTinhMap[k] === p.gioiTinh) || 'Phụ Nữ';
    setGioiTinh(gt);

    if (p.medias?.length > 0) {
      const oldImgs: SelectedImage[] = p.medias.map((m: MediaItem) => ({
        uri: `${API_URL}${m.duongDan.startsWith('/') ? '' : '/'}${m.duongDan}`,
        name: m.duongDan.split('/').pop() || 'image.jpg',
        type: 'image/jpeg',
        maMedia: m.maMedia,
      }));
      setImages(oldImgs);
    }
  };

  // Chọn ảnh mới – hỗ trợ tất cả nền tảng
  const pickImages = async () => {
    if (Platform.OS === 'web') {
      const input = document.createElement('input');
      input.type = 'file';
      input.multiple = true;
      input.accept = 'image/*';
      input.onchange = (e: any) => {
        const files: File[] = Array.from(e.target.files || []);
        const newImgs = files.map(f => ({
          uri: URL.createObjectURL(f),
          name: f.name,
          type: f.type || 'image/jpeg',
          file: f,
        }));
        setImages(prev => [...prev, ...newImgs]);
      };
      input.click();
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return Toast.show({
      type: 'error',
      text1: 'Lỗi',
      text2: 'Cần quyền truy cập thư viện ảnh'
    });

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets) {
      const newImgs = result.assets.map(a => ({
        uri: a.uri,
        name: a.uri.split('/').pop() || `img_${Date.now()}.jpg`,
        type: 'image/jpeg',
      }));
      setImages(prev => [...prev, ...newImgs]);
    }
  };

  const removeImage = (index: number) => {
    const img = images[index];
    
    // Nếu là ảnh cũ (có maMedia), cần xóa từ server
    if (img.maMedia) {
      showDestructiveConfirm(
        'Xóa hình ảnh',
        'Bạn có chắc muốn xóa hình ảnh này? Hành động này không thể hoàn tác.',
        'Xóa',
        async () => {
          setIsDeleting(true);
          try {
            // Gọi API xóa ngay lập tức với hardDelete = true
            await productApi.deleteImage(maSanPham, img.maMedia!, true);
            
            // Xóa khỏi danh sách hiển thị
            setImages(prev => prev.filter((_, i) => i !== index));
            
            Toast.show({
              type: 'success',
              text1: 'Thành công',
              text2: 'Đã xóa hình ảnh!'
            });
          } catch (error: any) {
            Toast.show({
              type: 'error',
              text1: 'Lỗi',
              text2: error.message || 'Không thể xóa hình ảnh'
            });
          } finally {
            setIsDeleting(false);
          }
        }
      );
    } else {
      // Ảnh mới chưa upload, xóa trực tiếp khỏi danh sách
      setImages(prev => prev.filter((_, i) => i !== index));
    }
  };

  const validate = () => {
    if (!name.trim()) {
      Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Tên sản phẩm bắt buộc' });
      return false;
    }
    if (!price || Number(price) <= 0) {
      Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Giá bán phải > 0' });
      return false;
    }
    if (images.length === 0) {
      Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Cần ít nhất 1 hình ảnh' });
      return false;
    }
    if (!selectedMaLoai || !selectedMaThuongHieu) {
      Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Chọn loại và thương hiệu' });
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);

    const formData = new FormData();

    formData.append('MaSanPham', maSanPham.toString());
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

    // Ảnh mới
    images.forEach(img => {
      if (!img.maMedia) {
        if (Platform.OS === 'web' && img.file) {
          formData.append('newImageFiles', img.file, img.name);
        } else {
          formData.append('newImageFiles', {
            uri: img.uri,
            name: img.name,
            type: img.type,
          } as any);
        }
      }
    });

    try {
      const res = await fetch(`${API_URL}/api/SanPham/${id}`, {
        method: 'PUT',
        body: formData,
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(err || 'Cập nhật thất bại');
      }

      Toast.show({
        type: 'success',
        text1: 'Thành công!',
        text2: 'Sản phẩm đã được cập nhật!',
        onHide: () => router.back()
      });
      setTimeout(() => router.back(), 1000);
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: err.message || 'Không thể cập nhật'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Đang tải sản phẩm...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        {/* Thông tin cơ bản */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Thông Tin Cơ Bản</Text>
          <Input label="Tên Sản Phẩm" value={name} onChangeText={setName} />
          <Input label="Mô Tả" value={description} onChangeText={setDescription} multiline style={styles.textArea} />
          <Input label="Mã Vạch" value={maVach} onChangeText={setMaVach} />

            <Input
              label="Giá Bán"
              value={price}
              onChangeText={setPrice}
              keyboardType="decimal-pad"
              containerStyle={styles.priceInput}
            />
            <Input
              label="Giá Sale (Tùy chọn)"
              value={discountPrice}
              onChangeText={setDiscountPrice}
              keyboardType="decimal-pad"
              containerStyle={styles.priceInput}
            />


          <Input label="Số Lượng Tồn Kho" value={stock} onChangeText={setStock} keyboardType="number-pad" />
        </Card>

        {/* Giới tính */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Giới Tính</Text>
          <View style={styles.chipRow}>
            {['Phụ Nữ', 'Nam', 'Trẻ Em', 'Phụ Kiện'].map(item => (
              <TouchableOpacity
                key={item}
                style={[styles.chip, gioiTinh === item && styles.activeChip]}
                onPress={() => setGioiTinh(item)}
              >
                <Text style={[styles.chipText, gioiTinh === item && styles.activeChipText]}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Loại sản phẩm */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Loại Sản Phẩm</Text>
          <View style={styles.chipRow}>
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
          <View style={styles.chipRow}>
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
          <View style={styles.chipRow}>
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
              <Text style={styles.addButtonText}>Thêm ảnh</Text>
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
                <TouchableOpacity 
                  style={styles.removeBtn} 
                  onPress={() => removeImage(index)}
                  disabled={isDeleting}
                >
                  <Trash2 size={18} color="#fff" />
                </TouchableOpacity>
              </View>
            )}
            ListEmptyComponent={<Text style={styles.emptyText}>Chưa có hình ảnh</Text>}
          />
        </Card>

        {/* Nút hành động */}
        <View style={styles.actions}>
          <Button title="Hủy" variant="outline" onPress={() => router.back()} style={styles.actionBtn} />
          <Button
            title={saving ? 'Đang lưu...' : 'Cập Nhật'}
            onPress={handleSave}
            disabled={saving}
            style={styles.actionBtn}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 50 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, color: colors.textLight, fontSize: 16 },
  section: { padding: 16, marginBottom: 16, borderRadius: 12 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: colors.text, marginBottom: 12 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  textArea: { minHeight: 100, textAlignVertical: 'top' },
  priceRow: { flexDirection: 'row', gap: 12 },
  priceInput: { flex: 1 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
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
  removeBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 16,
    padding: 6,
  },
  emptyText: { color: colors.textLight, textAlign: 'center', padding: 20 },
  actions: { flexDirection: 'row', marginTop: 20, gap: 12 },
  actionBtn: { flex: 1 },
});