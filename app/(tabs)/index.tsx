import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import { BannerCarousel } from '@/components/BannerCarousel';
import { ProductCard } from '@/components/ProductCard';
import { CategoryCard } from '@/components/CategoryCard';
import { banners } from '@/mocks/banners';
import { products } from '@/mocks/products';
import { categories } from '@/mocks/categories';
import colors from '@/constants/colors';

export default function HomeScreen() {
  const router = useRouter();
  const featuredProducts = products.filter((product) => product.featured);

  const navigateToAllProducts = () => {
    router.push('/search');
  };

  const navigateToAllCategories = () => {
    router.push('/search?view=categories');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Text style={styles.storeName}>DearMent</Text>
          <Text style={styles.storeTagline}>Thời Trang & Phong Cách</Text>
        </View>

        <BannerCarousel banners={banners} />

        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Danh Mục</Text>
            <TouchableOpacity
              style={styles.viewAllButton}
              onPress={navigateToAllCategories}
            >
              <Text style={styles.viewAllText}>Xem tất cả</Text>
              <ChevronRight size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
          >
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </ScrollView>
        </View>

        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Sản Phẩm Nổi Bật</Text>
            <TouchableOpacity
              style={styles.viewAllButton}
              onPress={navigateToAllProducts}
            >
              <Text style={styles.viewAllText}>Xem tất cả</Text>
              <ChevronRight size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.productsGrid}>
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Hàng Mới Về</Text>
            <TouchableOpacity
              style={styles.viewAllButton}
              onPress={navigateToAllProducts}
            >
              <Text style={styles.viewAllText}>Xem tất cả</Text>
              <ChevronRight size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.productsGrid}>
            {products.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.card,
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    marginBottom: 20,
    alignItems: 'center',
  },
  storeName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
    letterSpacing: 2,
  },
  storeTagline: {
    fontSize: 14,
    color: colors.textLight,
    marginTop: 4,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 14,
    color: colors.primary,
    marginRight: 4,
  },
  categoriesContainer: {
    paddingRight: 16,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
});
