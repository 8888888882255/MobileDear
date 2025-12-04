import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ImageBackground,
  View
} from 'react-native';
import { useRouter } from 'expo-router';
import { Category } from '@/types';
import colors from '@/constants/colors';

interface CategoryCardProps {
  category: Category;
  size?: 'small' | 'medium' | 'large';
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  size = 'medium'
}) => {
  const router = useRouter();

  const getContainerStyle = () => {
    // Reduce linear dimensions by half so area becomes 1/4 of original
    switch (size) {
      case 'small':
        return { width: 60, height: 60 };
      case 'medium':
        return { width: 80, height: 80 };
      case 'large':
        return { width: 100, height: 100 };
      default:
        return { width: 80, height: 80 };
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, getContainerStyle()]}
      activeOpacity={0.9}
    >
      <ImageBackground
        source={{ uri: category.image }}
        style={styles.image}
        imageStyle={styles.imageStyle}
      >
        <View style={styles.overlay}>
          <Text style={styles.name}>{category.name}</Text>
          <Text style={styles.itemCount}>
            {category.typeLabel ? category.typeLabel : `${category.productCount || 0} Sản phẩm`}
          </Text>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'hidden',
    margin: 8,
  },
  image: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
  },
  imageStyle: {
    borderRadius: 12,
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: 12,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  name: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  itemCount: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
  },
});
