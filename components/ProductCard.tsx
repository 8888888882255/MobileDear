import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image
} from 'react-native';
import { useRouter } from 'expo-router';
import { Heart } from 'lucide-react-native';
import { Card } from '@/components/ui/Card';
import { Product } from '@/types';
import { useWishlistStore } from '@/store/wishlist-store';
import colors from '@/constants/colors';

interface ProductCardProps {
  product: Product;
  width?: number;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  width = (SCREEN_WIDTH - 48) / 2,
}) => {
  const router = useRouter();
  const { addItem, removeItem, isInWishlist } = useWishlistStore();
  const isWishlisted = isInWishlist(product.id);

  const handlePress = () => {
    router.push(`/product/${product.id}` as const);
  };

  const toggleWishlist = () => {
    if (isWishlisted) {
      removeItem(product.id);
    } else {
      addItem(product);
    }
  };

  const calculateDiscount = () => {
    if (!product.discountPrice) return null;
    const percent = Math.round((1 - product.discountPrice / product.price) * 100);
    return `Giảm ${percent}%`;
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.9}
      style={[styles.container, { width }]} // ✅ width now number only
    >
      <Card style={styles.card}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: product.images[0] }}
            style={styles.image}
            resizeMode="cover"
          />

          {product.discountPrice && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{calculateDiscount()}</Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.wishlistButton}
            onPress={toggleWishlist}
            activeOpacity={0.8}
          >
            <Heart
              size={20}
              color={isWishlisted ? colors.error : colors.textLight}
              fill={isWishlisted ? colors.error : 'none'}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.category}>{product.category}</Text>
          <Text style={styles.name} numberOfLines={1}>{product.name}</Text>

          <View style={styles.priceContainer}>
            {product.discountPrice ? (
              <>
                <Text style={styles.discountPrice}>{formatCurrency(product.discountPrice)}</Text>
                <Text style={styles.originalPrice}>{formatCurrency(product.price)}</Text>
              </>
            ) : (
              <Text style={styles.price}>{formatCurrency(product.price)}</Text>
            )}
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  card: {
    padding: 0,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: 3 / 4,
  },
  image: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: colors.error,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  discountText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  wishlistButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContainer: {
    padding: 12,
  },
  category: {
    fontSize: 12,
    color: colors.textLight,
    marginBottom: 4,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: colors.text,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  discountPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.error,
    marginRight: 6,
  },
  originalPrice: {
    fontSize: 14,
    color: colors.textLight,
    textDecorationLine: 'line-through',
  },
});
