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
  PackageX,
} from 'lucide-react-native';
import { Skeleton } from '@/components/ui/Skeleton';
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
      router.replace('/');
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

  const renderSkeleton = () => (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Skeleton width="100%" height={SCREEN_WIDTH * 1.2} borderRadius={0} />
        <View style={styles.thumbnailContainer}>
          {[1, 2, 3, 4].map((i) => (
             <Skeleton key={i} width={60} height={60} borderRadius={8} style={{ marginRight: 8 }} />
          ))}
        </View>
        <View style={styles.infoContainer}>
          <Skeleton width="50%" height={16} style={{ marginBottom: 8 }} />
          <Skeleton width="80%" height={24} style={{ marginBottom: 12 }} />
          <Skeleton width="40%" height={16} style={{ marginBottom: 16 }} />
          <Skeleton width="30%" height={24} style={{ marginBottom: 20 }} />
          <Skeleton width="90%" height={16} style={{ marginBottom: 8 }} />
          <Skeleton width="90%" height={16} style={{ marginBottom: 8 }} />
          <Skeleton width="70%" height={16} style={{ marginBottom: 8 }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );

  if (loadingProduct) {
    return renderSkeleton();
  }

  if (!product) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <View style={styles.notFoundIconContainer}>
             <PackageX size={64} color={colors.textLight} />
          </View>
          <Text style={styles.notFoundText}>Không tìm thấy sản phẩm</Text>
          <Text style={styles.notFoundSubtext}>Sản phẩm này có thể đã bị xóa hoặc không tồn tại.</Text>
          <Button title="Quay lại trang chủ" onPress={handleBack} style={{ marginTop: 20 }} />
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

  // Responsive layout calculation
  const isDesktop = SCREEN_WIDTH > 768;
  const containerStyle = isDesktop ? { flexDirection: 'row', maxWidth: 1200, alignSelf: 'center', width: '100%', gap: 40, padding: 32 } : { flexDirection: 'column' };
  const leftColumnStyle = isDesktop ? { flex: 1.5 } : { width: '100%' };
  const rightColumnStyle = isDesktop ? { flex: 1 } : { padding: 16 };
  const imageStyle = isDesktop ? { width: '100%', height: 500, borderRadius: 12 } : { width: SCREEN_WIDTH, height: SCREEN_WIDTH * 1.2 };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={isDesktop ? { flexGrow: 1, justifyContent: 'center' } : {}}>
        
        <View style={containerStyle as any}>
          {/* Left Column: Images */}
          <View style={leftColumnStyle as any}>
            <View style={[styles.imageContainer, imageStyle as any]}>
              <Image source={{ uri: product.images[selectedImage] || 'https://via.placeholder.com/400' }} style={styles.mainImage} resizeMode={isDesktop ? 'contain' : 'cover'} />
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

             {/* Reviews on Desktop can go full width below or stay in left column? Let's keep in flow for now or move below columns if parent permits. 
                 For side-by-side, usually reviews are at bottom full width.
                 But for simplicity in this View structure, let's put reviews below the "columns" wrapper if we want full width. 
                 For now, let's put Reviews in the Left Column for Desktop to balance height, or a separate section below.
                 Let's keep it simple: Render Reviews AFTER the main flex-row container for Desktop. 
             */}
          </View>

          {/* Right Column: Info */}
          <View style={rightColumnStyle as any}>
            <Text style={styles.category}>{product.category} • {product.subcategory}</Text>
            <Text style={[styles.name, isDesktop && { fontSize: 32 }]}>{product.name}</Text>

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

            <View style={styles.priceContainer}>
              {product.discountPrice ? (
                <>
                  <Text style={[styles.discountPrice, isDesktop && { fontSize: 28 }]}>{product.discountPrice.toLocaleString('vi-VN')}₫</Text>
                  <Text style={styles.originalPrice}>{product.price.toLocaleString('vi-VN')}₫</Text>
                  <View style={styles.discountBadge}>
                    <Text style={styles.discountText}>-{Math.round((1 - product.discountPrice / product.price) * 100)}%</Text>
                  </View>
                </>
              ) : (
                <Text style={[styles.price, isDesktop && { fontSize: 28 }]}>{product.price.toLocaleString('vi-VN')}₫</Text>
              )}
            </View>

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

             {/* Add to Cart Actions (Inline for Desktop) */}
             <View style={[styles.actionContainer, isDesktop && { marginTop: 24, padding: 0, borderTopWidth: 0 }]}>
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

            <View style={[styles.sectionContainer, { marginTop: 32 }]}>
              <Text style={styles.sectionTitle}>Mô tả sản phẩm</Text>
              <Text style={styles.description}>{product.description}</Text>
            </View>
          </View>
        </View>
        
        {/* Reviews Section - Full Width on Desktop */}
        <View style={[styles.reviewsContainer, isDesktop && { maxWidth: 1200, alignSelf: 'center', width: '100%', paddingHorizontal: 32 }]}>
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

      </ScrollView>

      {/* Mobile Bottom Bar - Hide on Desktop */}
      {!isDesktop && (
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
      )}
    </SafeAreaView>
  );
}

// Thêm styles cho phần đánh giá
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  loadingText: { marginTop: 12, fontSize: 16, color: colors.textLight },
  notFoundIconContainer: { marginBottom: 16, opacity: 0.5 },
  notFoundText: { fontSize: 20, fontWeight: 'bold', marginBottom: 8, color: colors.text },
  notFoundSubtext: { fontSize: 14, color: colors.textLight, textAlign: 'center', marginBottom: 20 },
  imageContainer: { position: 'relative', overflow: 'hidden' },
  mainImage: { width: '100%', height: '100%' },
  imageNavButton: { position: 'absolute', top: '50%', width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center', transform: [{ translateY: -20 }] },
  prevButton: { left: 10 },
  nextButton: { right: 10 },
  wishlistButton: { position: 'absolute', top: 15, right: 15, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
  thumbnailContainer: { flexDirection: 'row', padding: 10, backgroundColor: '#fff', flexWrap: 'wrap' },
  thumbnailButton: { width: 60, height: 60, borderRadius: 8, marginRight: 8, marginBottom: 8, borderWidth: 1, borderColor: '#e0e0e0', overflow: 'hidden' },
  selectedThumbnail: { borderColor: colors.primary, borderWidth: 2 },
  thumbnail: { width: '100%', height: '100%' },
  infoContainer: { padding: 16 }, // Kept for reference but not used in split layout directly
  category: { fontSize: 14, color: colors.textLight, marginBottom: 4 },
  name: { fontSize: 24, fontWeight: 'bold', marginBottom: 8, color: colors.text },
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
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12, color: colors.text },
  quantityContainer: { flexDirection: 'row', alignItems: 'center' },
  quantityButton: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, borderColor: colors.border, justifyContent: 'center', alignItems: 'center' },
  quantityButtonText: { fontSize: 18, fontWeight: 'bold', color: colors.text },
  quantityText: { fontSize: 16, marginHorizontal: 16, fontWeight: 'bold', color: colors.text },
  stockText: { fontSize: 14, color: colors.textLight, marginLeft: 16 },
  description: { fontSize: 16, lineHeight: 24, color: colors.text },
  reviewsContainer: { marginTop: 20, paddingTop: 20, borderTopWidth: 8, borderTopColor: '#f5f5f5', paddingHorizontal: 16 },
  reviewsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  reviewsTitle: { fontSize: 18, fontWeight: 'bold', color: colors.text },
  writeReviewButton: { flexDirection: 'row', alignItems: 'center' },
  writeReviewText: { marginLeft: 6, color: colors.primary, fontWeight: '600' },
  reviewItem: { marginBottom: 20, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: '#eee' },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  reviewerAvatar: { width: 40, height: 40, borderRadius: 20, marginRight: 12 },
  reviewerName: { fontSize: 15, fontWeight: '600', color: colors.text },
  reviewDate: { fontSize: 12, color: colors.textLight, marginLeft: 'auto' },
  reviewTitle: { fontSize: 15, fontWeight: '600', marginBottom: 4, color: colors.text },
  reviewComment: { fontSize: 14, color: colors.text, lineHeight: 20, marginBottom: 12 },
  reviewImages: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  reviewImage: { width: 80, height: 80, borderRadius: 8 },
  noReviewsText: { fontSize: 15, color: colors.textLight, textAlign: 'center', paddingVertical: 30, fontStyle: 'italic' },
  
  // Action Container for Desktop
  actionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16
  },
  
  // Mobile Bottom Bar
  bottomBar: { flexDirection: 'row', padding: 16, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: '#fff' },
  priceBottomContainer: { flex: 1, justifyContent: 'center' },
  priceBottomLabel: { fontSize: 14, color: colors.textLight },
  priceBottomValue: { fontSize: 20, fontWeight: 'bold', color: colors.primary },
  addToCartButton: { flex: 1, marginLeft: 16 },
});
