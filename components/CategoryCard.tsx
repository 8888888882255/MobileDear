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
    switch (size) {
      case 'small':
        return { width: 120, height: 120 };
      case 'medium':
        return { width: 160, height: 160 };
      case 'large':
        return { width: 200, height: 200 };
      default:
        return { width: 160, height: 160 };
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
            {category.subcategories.length} Danh mục con
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
