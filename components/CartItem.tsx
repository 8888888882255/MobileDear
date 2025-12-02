import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity 
} from 'react-native';
import { Minus, Plus, Trash2 } from 'lucide-react-native';
import { CartItem as CartItemType } from '@/types';
import { useCartStore } from '@/store/cart-store';
import colors from '@/constants/colors';

interface CartItemProps {
  item: CartItemType;
}

export const CartItemComponent: React.FC<CartItemProps> = ({ item }) => {
  const { updateQuantity, removeItem } = useCartStore();
  const { product, quantity, size, color } = item;
  
  const handleIncrement = () => {
    updateQuantity(product.id, size, color, quantity + 1);
  };
  
  const handleDecrement = () => {
    if (quantity > 1) {
      updateQuantity(product.id, size, color, quantity - 1);
    } else {
      handleRemove();
    }
  };
  
  const handleRemove = () => {
    removeItem(product.id, size, color);
  };
  
  const price = product.discountPrice || product.price;
  const totalPrice = price * quantity;
  
  return (
    <View style={styles.container}>
      <Image 
        source={{ uri: product.images[0] }} 
        style={styles.image} 
        resizeMode="cover"
      />
      
      <View style={styles.contentContainer}>
        <View style={styles.infoContainer}>
          <Text style={styles.name} numberOfLines={1}>{product.name}</Text>
          <Text style={styles.variant}>
            {color}, Size: {size}
          </Text>
          
          <View style={styles.priceContainer}>
            <Text style={styles.price}>${price.toFixed(2)}</Text>
            {product.discountPrice && (
              <Text style={styles.originalPrice}>${product.price.toFixed(2)}</Text>
            )}
          </View>
        </View>
        
        <View style={styles.actionsContainer}>
          <View style={styles.quantityContainer}>
            <TouchableOpacity 
              style={styles.quantityButton} 
              onPress={handleDecrement}
            >
              <Minus size={16} color={colors.text} />
            </TouchableOpacity>
            
            <Text style={styles.quantity}>{quantity}</Text>
            
            <TouchableOpacity 
              style={styles.quantityButton} 
              onPress={handleIncrement}
            >
              <Plus size={16} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity 
            style={styles.removeButton} 
            onPress={handleRemove}
          >
            <Trash2 size={18} color={colors.error} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: colors.background,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  contentContainer: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  infoContainer: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: colors.text,
  },
  variant: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 4,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginRight: 6,
  },
  originalPrice: {
    fontSize: 14,
    color: colors.textLight,
    textDecorationLine: 'line-through',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
  },
  quantityButton: {
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantity: {
    paddingHorizontal: 12,
    fontSize: 14,
    fontWeight: '600',
  },
  removeButton: {
    padding: 6,
  },
});