import React, { useCallback, useEffect, useState } from 'react';
import { useCanGoBack, useRouter } from 'expo-router';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  addCategory,
  addProduct,
  deleteCategory,
  fetchCategories,
  initDatabase,
  updateCategory,
  type Category,
} from '../database/database';

const CategoryScreen = () => {
  const router = useRouter();
  const canGoBack = useCanGoBack();

  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [catName, setCatName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal edit state
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editCatName, setEditCatName] = useState('');

  // Modal delete confirm state
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  // Modal thêm sản phẩm cho loại tương ứng
  const [addProductModalVisible, setAddProductModalVisible] = useState(false);
  const [targetCategory, setTargetCategory] = useState<Category | null>(null);
  const [newProdName, setNewProdName] = useState('');
  const [newProdPrice, setNewProdPrice] = useState('');

  const loadData = useCallback(async () => {
    try {
      await initDatabase();
      const list = await fetchCategories();
      setCategories(list);
    } catch (error) {
      console.error('Error loading categories:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách loại sản phẩm.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isActive = true;
    const init = async () => {
      try {
        await initDatabase();
        const list = await fetchCategories();
        if (isActive) {
          setCategories(list);
        }
      } catch (error) {
        console.error('Error initializing categories:', error);
        if (isActive) {
          Alert.alert('Lỗi', 'Không thể tải danh sách loại sản phẩm.');
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void init();
    return () => {
      isActive = false;
    };
  }, []);

  const handleAddCategory = async () => {
    const trimmed = catName.trim();
    if (!trimmed) {
      Alert.alert('Thông báo', 'Vui lòng nhập tên loại sản phẩm!');
      return;
    }

    try {
      setIsSubmitting(true);
      await addCategory(trimmed);
      setCatName('');
      Alert.alert('Thành công', `Đã thêm loại sản phẩm "${trimmed}"`);
      await loadData();
    } catch (error) {
      console.error('Error adding category:', error);
      Alert.alert('Lỗi', 'Không thể thêm loại sản phẩm. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEdit = (item: Category) => {
    setEditingCategory(item);
    setEditCatName(item.name);
    setEditModalVisible(true);
  };

  const handleSaveEdit = async () => {
    if (!editingCategory) return;
    const trimmed = editCatName.trim();
    if (!trimmed) {
      Alert.alert('Thông báo', 'Tên loại sản phẩm không được để trống!');
      return;
    }

    try {
      setIsSubmitting(true);
      await updateCategory({ id: editingCategory.id, name: trimmed });
      setEditModalVisible(false);
      setEditingCategory(null);
      Alert.alert('Thành công', 'Đã cập nhật loại sản phẩm!');
      await loadData();
    } catch (error) {
      console.error('Error updating category:', error);
      Alert.alert('Lỗi', 'Không thể cập nhật loại sản phẩm. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenDelete = (item: Category) => {
    setCategoryToDelete(item);
    setDeleteModalVisible(true);
  };

  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;
    try {
      setIsSubmitting(true);
      await deleteCategory(categoryToDelete.id);
      setDeleteModalVisible(false);
      setCategoryToDelete(null);
      Alert.alert('Thành công', 'Đã xóa loại sản phẩm!');
      await loadData();
    } catch (error) {
      console.error('Error deleting category:', error);
      Alert.alert('Lỗi', 'Không thể xóa loại sản phẩm. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenAddProduct = (item: Category) => {
    setTargetCategory(item);
    setNewProdName('');
    setNewProdPrice('');
    setAddProductModalVisible(true);
  };

  const handleSaveProductForCategory = async () => {
    if (!targetCategory) return;
    const name = newProdName.trim();
    const price = parseFloat(newProdPrice.trim());

    if (!name || isNaN(price) || price <= 0) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên và giá sản phẩm hợp lệ!');
      return;
    }

    try {
      setIsSubmitting(true);
      await addProduct({
        name,
        price,
        img: 'hinh1.jpg',
        categoryId: targetCategory.id,
      });
      setAddProductModalVisible(false);
      setTargetCategory(null);
      setNewProdName('');
      setNewProdPrice('');
      Alert.alert(
        'Thành công',
        `Đã thêm sản phẩm "${name}" vào loại "${targetCategory.name}"!`,
      );
    } catch (error) {
      console.error('Error adding product for category:', error);
      Alert.alert('Lỗi', 'Không thể thêm sản phẩm. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
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
        <View>
          <Text style={styles.title}>Quản Lý Loại Sản Phẩm</Text>
          <Text style={styles.subtitle}>Quản lý danh mục sản phẩm</Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{categories.length} loại</Text>
        </View>
      </View>

      <View style={styles.addCard}>
        <TextInput
          style={styles.input}
          placeholder="Nhập tên loại sản phẩm mới..."
          placeholderTextColor="#888"
          value={catName}
          onChangeText={setCatName}
          editable={!isSubmitting}
        />
        <TouchableOpacity
          accessibilityRole="button"
          disabled={isSubmitting}
          style={[styles.button, isSubmitting && styles.buttonDisabled]}
          onPress={handleAddCategory}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.buttonText}>+ Thêm Loại Sản Phẩm</Text>
          )}
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#4D96FF" />
          <Text style={styles.loadingText}>Đang tải danh mục...</Text>
        </View>
      ) : (
        <FlatList
          data={categories}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.catInfo}>
                <Text style={styles.catName}>{item.name}</Text>
              </View>
              <View style={styles.actionRow}>
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel={`Thêm sản phẩm cho loại ${item.name}`}
                  style={styles.addProdButton}
                  onPress={() => handleOpenAddProduct(item)}
                >
                  <Text style={styles.addProdButtonText}>+ Thêm sản phẩm</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel={`Sửa ${item.name}`}
                  style={styles.actionButton}
                  onPress={() => handleOpenEdit(item)}
                >
                  <Text style={styles.actionIcon}>✏️</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel={`Xóa ${item.name}`}
                  style={[styles.actionButton, styles.deleteAction]}
                  onPress={() => handleOpenDelete(item)}
                >
                  <Text style={styles.actionIcon}>🗑️</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Chưa có loại sản phẩm nào.</Text>
          }
        />
      )}

      {/* Modal Sửa Loại Sản Phẩm */}
      <Modal visible={editModalVisible} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Sửa Loại Sản Phẩm</Text>
            <TextInput
              style={styles.input}
              placeholder="Tên loại sản phẩm"
              placeholderTextColor="#888"
              value={editCatName}
              onChangeText={setEditCatName}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                accessibilityRole="button"
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setEditModalVisible(false);
                  setEditingCategory(null);
                }}
              >
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                accessibilityRole="button"
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSaveEdit}
              >
                <Text style={styles.saveButtonText}>Lưu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Xác Nhận Xóa */}
      <Modal visible={deleteModalVisible} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Xác Nhận Xóa</Text>
            <Text style={styles.modalMessage}>
              Bạn có chắc chắn muốn xóa loại sản phẩm{' '}
              <Text style={{ fontWeight: 'bold' }}>
                {`"${categoryToDelete?.name ?? ''}"`}
              </Text>{' '}
              không?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                accessibilityRole="button"
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setDeleteModalVisible(false);
                  setCategoryToDelete(null);
                }}
              >
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                accessibilityRole="button"
                style={[styles.modalButton, styles.deleteButton]}
                onPress={handleConfirmDelete}
              >
                <Text style={styles.deleteButtonText}>Xóa</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Thêm Sản Phẩm cho Loại Tương Ứng */}
      <Modal visible={addProductModalVisible} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Thêm Sản Phẩm</Text>
            <Text style={styles.modalMessage}>
              Thêm sản phẩm mới thuộc loại:{' '}
              <Text style={{ fontWeight: 'bold' }}>
                {`"${targetCategory?.name ?? ''}"`}
              </Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Tên sản phẩm"
              placeholderTextColor="#888"
              value={newProdName}
              onChangeText={setNewProdName}
            />
            <TextInput
              style={styles.input}
              placeholder="Giá sản phẩm (VNĐ)"
              placeholderTextColor="#888"
              keyboardType="numeric"
              value={newProdPrice}
              onChangeText={setNewProdPrice}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                accessibilityRole="button"
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setAddProductModalVisible(false);
                  setTargetCategory(null);
                }}
              >
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                accessibilityRole="button"
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSaveProductForCategory}
              >
                <Text style={styles.saveButtonText}>+ Thêm sản phẩm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default CategoryScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingTop: Platform.OS === 'web' ? 24 : 48,
    backgroundColor: '#F4F6FA',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 12,
    paddingVertical: 4,
  },
  backButtonPressed: { opacity: 0.6 },
  backIcon: { fontSize: 28, lineHeight: 30, color: '#17243B', marginRight: 6 },
  backText: { fontSize: 16, color: '#17243B', fontWeight: '600' },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: { fontSize: 22, fontWeight: '800', color: '#17243B' },
  subtitle: { fontSize: 12, color: '#818A99', marginTop: 2 },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#EEF3FF',
  },
  badgeText: { color: '#4D7CFE', fontSize: 12, fontWeight: '700' },
  addCard: {
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 14,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D0D5DD',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 10,
    color: '#101828',
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#4D7CFE',
    height: 44,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  listContent: { paddingBottom: 24 },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    backgroundColor: '#FFFFFF',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  catInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  catName: { fontWeight: '700', fontSize: 16, color: '#101828', flex: 1 },
  actionRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  addProdButton: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#EAF8F2',
  },
  addProdButtonText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#17A879',
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F0F2F5',
  },
  deleteAction: {
    backgroundColor: '#FFF0F0',
  },
  actionIcon: { fontSize: 16 },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: { marginTop: 8, color: '#667085', fontSize: 13 },
  emptyText: {
    textAlign: 'center',
    color: '#818A99',
    marginTop: 24,
    fontSize: 14,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#101828',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 14,
    color: '#475467',
    textAlign: 'center',
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 6,
  },
  modalButton: {
    flex: 1,
    height: 42,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: { backgroundColor: '#F0F2F5' },
  cancelButtonText: { color: '#344054', fontWeight: '600' },
  saveButton: { backgroundColor: '#4D7CFE' },
  saveButtonText: { color: '#fff', fontWeight: '700' },
  deleteButton: { backgroundColor: '#D92D20' },
  deleteButtonText: { color: '#fff', fontWeight: '700' },
});
