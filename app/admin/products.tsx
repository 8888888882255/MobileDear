import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  SafeAreaView,
  Image,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2,
  ChevronDown,
  ChevronUp
} from 'lucide-react-native';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { products } from '@/mocks/products';
import { useUserStore } from '@/store/user-store';
import colors from '@/constants/colors';

export default function AdminProductsScreen() {
  const router = useRouter();
  const { user } = useUserStore();
  
  // Redirect if not admin
  if (!user?.isAdmin) {
    router.replace('/');
    return null;
  }
  
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showFilters, setShowFilters] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState([...products]);
  
  const handleSearch = (text: string) => {
    setSearchQuery(text);
    
    if (text.trim() === '') {
      setFilteredProducts([...products]);
      return;
    }
    
    const filtered = products.filter(
      product => 
        product.name.toLowerCase().includes(text.toLowerCase()) ||
        product.description.toLowerCase().includes(text.toLowerCase()) ||
        product.category.toLowerCase().includes(text.toLowerCase())
    );
    
    setFilteredProducts(filtered);
  };
  
  const handleSort = (field: string) => {
    if (sortBy === field) {
      // Toggle sort order if same field
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, default to ascending
      setSortBy(field);
      setSortOrder('asc');
    }
    
    // Apply sorting
    const sorted = [...filteredProducts].sort((a, b) => {
      let comparison = 0;
      
      switch (field) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'price':
          comparison = a.price - b.price;
          break;
        case 'stock':
          comparison = a.stock - b.stock;
          break;
        default:
          comparison = 0;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    setFilteredProducts(sorted);
  };
  
  const handleAddProduct = () => {
    router.push('/admin/product/new');
  };
  
  const handleEditProduct = (productId: string) => {
    router.push(`/admin/product/${productId}`);
  };
  
  const handleDeleteProduct = (productId: string) => {
    Alert.alert(
      "Delete Product",
      "Are you sure you want to delete this product?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive", 
          onPress: () => {
            // In a real app, you would call an API to delete the product
            // For this demo, we'll just filter it out of the local state
            const updatedProducts = filteredProducts.filter(
              product => product.id !== productId
            );
            setFilteredProducts(updatedProducts);
          } 
        }
      ]
    );
  };
  
  const renderProductItem = ({ item }: { item: typeof products[0] }) => (
    <Card style={styles.productCard}>
      <View style={styles.productContainer}>
        <Image 
          source={{ uri: item.images[0] }} 
          style={styles.productImage} 
          resizeMode="cover"
        />
        
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.productCategory}>{item.category}</Text>
          <View style={styles.productDetails}>
            <Text style={styles.productPrice}>
              ${(item.discountPrice || item.price).toFixed(2)}
            </Text>
            <Text style={styles.productStock}>
              Stock: {item.stock}
            </Text>
          </View>
        </View>
        
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleEditProduct(item.id)}
          >
            <Edit size={18} color={colors.primary} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDeleteProduct(item.id)}
          >
            <Trash2 size={18} color={colors.error} />
          </TouchableOpacity>
        </View>
      </View>
    </Card>
  );
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Input
          placeholder="Search products..."
          value={searchQuery}
          onChangeText={handleSearch}
          leftIcon={<Search size={20} color={colors.textLight} />}
          containerStyle={styles.searchContainer}
        />
        
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Filter size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>
      
      {showFilters && (
        <View style={styles.filtersContainer}>
          <Text style={styles.filtersTitle}>Sort By:</Text>
          
          <View style={styles.sortButtons}>
            <TouchableOpacity 
              style={[
                styles.sortButton,
                sortBy === 'name' && styles.activeSortButton
              ]}
              onPress={() => handleSort('name')}
            >
              <Text style={[
                styles.sortButtonText,
                sortBy === 'name' && styles.activeSortButtonText
              ]}>
                Name
              </Text>
              {sortBy === 'name' && (
                sortOrder === 'asc' ? 
                <ChevronUp size={16} color={colors.primary} /> : 
                <ChevronDown size={16} color={colors.primary} />
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.sortButton,
                sortBy === 'price' && styles.activeSortButton
              ]}
              onPress={() => handleSort('price')}
            >
              <Text style={[
                styles.sortButtonText,
                sortBy === 'price' && styles.activeSortButtonText
              ]}>
                Price
              </Text>
              {sortBy === 'price' && (
                sortOrder === 'asc' ? 
                <ChevronUp size={16} color={colors.primary} /> : 
                <ChevronDown size={16} color={colors.primary} />
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.sortButton,
                sortBy === 'stock' && styles.activeSortButton
              ]}
              onPress={() => handleSort('stock')}
            >
              <Text style={[
                styles.sortButtonText,
                sortBy === 'stock' && styles.activeSortButtonText
              ]}>
                Stock
              </Text>
              {sortBy === 'stock' && (
                sortOrder === 'asc' ? 
                <ChevronUp size={16} color={colors.primary} /> : 
                <ChevronDown size={16} color={colors.primary} />
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}
      
      <View style={styles.listHeader}>
        <Text style={styles.productCount}>
          {filteredProducts.length} products
        </Text>
        
        <Button
          title="Add Product"
          onPress={handleAddProduct}
          size="small"
          leftIcon={<Plus size={16} color="#fff" />}
        />
      </View>
      
      <FlatList
        data={filteredProducts}
        renderItem={renderProductItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No products found</Text>
            <Text style={styles.emptySubtext}>Try a different search term</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.card,
  },
  header: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchContainer: {
    flex: 1,
    marginBottom: 0,
  },
  filterButton: {
    marginLeft: 12,
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  filtersContainer: {
    padding: 16,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filtersTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  sortButtons: {
    flexDirection: 'row',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: colors.card,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  activeSortButton: {
    backgroundColor: colors.primary + '20',
    borderColor: colors.primary,
  },
  sortButtonText: {
    fontSize: 14,
    color: colors.text,
    marginRight: 4,
  },
  activeSortButtonText: {
    color: colors.primary,
    fontWeight: '500',
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  productCount: {
    fontSize: 14,
    color: colors.textLight,
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
  },
  productCard: {
    marginBottom: 12,
    padding: 12,
  },
  productContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
  },
  productName: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 4,
  },
  productCategory: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 4,
  },
  productDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  productPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
  },
  productStock: {
    fontSize: 14,
    color: colors.textLight,
  },
  actionsContainer: {
    flexDirection: 'row',
    marginLeft: 12,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  deleteButton: {
    borderColor: colors.error + '40',
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
  },
});