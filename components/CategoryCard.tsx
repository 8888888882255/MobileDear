import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ImageBackground,
  View
} from 'react-native';
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

  const getContainerStyle = () => {
    // Tăng kích thước lên 2/4 (gấp đôi so với bản 1/4 trước đó)
    switch (size) {
      case 'small':
        return { width: 80, height: 80 };
      case 'medium':
        return { width: 105, height: 105 };
      case 'large':
        return { width: 131, height: 131 };
      default:
        return { width: 105, height: 105 };
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
        {/* Chỉ hiển thị tên danh mục – không còn nền tối */}
        <View style={styles.textWrapper}>
          <Text style={styles.name}>{category.name}</Text>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 14,
    overflow: 'hidden',
    margin: 8
  },
  image: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end'
  },
  imageStyle: {
    borderRadius: 14
  },
  textWrapper: {
    padding: 10
  },
  name: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700'
  }
});
