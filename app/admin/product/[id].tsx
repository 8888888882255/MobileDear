import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Plus, Trash2 } from 'lucide-react-native';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useUserStore } from '@/store/user-store';
import colors from '@/constants/colors';
import { categories } from '@/mocks/categories';
import { products } from '@/mocks/products';

export default function EditProductScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useUserStore();

  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [discountPrice, setDiscountPrice] = useState('');
  const [category, setCategory] = useState('Women');
  const [subcategory, setSubcategory] = useState('');
  const [stock, setStock] = useState('');
  const [images, setImages] = useState<string[]>(['']);
  const [sizes, setSizes] = useState<string[]>(['']);
  const [productColors, setProductColors] = useState<string[]>(['']);
  const [tags, setTags] = useState<string[]>(['']);
  const [featured, setFeatured] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const product = products.find(p => p.id === id);
    if (product) {
      setName(product.name);
      setDescription(product.description);
      setPrice(product.price.toString());
      setDiscountPrice(product.discountPrice?.toString() || '');
      setCategory(product.category);
      setSubcategory(product.subcategory || '');
      setStock(product.stock.toString());
      setImages(product.images.length > 0 ? product.images : ['']);
      setSizes(product.sizes.length > 0 ? product.sizes : ['']);
      setProductColors(product.colors.length > 0 ? product.colors : ['']);
      setTags(product.tags.length > 0 ? product.tags : ['']);
      setFeatured(product.featured);
    }
    setLoading(false);
  }, [id]);

  if (!user?.isAdmin) {
    router.replace('/');
    return null;
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading product...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const selectedCategory = categories.find(c => c.name === category);

  const handleAddImage = () => {
    setImages([...images, '']);
  };

  const handleRemoveImage = (index: number) => {
    if (images.length > 1) {
      const updated = images.filter((_, i) => i !== index);
      setImages(updated);
    }
  };

  const handleUpdateImage = (index: number, value: string) => {
    const updated = [...images];
    updated[index] = value;
    setImages(updated);
  };

  const handleAddSize = () => {
    setSizes([...sizes, '']);
  };

  const handleRemoveSize = (index: number) => {
    if (sizes.length > 1) {
      const updated = sizes.filter((_, i) => i !== index);
      setSizes(updated);
    }
  };

  const handleUpdateSize = (index: number, value: string) => {
    const updated = [...sizes];
    updated[index] = value;
    setSizes(updated);
  };

  const handleAddColor = () => {
    setProductColors([...productColors, '']);
  };

  const handleRemoveColor = (index: number) => {
    if (productColors.length > 1) {
      const updated = productColors.filter((_, i) => i !== index);
      setProductColors(updated);
    }
  };

  const handleUpdateColor = (index: number, value: string) => {
    const updated = [...productColors];
    updated[index] = value;
    setProductColors(updated);
  };

  const handleAddTag = () => {
    setTags([...tags, '']);
  };

  const handleRemoveTag = (index: number) => {
    if (tags.length > 1) {
      const updated = tags.filter((_, i) => i !== index);
      setTags(updated);
    }
  };

  const handleUpdateTag = (index: number, value: string) => {
    const updated = [...tags];
    updated[index] = value;
    setTags(updated);
  };

  const validateForm = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Product name is required');
      return false;
    }
    if (!description.trim()) {
      Alert.alert('Error', 'Description is required');
      return false;
    }
    if (!price || parseFloat(price) <= 0) {
      Alert.alert('Error', 'Valid price is required');
      return false;
    }
    if (!stock || parseInt(stock, 10) < 0) {
      Alert.alert('Error', 'Valid stock quantity is required');
      return false;
    }
    if (images.filter(img => img.trim()).length === 0) {
      Alert.alert('Error', 'At least one image URL is required');
      return false;
    }
    if (sizes.filter(s => s.trim()).length === 0) {
      Alert.alert('Error', 'At least one size is required');
      return false;
    }
    if (productColors.filter(c => c.trim()).length === 0) {
      Alert.alert('Error', 'At least one color is required');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsSaving(true);

    const updatedProduct = {
      id,
      name: name.trim(),
      description: description.trim(),
      price: parseFloat(price),
      discountPrice: discountPrice ? parseFloat(discountPrice) : undefined,
      category,
      subcategory: subcategory || undefined,
      stock: parseInt(stock, 10),
      images: images.filter(img => img.trim()),
      sizes: sizes.filter(s => s.trim()),
      colors: productColors.filter(c => c.trim()),
      tags: tags.filter(t => t.trim()),
      featured,
      updatedAt: new Date().toISOString()
    };

    setTimeout(() => {
      setIsSaving(false);
      Alert.alert(
        'Success',
        'Product updated successfully!',
        [
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]
      );
    }, 500);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Information</Text>

            <Input
              label="Product Name"
              placeholder="Enter product name"
              value={name}
              onChangeText={setName}
            />

            <Input
              label="Description"
              placeholder="Enter product description"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              style={styles.textArea}
            />

            <View style={styles.row}>
              <Input
                label="Price"
                placeholder="0.00"
                value={price}
                onChangeText={setPrice}
                keyboardType="decimal-pad"
                containerStyle={styles.halfInput}
              />

              <Input
                label="Discount Price (Optional)"
                placeholder="0.00"
                value={discountPrice}
                onChangeText={setDiscountPrice}
                keyboardType="decimal-pad"
                containerStyle={styles.halfInput}
              />
            </View>

            <Input
              label="Stock Quantity"
              placeholder="0"
              value={stock}
              onChangeText={setStock}
              keyboardType="number-pad"
            />
          </Card>

          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Category</Text>

            <Text style={styles.label}>Category</Text>
            <View style={styles.categoryButtons}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryButton,
                    category === cat.name && styles.activeCategoryButton
                  ]}
                  onPress={() => {
                    setCategory(cat.name);
                    setSubcategory('');
                  }}
                >
                  <Text
                    style={[
                      styles.categoryButtonText,
                      category === cat.name && styles.activeCategoryButtonText
                    ]}
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {selectedCategory && selectedCategory.subcategories.length > 0 && (
              <>
                <Text style={styles.label}>Subcategory (Optional)</Text>
                <View style={styles.subcategoryButtons}>
                  {selectedCategory.subcategories.map((sub) => (
                    <TouchableOpacity
                      key={sub}
                      style={[
                        styles.subcategoryChip,
                        subcategory === sub && styles.activeSubcategoryChip
                      ]}
                      onPress={() => setSubcategory(sub)}
                    >
                      <Text
                        style={[
                          styles.subcategoryChipText,
                          subcategory === sub && styles.activeSubcategoryChipText
                        ]}
                      >
                        {sub}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}
          </Card>

          <Card style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Images</Text>
              <TouchableOpacity onPress={handleAddImage} style={styles.addButton}>
                <Plus size={20} color={colors.primary} />
                <Text style={styles.addButtonText}>Add Image</Text>
              </TouchableOpacity>
            </View>

            {images.map((image, index) => (
              <View key={index} style={styles.listItem}>
                <Input
                  placeholder="Image URL"
                  value={image}
                  onChangeText={(value) => handleUpdateImage(index, value)}
                  containerStyle={styles.listInput}
                />
                {images.length > 1 && (
                  <TouchableOpacity
                    onPress={() => handleRemoveImage(index)}
                    style={styles.removeButton}
                  >
                    <Trash2 size={20} color={colors.error} />
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </Card>

          <Card style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Sizes</Text>
              <TouchableOpacity onPress={handleAddSize} style={styles.addButton}>
                <Plus size={20} color={colors.primary} />
                <Text style={styles.addButtonText}>Add Size</Text>
              </TouchableOpacity>
            </View>

            {sizes.map((size, index) => (
              <View key={index} style={styles.listItem}>
                <Input
                  placeholder="Size (e.g., S, M, L, XL)"
                  value={size}
                  onChangeText={(value) => handleUpdateSize(index, value)}
                  containerStyle={styles.listInput}
                />
                {sizes.length > 1 && (
                  <TouchableOpacity
                    onPress={() => handleRemoveSize(index)}
                    style={styles.removeButton}
                  >
                    <Trash2 size={20} color={colors.error} />
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </Card>

          <Card style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Colors</Text>
              <TouchableOpacity onPress={handleAddColor} style={styles.addButton}>
                <Plus size={20} color={colors.primary} />
                <Text style={styles.addButtonText}>Add Color</Text>
              </TouchableOpacity>
            </View>

            {productColors.map((color, index) => (
              <View key={index} style={styles.listItem}>
                <Input
                  placeholder="Color name"
                  value={color}
                  onChangeText={(value) => handleUpdateColor(index, value)}
                  containerStyle={styles.listInput}
                />
                {productColors.length > 1 && (
                  <TouchableOpacity
                    onPress={() => handleRemoveColor(index)}
                    style={styles.removeButton}
                  >
                    <Trash2 size={20} color={colors.error} />
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </Card>

          <Card style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Tags</Text>
              <TouchableOpacity onPress={handleAddTag} style={styles.addButton}>
                <Plus size={20} color={colors.primary} />
                <Text style={styles.addButtonText}>Add Tag</Text>
              </TouchableOpacity>
            </View>

            {tags.map((tag, index) => (
              <View key={index} style={styles.listItem}>
                <Input
                  placeholder="Tag"
                  value={tag}
                  onChangeText={(value) => handleUpdateTag(index, value)}
                  containerStyle={styles.listInput}
                />
                {tags.length > 1 && (
                  <TouchableOpacity
                    onPress={() => handleRemoveTag(index)}
                    style={styles.removeButton}
                  >
                    <Trash2 size={20} color={colors.error} />
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </Card>

          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Options</Text>

            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => setFeatured(!featured)}
            >
              <View style={styles.checkbox}>
                {featured && <View style={styles.checkboxFill} />}
              </View>
              <View style={styles.checkboxContent}>
                <Text style={styles.checkboxLabel}>Featured Product</Text>
                <Text style={styles.checkboxDescription}>
                  Display this product in featured sections
                </Text>
              </View>
            </TouchableOpacity>
          </Card>

          <View style={styles.actions}>
            <Button
              title="Cancel"
              onPress={() => router.back()}
              variant="outline"
              style={styles.actionButton}
            />
            <Button
              title={isSaving ? 'Saving...' : 'Update Product'}
              onPress={handleSave}
              disabled={isSaving}
              style={styles.actionButton}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.textLight,
  },
  section: {
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    flex: 1,
    marginRight: 8,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  categoryButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  categoryButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 8,
    marginBottom: 8,
  },
  activeCategoryButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryButtonText: {
    fontSize: 14,
    color: colors.text,
  },
  activeCategoryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  subcategoryButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  subcategoryChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 8,
    marginBottom: 8,
  },
  activeSubcategoryChip: {
    backgroundColor: colors.primary + '20',
    borderColor: colors.primary,
  },
  subcategoryChipText: {
    fontSize: 14,
    color: colors.text,
  },
  activeSubcategoryChipText: {
    color: colors.primary,
    fontWeight: '500',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 14,
    color: colors.primary,
    marginLeft: 4,
    fontWeight: '500',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  listInput: {
    flex: 1,
    marginBottom: 0,
    marginRight: 8,
  },
  removeButton: {
    padding: 8,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkboxFill: {
    width: 14,
    height: 14,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  checkboxContent: {
    flex: 1,
  },
  checkboxLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 4,
  },
  checkboxDescription: {
    fontSize: 14,
    color: colors.textLight,
  },
  actions: {
    flexDirection: 'row',
    marginTop: 8,
    marginBottom: 32,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
});
