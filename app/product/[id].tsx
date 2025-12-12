// app/(tabs)/product/[id]/index.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { useLocalSearchParams, useRouter, useNavigation } from 'expo-router';
import Constants from 'expo-constants';
import { Product } from '@/types';
import {
  Heart,
  Star,
  ChevronRight,
  ChevronLeft,
  ShoppingBag,
  MessageSquare,
} from 'lucide-react-native';
import { Button } from '@/components/ui/Button';
import { useCartStore } from '@/store/cart-store';
import { useWishlistStore } from '@/store/wishlist-store';
import { useUserStore } from '@/store/user-store';
import colors from '@/constants/colors';

import { api } from '@/src/config/api';

// Moved inside component

const API_URL = api.baseUrl;
const DEFAULT_AVATAR = require('@/assets/images/icon.png'); // Avatar mặc định

interface Review {
  maBinhLuan: number;
  tieuDe?: string;
  noiDung?: string;
  danhGia?: number;
  ngayTao: string;
  trangThai: number;
  hoTen?: string;
  avt?: string;
  medias: { duongDan: string }[];
}

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const navigation = useNavigation();
  const { width: SCREEN_WIDTH } = useWindowDimensions();
  const pid = Array.isArray(id) ? id[0] : id;

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      router.replace('/(tabs)/');
    }
  };

  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(true);

  const { addItem: addToCart } = useCartStore();
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlistStore();
  const { isAuthenticated } = useUserStore();

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  // Fetch sản phẩm
  useEffect(() => {
    const fetchProduct = async () => {
      if (!pid) return;
      try {
        const res = await fetch(`${API_URL}/api/SanPham/${pid}`);
        if (!res.ok) throw new Error('Không tải được sản phẩm');
        const data = await res.json();

        const mapped: Product = {
          id: String(data.maSanPham),
          name: data.tenSanPham,
          description: data.moTa || 'Không có mô tả',
          price: data.giaBan || 0,
          discountPrice: data.giaSauSale ?? data.giaSale ?? undefined,
          images: (data.medias || []).map((m: any) => `${API_URL}${m.duongDan}`),
          category: data.tenLoai || '',
          subcategory: data.tenThuongHieu || undefined,
          rating: data.danhGiaTrungBinh ?? 0,
          reviewCount: data.soLuongDanhGia ?? 0,
          stock: data.soLuong ?? 0,
          sizes: [], colors: [], tags: [], featured: false,
          createdAt: data.ngayTao,
          updatedAt: data.ngayTao,
        };

        setProduct(mapped);
      } catch (err) {
        Toast.show({
          type: 'error',
          text1: 'Lỗi',
          text2: 'Không thể tải sản phẩm',
        });
      } finally {
        setLoadingProduct(false);
      }
    };

    fetchProduct();
  }, [pid]);

  // Fetch bình luận thật
  useEffect(() => {
    const fetchReviews = async () => {
      if (!pid) return;
      try {
        const res = await fetch(`${API_URL}/api/BinhLuan/search?maSanPham=${pid}`);
        if (!res.ok) throw new Error('Không tải được đánh giá');
        const data: Review[] = await res.json();

        setReviews(data.filter(r => r.trangThai === 1)); // Chỉ hiện bình luận đã duyệt
      } catch (err) {
        console.log('Lỗi tải đánh giá:', err);
      } finally {
        setLoadingReviews(false);
      }
    };

    if (product) fetchReviews();
  }, [pid, product]);

  const isWishlisted = product ? isInWishlist(product.id) : false;

  if (loadingProduct) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Đang tải sản phẩm...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.notFoundText}>Không tìm thấy sản phẩm</Text>
          <Button title="Quay lại" onPress={handleBack} />
        </View>
      </SafeAreaView>
    );
  }

  const handleAddToCart = () => {
    setIsAddingToCart(true);
    setTimeout(() => {
      addToCart(product!, quantity, '', '');
      setIsAddingToCart(false);
      Toast.show({
        type: 'success',
        text1: 'Thành công',
        text2: 'Đã thêm vào giỏ hàng',
      });
    }, 500);
  };

  const handleToggleWishlist = () => {
    isWishlisted ? removeFromWishlist(product.id) : addToWishlist(product);
  };

  const handleWriteReview = () => {
    if (!isAuthenticated) {
      router.push(`/auth/login?redirect=/product/review/${product.id}`);
    } else {
      router.push(`/product/review/${product.id}`);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Ảnh sản phẩm - giữ nguyên đẹp */}
        <View style={[styles.imageContainer, { width: SCREEN_WIDTH, height: SCREEN_WIDTH * 1.2 }]}>
          <Image source={{ uri: product.images[selectedImage] || 'https://via.placeholder.com/400' }} style={styles.mainImage} />
          <TouchableOpacity style={[styles.imageNavButton, styles.prevButton]} onPress={() => setSelectedImage((prev) => (prev - 1 + product.images.length) % product.images.length)}>
            <ChevronLeft size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.imageNavButton, styles.nextButton]} onPress={() => setSelectedImage((prev) => (prev + 1) % product.images.length)}>
            <ChevronRight size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.wishlistButton} onPress={handleToggleWishlist}>
            <Heart size={24} color={isWishlisted ? colors.error : '#fff'} fill={isWishlisted ? colors.error : 'none'} />
          </TouchableOpacity>
        </View>

        <View style={styles.thumbnailContainer}>
          {product.images.map((img, i) => (
            <TouchableOpacity key={i} onPress={() => setSelectedImage(i)} style={[styles.thumbnailButton, selectedImage === i && styles.selectedThumbnail]}>
              <Image source={{ uri: img }} style={styles.thumbnail} />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.category}>{product.category} • {product.subcategory}</Text>
          <Text style={styles.name}>{product.name}</Text>

          <View style={styles.ratingContainer}>
            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} size={16} color={s <= Math.round(product.rating) ? colors.primary : colors.border} fill={s <= Math.round(product.rating) ? colors.primary : 'none'} />
              ))}
            </View>
            <Text style={styles.ratingText}>
              {product.rating.toFixed(1)} ({product.reviewCount} đánh giá)
            </Text>
          </View>

          {/* Giá - giữ nguyên */}
          <View style={styles.priceContainer}>
            {product.discountPrice ? (
              <>
                <Text style={styles.discountPrice}>{product.discountPrice.toLocaleString('vi-VN')}₫</Text>
                <Text style={styles.originalPrice}>{product.price.toLocaleString('vi-VN')}₫</Text>
                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>-{Math.round((1 - product.discountPrice / product.price) * 100)}%</Text>
                </View>
              </>
            ) : (
              <Text style={styles.price}>{product.price.toLocaleString('vi-VN')}₫</Text>
            )}
          </View>

          {/* Số lượng */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Số lượng</Text>
            <View style={styles.quantityContainer}>
              <TouchableOpacity style={styles.quantityButton} onPress={() => quantity > 1 && setQuantity(q => q - 1)} disabled={quantity <= 1}>
                <Text style={styles.quantityButtonText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.quantityText}>{quantity}</Text>
              <TouchableOpacity style={styles.quantityButton} onPress={() => quantity < product.stock && setQuantity(q => q + 1)} disabled={quantity >= product.stock}>
                <Text style={styles.quantityButtonText}>+</Text>
              </TouchableOpacity>
              <Text style={styles.stockText}>Còn {product.stock} sản phẩm</Text>
            </View>
          </View>

          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Mô tả sản phẩm</Text>
            <Text style={styles.description}>{product.description}</Text>
          </View>

          {/* ĐÁNH GIÁ THẬT TỪ BACKEND */}
          <View style={styles.reviewsContainer}>
            <View style={styles.reviewsHeader}>
              <Text style={styles.reviewsTitle}>Đánh giá từ khách hàng</Text>
              <TouchableOpacity style={styles.writeReviewButton} onPress={handleWriteReview}>
                <MessageSquare size={16} color={colors.primary} />
                <Text style={styles.writeReviewText}>Viết đánh giá</Text>
              </TouchableOpacity>
            </View>

            {loadingReviews ? (
              <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: 20 }} />
            ) : reviews.length > 0 ? (
              reviews.map((review) => (
                <View key={review.maBinhLuan} style={styles.reviewItem}>
                  <View style={styles.reviewHeader}>
                    <Image
                      source={review.avt ? { uri: API_URL + review.avt } : DEFAULT_AVATAR}
                      style={styles.reviewerAvatar}
                      defaultSource={DEFAULT_AVATAR}
                    />
                    <View>
                      <Text style={styles.reviewerName}>{review.hoTen || 'Khách hàng'}</Text>
                      <View style={styles.starsContainer}>
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} size={14} color={s <= (review.danhGia || 0) ? '#facc15' : colors.border} fill={s <= (review.danhGia || 0) ? '#facc15' : 'none'} />
                        ))}
                      </View>
                    </View>
                    <Text style={styles.reviewDate}>{formatDate(review.ngayTao)}</Text>
                  </View>

                  {review.tieuDe && <Text style={styles.reviewTitle}>{review.tieuDe}</Text>}
                  {review.noiDung && <Text style={styles.reviewComment}>{review.noiDung}</Text>}

                  {review.medias.length > 0 && (
                    <View style={styles.reviewImages}>
                      {review.medias.map((media, idx) => (
                        <Image key={idx} source={{ uri: API_URL + media.duongDan }} style={styles.reviewImage} />
                      ))}
                    </View>
                  )}
                </View>
              ))
            ) : (
              <Text style={styles.noReviewsText}>Chưa có đánh giá nào</Text>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Thanh dưới */}
      <View style={styles.bottomBar}>
        <View style={styles.priceBottomContainer}>
          <Text style={styles.priceBottomLabel}>Tạm tính</Text>
          <Text style={styles.priceBottomValue}>
            {((product.discountPrice || product.price) * quantity).toLocaleString('vi-VN')}₫
          </Text>
        </View>
        <Button
          title="Thêm vào giỏ"
          onPress={handleAddToCart}
          loading={isAddingToCart}
          icon={<ShoppingBag size={20} color="#fff" />}
          style={styles.addToCartButton}
        />
      </View>
    </SafeAreaView>
  );
}

// Thêm styles cho phần đánh giá
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 16, color: colors.textLight },
  notFoundText: { fontSize: 18, marginBottom: 20, color: colors.text },
  imageContainer: { position: 'relative' },
  mainImage: { width: '100%', height: '100%' },
  imageNavButton: { position: 'absolute', top: '50%', width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center', transform: [{ translateY: -20 }] },
  prevButton: { left: 10 },
  nextButton: { right: 10 },
  wishlistButton: { position: 'absolute', top: 15, right: 15, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
  thumbnailContainer: { flexDirection: 'row', padding: 10, backgroundColor: '#fff' },
  thumbnailButton: { width: 60, height: 60, borderRadius: 8, marginRight: 8, borderWidth: 1, borderColor: '#e0e0e0', overflow: 'hidden' },
  selectedThumbnail: { borderColor: colors.primary, borderWidth: 2 },
  thumbnail: { width: '100%', height: '100%' },
  infoContainer: { padding: 16 },
  category: { fontSize: 14, color: colors.textLight, marginBottom: 4 },
  name: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  ratingContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  starsContainer: { flexDirection: 'row', marginRight: 8 },
  ratingText: { fontSize: 14, color: colors.textLight },
  priceContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  price: { fontSize: 22, fontWeight: 'bold', color: colors.primary },
  discountPrice: { fontSize: 22, fontWeight: 'bold', color: colors.primary },
  originalPrice: { fontSize: 16, color: colors.textLight, textDecorationLine: 'line-through', marginLeft: 8 },
  discountBadge: { backgroundColor: colors.primary, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, marginLeft: 8 },
  discountText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  sectionContainer: { marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  quantityContainer: { flexDirection: 'row', alignItems: 'center' },
  quantityButton: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, borderColor: colors.border, justifyContent: 'center', alignItems: 'center' },
  quantityButtonText: { fontSize: 18, fontWeight: 'bold' },
  quantityText: { fontSize: 16, marginHorizontal: 16, fontWeight: 'bold' },
  stockText: { fontSize: 14, color: colors.textLight, marginLeft: 16 },
  description: { fontSize: 16, lineHeight: 24, color: colors.text },
  reviewsContainer: { marginTop: 20, paddingTop: 20, borderTopWidth: 8, borderTopColor: '#f5f5f5' },
  reviewsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  reviewsTitle: { fontSize: 18, fontWeight: 'bold' },
  writeReviewButton: { flexDirection: 'row', alignItems: 'center' },
  writeReviewText: { marginLeft: 6, color: colors.primary, fontWeight: '600' },
  reviewItem: { marginBottom: 20, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: '#eee' },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  reviewerAvatar: { width: 40, height: 40, borderRadius: 20, marginRight: 12 },
  reviewerName: { fontSize: 15, fontWeight: '600' },
  reviewDate: { fontSize: 12, color: colors.textLight, marginLeft: 'auto' },
  reviewTitle: { fontSize: 15, fontWeight: '600', marginBottom: 4 },
  reviewComment: { fontSize: 14, color: colors.text, lineHeight: 20, marginBottom: 12 },
  reviewImages: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  reviewImage: { width: 80, height: 80, borderRadius: 8 },
  noReviewsText: { fontSize: 15, color: colors.textLight, textAlign: 'center', paddingVertical: 30, fontStyle: 'italic' },
  bottomBar: { flexDirection: 'row', padding: 16, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: '#fff' },
  priceBottomContainer: { flex: 1, justifyContent: 'center' },
  priceBottomLabel: { fontSize: 14, color: colors.textLight },
  priceBottomValue: { fontSize: 20, fontWeight: 'bold', color: colors.primary },
  addToCartButton: { flex: 1, marginLeft: 16 },
});
