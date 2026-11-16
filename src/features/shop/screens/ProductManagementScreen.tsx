import { 
  StyleSheet, Text, View, FlatList, Image, TouchableOpacity, 
  ImageSourcePropType,
  TextInput, Button, Modal, ScrollView, Alert, Platform, Pressable
} from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { useCanGoBack, useRouter } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { 
  initDatabase, fetchProducts, fetchCategories, 
  addProduct, updateProduct, deleteProduct, Product, Category 
} from '../database/database';
import type { RootStackParamList } from '../navigation/AppNavigatorProduct';
import { formatCurrency } from '../utils/displayFormatters';

const productImageSources: Record<string, ImageSourcePropType> = {
  'tui xach.jpg': require('../../../../assets/images/products/tui xach.jpg'),
  'mũ lưỡi trai.jpg': require('../../../../assets/images/products/mũ lưỡi trai.jpg'),
  'giay sneaker.jpg': require('../../../../assets/images/products/giay sneaker.jpg'),
  'balo.jpg': require('../../../../assets/images/products/balo.jpg'),
  'Quần jeans ống loe .jpg': require('../../../../assets/images/products/Quần jeans ống loe .jpg'),
  'Túi mây.jpg': require('../../../../assets/images/products/Túi mây.jpg'),
  'Túi xách tay dáng trống .jpg': require('../../../../assets/images/products/Túi xách tay dáng trống .jpg'),
  'images (30).jpg': require('../../../../assets/images/products/images (30).jpg'),
  'images.jpg': require('../../../../assets/images/products/images.jpg'),
};

const legacyProductImageSources: Record<number, ImageSourcePropType> = {
  1: productImageSources['images (30).jpg'],
  2: productImageSources['giay sneaker.jpg'],
  3: productImageSources['balo.jpg'],
  4: productImageSources['mũ lưỡi trai.jpg'],
  5: productImageSources['tui xach.jpg'],
};

const ProductSqlite = () => {
  const router = useRouter();
  const canGoBack = useCanGoBack();
  const navigation = useNavigation<
    NativeStackNavigationProp<RootStackParamList, 'Sanpham3Sqlite'>
  >();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  // State quản lý Modal thêm/sửa
  const [modalVisible, setModalVisible] = useState(false);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [productToDelete, setProductToDelete] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // State lưu thông tin form sản phẩm
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [img, setImg] = useState('hinh1.jpg');
  const [categoryId, setCategoryId] = useState<number>(1);

  const loadData = useCallback(async () => {
    const cats = await fetchCategories();
    const prods = await fetchProducts();
    setCategories(cats);
    setProducts(prods.reverse()); // Đảo ngược mảng để hiển thị sản phẩm mới lên đầu
  }, []);

  useEffect(() => {
    initDatabase(() => {
      void loadData();
    });
  }, [loadData]);

  const getProductImageSource = (imgName: string, productCategoryId: number) => {
    if (imgName.startsWith('file://')) {
      return { uri: imgName };
    }

    const fileName = imgName.split(/[\\/]/).pop() ?? imgName;
    return productImageSources[fileName] ??
      (fileName === 'hinh1.jpg' ? legacyProductImageSources[productCategoryId] : undefined);
  };

  // Mở modal Thêm mới
  const handleOpenAddModal = () => {
    setIsEditing(false);
    setCurrentId(null);
    setName('');
    setPrice('');
    setImg('hinh1.jpg');
    setCategoryId(categories.length > 0 ? categories[0].id : 1);
    setModalVisible(true);
  };

  // Mở modal Sửa sản phẩm
  const handleOpenEditModal = (product: Product) => {
    setIsEditing(true);
    setCurrentId(product.id);
    setName(product.name);
    setPrice(product.price.toString());
    setImg(product.img);
    setCategoryId(product.categoryId);
    setModalVisible(true);
  };

  // Lưu sản phẩm (Thêm hoặc Cập nhật)
  const handleSaveProduct = async () => {
    if (!name.trim() || !price.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ tên và giá sản phẩm!');
      return;
    }

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice)) {
      Alert.alert('Lỗi', 'Giá sản phẩm phải là số hợp lệ!');
      return;
    }

    if (isEditing && currentId !== null) {
      // Cập nhật sản phẩm
      await updateProduct({
        id: currentId,
        name,
        price: parsedPrice,
        img,
        categoryId,
      });
      Alert.alert('Thành công', 'Đã cập nhật sản phẩm!');
    } else {
      // Thêm mới sản phẩm
      await addProduct({
        name,
        price: parsedPrice,
        img,
        categoryId,
      });
      Alert.alert('Thành công', 'Đã thêm sản phẩm mới!');
    }

    setModalVisible(false);
    loadData(); // Tải lại danh sách
  };

  // Xóa sản phẩm
  const handleDeleteProduct = (id: number) => {
    setProductToDelete(id);
    setDeleteError('');
    setDeleteConfirmVisible(true);
  };

  const confirmDeleteProduct = async () => {
    if (productToDelete === null) return;

    try {
      await deleteProduct(productToDelete);
      await loadData();
      setDeleteConfirmVisible(false);
      setProductToDelete(null);
    } catch (error) {
      console.error('Error deleting product:', error);
      setDeleteError('Không thể xóa sản phẩm. Vui lòng thử lại.');
    }
  };

  // Render từng item sản phẩm trong danh sách
  const renderItem = ({ item }: { item: Product }) => {
    const imageSource = getProductImageSource(item.img, item.categoryId);

    return (
      <View style={styles.card}>
        {imageSource ? (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={`Xem chi tiết ${item.name}`}
            onPress={() => navigation.navigate('ProductDetail', { product: item })}
          >
            <Image
              source={imageSource}
              style={styles.image}
              resizeMode="cover"
              accessibilityLabel={`Ảnh sản phẩm ${item.name}`}
            />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={`Xem chi tiết ${item.name}`}
            onPress={() => navigation.navigate('ProductDetail', { product: item })}
          >
            <View style={[styles.image, styles.imagePlaceholder]}>
              <Text style={styles.imageName} numberOfLines={2}>{item.name}</Text>
            </View>
          </TouchableOpacity>
        )}
        <View style={styles.cardInfo}>
          <Text style={styles.productName}>{item.name}</Text>
          <Text style={styles.productPrice}>{formatCurrency(item.price)}</Text>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={`Xem chi tiết ${item.name}`}
            style={styles.detailsButton}
            onPress={() => navigation.navigate('ProductDetail', { product: item })}
          >
            <Text style={styles.detailsButtonText}>Xem chi tiết</Text>
          </TouchableOpacity>
          <View style={styles.iconRow}>
            <TouchableOpacity onPress={() => handleOpenEditModal(item)}>
              <Text style={styles.icon}>✏️</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDeleteProduct(item.id)}>
              <Text style={styles.icon}>❌</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Quay lại màn hình trước"
        hitSlop={8}
        onPress={() => {
          if (canGoBack) {
            router.back();
          } else {
            router.replace('/');
          }
        }}
        style={({ pressed }) => [
          styles.backButton,
          pressed && styles.backButtonPressed,
        ]}
      >
        <Text style={styles.backIcon}>‹</Text>
        <Text style={styles.backText}>Quay lại</Text>
      </Pressable>

      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>Quản lý Sản phẩm</Text>
        <TouchableOpacity
          accessibilityRole="button"
          style={styles.addButton}
          onPress={handleOpenAddModal}
        >
          <Text style={styles.addButtonText}>+ Thêm sản phẩm</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={products}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20 }}>Không có sản phẩm nào</Text>}
      />

      {/* Modal Thêm / Sửa sản phẩm */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {isEditing ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Tên sản phẩm"
              value={name}
              onChangeText={setName}
            />

            <TextInput
              style={styles.input}
              placeholder="Giá sản phẩm (VNĐ)"
              keyboardType="numeric"
              value={price}
              onChangeText={setPrice}
            />

            <Text style={styles.label}>Chọn danh mục:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryChip,
                    categoryId === cat.id && styles.categoryChipSelected,
                  ]}
                  onPress={() => setCategoryId(cat.id)}
                >
                  <Text style={[
                    styles.categoryText,
                    categoryId === cat.id && styles.categoryTextSelected,
                  ]}>
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.modalButtons}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Button title="Hủy" color="#888" onPress={() => setModalVisible(false)} />
              </View>
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Button title={isEditing ? 'Cập nhật' : 'Thêm'} onPress={handleSaveProduct} />
              </View>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={deleteConfirmVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteConfirmVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Xác nhận xóa</Text>
            <Text style={styles.deleteMessage}>
              Bạn có chắc chắn muốn xóa sản phẩm này không?
            </Text>
            {deleteError ? <Text style={styles.deleteError}>{deleteError}</Text> : null}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                accessibilityRole="button"
                style={[styles.confirmButton, styles.cancelButton]}
                onPress={() => setDeleteConfirmVisible(false)}
              >
                <Text style={styles.confirmButtonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                accessibilityRole="button"
                style={[styles.confirmButton, styles.deleteButton]}
                onPress={confirmDeleteProduct}
              >
                <Text style={styles.confirmButtonText}>Xóa</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ProductSqlite;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingTop: Platform.OS === 'web' ? 72 : 16,
    backgroundColor: '#fff',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 10,
    paddingVertical: 4,
  },
  backButtonPressed: { opacity: 0.6 },
  backIcon: { fontSize: 28, lineHeight: 30, color: '#17243B', marginRight: 6 },
  backText: { fontSize: 16, color: '#17243B', fontWeight: '600' },
  headerRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 16 
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', flexShrink: 1 },
  addButton: { 
    backgroundColor: '#007AFF', 
    paddingHorizontal: 12, 
    paddingVertical: 8, 
    borderRadius: 6,
    flexShrink: 0,
  },
  addButtonText: { color: '#fff', fontWeight: 'bold' },
  card: {
    flexDirection: 'row', 
    borderWidth: 1,
    borderColor: '#ccc', 
    borderRadius: 8,
    marginBottom: 12, 
    overflow: 'hidden',
    backgroundColor: '#f9f9f9',
  },
  image: { width: 80, height: 80 },
  imagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
    backgroundColor: '#eaf2ff',
  },
  imageName: { color: '#2456a6', fontSize: 12, fontWeight: '600', textAlign: 'center' },
  cardInfo: { flex: 1, padding: 10, justifyContent: 'center' },
  productName: { fontWeight: 'bold', fontSize: 16 },
  productPrice: { color: '#333', marginVertical: 4 },
  detailsButton: {
    alignSelf: 'flex-start',
    marginTop: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#eaf2ff',
  },
  detailsButtonText: { color: '#0057b8', fontWeight: '600' },
  iconRow: { flexDirection: 'row', marginTop: 4 },
  icon: { fontSize: 18, marginRight: 15 },
  
  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    elevation: 5,
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 12,
  },
  label: { fontWeight: '600', marginBottom: 6 },
  categoryScroll: { marginBottom: 15, maxHeight: 40 },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#eee',
    marginRight: 8,
    justifyContent: 'center',
  },
  categoryChipSelected: {
    backgroundColor: '#007AFF',
  },
  categoryText: { color: '#333' },
  categoryTextSelected: { color: '#fff', fontWeight: 'bold' },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  deleteMessage: { textAlign: 'center', marginBottom: 8 },
  deleteError: { color: '#b00020', textAlign: 'center', marginBottom: 8 },
  confirmButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 6,
  },
  cancelButton: { backgroundColor: '#888', marginRight: 8 },
  deleteButton: { backgroundColor: '#d32f2f', marginLeft: 8 },
  confirmButtonText: { color: '#fff', fontWeight: 'bold' },
});