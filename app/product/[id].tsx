

import React, { useState } from 'react';
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
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
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
import { ProductReview } from '@/components/ProductReview';
import { useCartStore } from '@/store/cart-store';
import { useWishlistStore } from '@/store/wishlist-store';
import { useUserStore } from '@/store/user-store';
import colors from '@/constants/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Đánh giá mẫu
const mockReviews = [
  {
    id: '1',
    userId: '101',
    userName: 'Nguyễn Văn An',
    rating: 5,
    title: 'Vải đẹp, size vừa vặn!',
    comment: 'Áo chất lượng, giao hàng nhanh. Mặc lên rất đẹp. Sẽ ủng hộ thêm!',
    date: '2024-07-01',
    images: [
      'https://images.unsplash.com/photo-1560243563-062bfc001d68?auto=format&fit=crop&w=500&q=60',
    ],
  },
  {
    id: '2',
    userId: '102',
    userName: 'Trần Thị Bình',
    rating: 4,
    title: 'Tạm ổn',
    comment: 'Hàng ok nhưng màu hơi khác hình một chút.',
    date: '2024-06-29',
    images: [
      'https://images.unsplash.com/photo-1560243563-062bfc001d68?auto=format&fit=crop&w=500&q=60',
    ],
  },
];

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const API_URL = Constants?.expoConfig?.extra?.apiUrl || 'http://192.168.1.11:5083';
  const pid = Array.isArray(id) ? id[0] : id;
  const productDetailUrl = (idValue: string | number) => `${API_URL}/api/SanPham/${idValue}`;

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch product by id from backend
  React.useEffect(() => {
    let mounted = true;
    const fetchProduct = async () => {
      if (!pid) return;
      setIsLoading(true);
      try {
        const res = await fetch(productDetailUrl(pid));
        if (!res.ok) {
          const txt = await res.text();
          throw new Error(`API error ${res.status}: ${txt}`);
        }
        const data = await res.json();

        // Map API response to app Product type
        const mapped: Product = {
          id: String(data.maSanPham),
          name: data.tenSanPham,
          description: data.moTa || '',
          price: data.giaBan || 0,
          discountPrice: data.giaSauSale ?? data.giaSale ?? undefined,
          images: (data.medias || []).map((m: any) => {
            const path = m.duongDan || '';
            if (path.startsWith('http') || path.startsWith('data:')) return path;
            return `${API_URL}${path}`;
          }),
          category: data.tenLoai || '',
          subcategory: data.tenThuongHieu || undefined,
          sizes: [],
          colors: [],
          tags: [],
          rating: data.danhGiaTrungBinh ?? 0,
          reviewCount: data.soLuongDanhGia ?? 0,
          stock: data.soLuong ?? 0,
          featured: false,
          createdAt: data.ngayTao ?? new Date().toISOString(),
          updatedAt: data.ngayTao ?? new Date().toISOString(),
        };

        if (mounted) setProduct(mapped);
      } catch (err) {
        console.error('Fetch product error:', err);
        Alert.alert('Lỗi', 'Không thể tải thông tin sản phẩm.');
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    fetchProduct();
    return () => { mounted = false; };
  }, [pid]);

  const { addItem: addToCart } = useCartStore();
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlistStore();
  const { isAuthenticated } = useUserStore();

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);

  const isWishlisted = product ? isInWishlist(product.id) : false;
  if (isLoading) {
    return (
      <SafeAreaView style={styles.notFoundContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.notFoundText, { marginTop: 12 }]}>Đang tải sản phẩm...</Text>
      </SafeAreaView>
    );
  }

  if (!product && !isLoading) {
    return (
      <SafeAreaView style={styles.notFoundContainer}>
        <Text style={styles.notFoundText}>Không tìm thấy sản phẩm</Text>
        <Button title="Quay lại" onPress={() => router.back()} style={styles.backButton} />
      </SafeAreaView>
    );
  }

  // TypeScript narrowing: product is guaranteed non-null here (we returned above),
  // but help the compiler by asserting for local use.
  if (!product) return null;

  const handleAddToCart = () => {
    setIsAddingToCart(true);
    setTimeout(() => {
      // Sizes/colors removed; pass empty strings as placeholders
      addToCart(product!, quantity, '', '');
      setIsAddingToCart(false);
      Alert.alert('Thành công', 'Sản phẩm đã được thêm vào giỏ hàng');
    }, 500);
  };

  const handleToggleWishlist = () => {
    isWishlisted ? removeFromWishlist(product!.id) : addToWishlist(product!);
  };

  const handleIncreaseQuantity = () => {
    if (quantity < product.stock) setQuantity(quantity + 1);
  };

  const handleDecreaseQuantity = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const handleImageChange = (index: number) => setSelectedImage(index);

  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % product.images.length);
  };

  const prevImage = () => {
    setSelectedImage((prev) => (prev - 1 + product.images.length) % product.images.length);
  };

  const handleWriteReview = () => {
    if (!isAuthenticated) {
      router.push(`/auth/login?redirect=/product/review/${product.id}`);
    } else {
      router.push(`/product/review/${product.id}`);
    }
  };

  const displayedReviews = showAllReviews ? mockReviews : mockReviews.slice(0, 2);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: product.images[selectedImage] }} style={styles.mainImage} />
          <TouchableOpacity style={[styles.imageNavButton, styles.prevButton]} onPress={prevImage}>
            <ChevronLeft size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.imageNavButton, styles.nextButton]} onPress={nextImage}>
            <ChevronRight size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.wishlistButton} onPress={handleToggleWishlist}>
            <Heart
              size={24}
              color={isWishlisted ? colors.error : '#fff'}
              fill={isWishlisted ? colors.error : 'none'}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.thumbnailContainer}>
          {product.images.map((image, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => handleImageChange(index)}
              style={[
                styles.thumbnailButton,
                selectedImage === index && styles.selectedThumbnail,
              ]}
            >
              <Image source={{ uri: image }} style={styles.thumbnail} />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.category}>
            {product.category} • {product.subcategory}
          </Text>
          <Text style={styles.name}>{product.name}</Text>

          <View style={styles.ratingContainer}>
            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={16}
                  color={star <= Math.floor(product.rating) ? colors.primary : colors.border}
                  fill={star <= Math.floor(product.rating) ? colors.primary : 'none'}
                />
              ))}
            </View>
            <Text style={styles.ratingText}>
              {product.rating.toFixed(1)} ({product.reviewCount} đánh giá)
            </Text>
          </View>

          <View style={styles.priceContainer}>
            {product.discountPrice ? (
              <>
                <Text style={styles.discountPrice}>
                  {product.discountPrice.toLocaleString('vi-VN')}₫
                </Text>
                <Text style={styles.originalPrice}>
                  {product.price.toLocaleString('vi-VN')}₫
                </Text>
                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>
                    -{Math.round((1 - product.discountPrice / product.price) * 100)}%
                  </Text>
                </View>
              </>
            ) : (
              <Text style={styles.price}>{product.price.toLocaleString('vi-VN')}₫</Text>
            )}
          </View>

          {/* Size and color selection removed per request */}

          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Số lượng</Text>
            <View style={styles.quantityContainer}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={handleDecreaseQuantity}
                disabled={quantity <= 1}
              >
                <Text style={styles.quantityButtonText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.quantityText}>{quantity}</Text>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={handleIncreaseQuantity}
                disabled={quantity >= product.stock}
              >
                <Text style={styles.quantityButtonText}>+</Text>
              </TouchableOpacity>
              <Text style={styles.stockText}>Còn {product.stock} sản phẩm</Text>
            </View>
          </View>

          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Mô tả sản phẩm</Text>
            <Text style={styles.description}>{product.description}</Text>
          </View>

          <View style={styles.reviewsContainer}>
            <View style={styles.reviewsHeader}>
              <Text style={styles.reviewsTitle}>Đánh giá từ khách hàng</Text>
              <TouchableOpacity style={styles.writeReviewButton} onPress={handleWriteReview}>
                <MessageSquare size={16} color={colors.primary} />
                <Text style={styles.writeReviewText}>Viết đánh giá</Text>
              </TouchableOpacity>
            </View>

            {displayedReviews.length > 0 ? (
              <>
                {displayedReviews.map((review) => (
                  <ProductReview key={review.id} review={review} />
                ))}
                {mockReviews.length > 2 && (
                  <TouchableOpacity
                    style={styles.showMoreButton}
                    onPress={() => setShowAllReviews(!showAllReviews)}
                  >
                    <Text style={styles.showMoreText}>
                      {showAllReviews ? 'Thu gọn' : `Xem tất cả (${mockReviews.length})`}
                    </Text>
                    <ChevronRight size={16} color={colors.primary} />
                  </TouchableOpacity>
                )}
              </>
            ) : (
              <Text style={styles.noReviewsText}>Chưa có đánh giá nào</Text>
            )}
          </View>
        </View>
      </ScrollView>

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  notFoundText: {
    fontSize: 18,
    marginBottom: 20,
  },
  backButton: {
    width: 200,
  },
  imageContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * 1.2,
    position: 'relative',
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  imageNavButton: {
    position: 'absolute',
    top: '50%',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ translateY: -20 }],
  },
  prevButton: {
    left: 10,
  },
  nextButton: {
    right: 10,
  },
  wishlistButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnailContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#fff',
  },
  thumbnailButton: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    overflow: 'hidden',
  },
  selectedThumbnail: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  infoContainer: {
    padding: 16,
  },
  headerContainer: {
    marginBottom: 20,
  },
  category: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  starsContainer: {
    flexDirection: 'row',
    marginRight: 8,
  },
  ratingText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  price: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  discountPrice: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.primary,
  },
  originalPrice: {
    fontSize: 16,
    color: colors.textSecondary,
    textDecorationLine: 'line-through',
    marginLeft: 8,
  },
  discountBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 8,
  },
  discountText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  sizeOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 8,
    marginBottom: 8,
  },
  colorOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedOption: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  sizeText: {
    fontSize: 14,
  },
  colorText: {
    fontSize: 14,
  },
  selectedOptionText: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  quantityText: {
    fontSize: 16,
    marginHorizontal: 16,
    fontWeight: 'bold',
  },
  stockText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 16,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.text,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  tag: {
    backgroundColor: colors.backgroundLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  reviewsContainer: {
    marginTop: 10,
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  reviewsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  writeReviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  writeReviewText: {
    marginLeft: 4,
    color: colors.primary,
    fontWeight: '500',
  },
  showMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 8,
  },
  showMoreText: {
    color: colors.primary,
    fontWeight: '500',
    marginRight: 4,
  },
  noReviewsText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 20,
  },
  bottomBar: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: '#fff',
  },
  priceBottomContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  priceBottomLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  priceBottomValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  addToCartButton: {
    flex: 1,
    marginLeft: 16,
  },
});