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

import { useWindowDimensions } from 'react-native';

interface ProductCardProps {
  product: Product;
  width?: number;
  variant?: 'grid' | 'list';
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  width: customWidth,
  variant = 'grid',
}) => {
  const { width: windowWidth } = useWindowDimensions();
  // Use passed width or fallback to 2 columns (mobile default)
  // For list variant, we typically default to full width minus padding if not specified
  const defaultGridWidth = (windowWidth - 48) / 2;
  const width = customWidth || (variant === 'list' ? windowWidth - 32 : defaultGridWidth);

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
    const anyProd = product as any;
    if (anyProd.salePercent !== undefined && anyProd.salePercent !== null) {
      return `-${anyProd.salePercent}%`;
    }

    if (!product.discountPrice) return null;
    const percent = Math.round((1 - product.discountPrice / product.price) * 100);
    return `-${percent}%`;
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
  };

  const isList = variant === 'list';

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.9}
      style={[
        styles.container, 
        { width },
        isList && styles.listContainer
      ]}
    >
      <Card style={[styles.card, isList && styles.listCard]}>
        <View style={isList ? styles.listImageContainer : styles.imageContainer}>
          <Image
            source={{ uri: product.images[0] }}
            style={styles.image}
            resizeMode="cover"
          />

          {product.discountPrice && (
            <View style={[styles.discountBadge, isList && styles.listDiscountBadge]}>
              <Text style={styles.discountText}>{calculateDiscount()}</Text>
            </View>
          )}

          {!isList && (
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
          )}
        </View>

        <View style={[styles.infoContainer, isList && styles.listInfoContainer]}>
          <View style={isList ? styles.listHeader : null}>
            <Text 
              style={[styles.name, isList && styles.listName]} 
              numberOfLines={isList ? 2 : 1}
            >
              {product.name}
            </Text>
            
            {isList && (
              <TouchableOpacity
                onPress={toggleWishlist}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Heart
                  size={20}
                  color={isWishlisted ? colors.error : colors.textLight}
                  fill={isWishlisted ? colors.error : 'none'}
                />
              </TouchableOpacity>
            )}
          </View>

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
          
          {/* Optional: Add more details for list view */}
          {isList && (product as any).reviewCount !== undefined && (
            <Text style={styles.listMeta}>
              ⭐ {(product as any).rating?.toFixed(1) || '0.0'} ({(product as any).reviewCount} đánh giá)
            </Text>
          )}
        </View>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  listContainer: {
    marginBottom: 12,
  },
  card: {
    padding: 0,
    overflow: 'hidden',
  },
  listCard: {
    flexDirection: 'row',
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: 3 / 4,
  },
  listImageContainer: {
    position: 'relative',
    width: 120,
    height: 120,
  },
  image: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: 12, // grid
    borderTopRightRadius: 12, // grid
    // Logic for list border radius handled by overflow hidden on card or can be specific:
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: colors.error,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    zIndex: 1,
  },
  listDiscountBadge: {
    top: 4,
    left: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
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
    zIndex: 1,
  },
  infoContainer: {
    padding: 12,
  },
  listInfoContainer: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: colors.text,
  },
  listName: {
    fontSize: 15,
    marginBottom: 0,
    flex: 1,
    marginRight: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
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
  listMeta: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 4,
  },
});
