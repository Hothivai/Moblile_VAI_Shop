import { useCallback, useState } from 'react';
import { useCanGoBack, useRouter } from 'expo-router';
import {
  Alert,
  FlatList,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Header from '../components/Header';
import {
  fetchAllOrders,
  initDatabase,
  updateOrderStatus,
  type Order,
} from '../database/database';
import {
  formatCurrency,
  formatDateTime,
  formatOrderStatus,
} from '../utils/displayFormatters';

const managementItems = [
  {
    id: 'user',
    title: 'Quản lý người dùng',
    description: 'Thêm, sửa, xóa và phân quyền tài khoản',
    icon: '👤',
    color: '#E85D75',
    backgroundColor: '#FFF0F2',
    route: '/UserScreen',
  },
  {
    id: 'category',
    title: 'Quản lý danh mục',
    description: 'Tạo và sắp xếp danh mục sản phẩm',
    icon: '📁',
    color: '#4D7CFE',
    backgroundColor: '#EEF3FF',
    route: '/CategoryScreen',
  },
  {
    id: 'product',
    title: 'Quản lý sản phẩm',
    description: 'Cập nhật thông tin và hình ảnh sản phẩm',
    icon: '📦',
    color: '#17A879',
    backgroundColor: '#EAF8F2',
    route: '/ProductSqlite',
  },
  {
    id: 'orders',
    title: 'Quản lý đơn hàng',
    description: 'Xem danh sách và cập nhật tình trạng đơn hàng',
    icon: '📋',
    color: '#F59E0B',
    backgroundColor: '#FEF3C7',
    route: '',
  },
] as const;

const AdminHomeScreen = () => {
  const router = useRouter();
  const canGoBack = useCanGoBack();

  // Quản lý đơn hàng
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderModalVisible, setOrderModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusModalVisible, setStatusModalVisible] = useState(false);

  const loadOrders = useCallback(async () => {
    try {
      await initDatabase();
      const list = await fetchAllOrders();
      setOrders(list);
    } catch (error) {
      console.error('Error fetching all orders:', error);
    }
  }, []);

  const handleCardPress = (item: (typeof managementItems)[number]) => {
    if (item.id === 'orders') {
      void loadOrders();
      setOrderModalVisible(true);
    } else {
      router.push(item.route as any);
    }
  };

  const handleChangeStatus = async (newStatus: string) => {
    if (!selectedOrder) return;
    try {
      await updateOrderStatus(selectedOrder.id, newStatus);
      setStatusModalVisible(false);
      setSelectedOrder(null);
      Alert.alert(
        'Thành công',
        `Đã cập nhật trạng thái đơn hàng thành "${newStatus}".`,
      );
      await loadOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      Alert.alert('Lỗi', 'Không thể cập nhật trạng thái đơn hàng.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header />
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {canGoBack ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Quay lại màn hình trước"
            hitSlop={8}
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.backButton,
              pressed && styles.backButtonPressed,
            ]}
          >
            <Text style={styles.backIcon}>‹</Text>
            <Text style={styles.backText}>Quay lại</Text>
          </Pressable>
        ) : null}

        <View style={styles.hero}>
          <View style={styles.heroBadge}>
            <View style={styles.statusDot} />
            <Text style={styles.heroBadgeText}>HỆ THỐNG QUẢN TRỊ</Text>
          </View>
          <Text style={styles.heroTitle}>Bảng Quản Trị</Text>
          <Text style={styles.heroDescription}>
            Quản lý tài khoản, danh mục, sản phẩm và theo dõi đơn hàng toàn diện.
          </Text>
        </View>

        <View style={styles.sectionHeading}>
          <Text style={styles.sectionTitle}>Danh mục quản lý</Text>
          <Text style={styles.sectionSubtitle}>Nhấp vào từng mục để thao tác</Text>
        </View>

        <View style={styles.cardList}>
          {managementItems.map((item) => (
            <Pressable
              key={item.id}
              accessibilityRole="button"
              onPress={() => handleCardPress(item)}
              style={({ pressed }) => [
                styles.card,
                pressed && styles.cardPressed,
              ]}
            >
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: item.backgroundColor },
                ]}
              >
                <Text style={styles.icon}>{item.icon}</Text>
              </View>
              <View style={styles.cardTextContainer}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardDescription}>{item.description}</Text>
              </View>
              <View
                style={[
                  styles.arrowContainer,
                  { backgroundColor: item.backgroundColor },
                ]}
              >
                <Text style={[styles.arrow, { color: item.color }]}>›</Text>
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      {/* Modal Quản lý Đơn hàng */}
      <Modal visible={orderModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, styles.orderModalContent]}>
            <View style={styles.modalHeaderRow}>
              <View>
                <Text style={styles.modalTitle}>Quản Lý Đơn Hàng</Text>
                <Text style={styles.modalSubtitle}>
                  Tổng cộng: {orders.length} đơn hàng
                </Text>
              </View>
              <TouchableOpacity onPress={() => setOrderModalVisible(false)}>
                <Text style={styles.closeIcon}>✕</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={orders}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={{ paddingVertical: 10 }}
              renderItem={({ item }) => (
                <View style={styles.orderCard}>
                  <View style={styles.orderCardHeader}>
                    <View>
                      <Text style={styles.orderId}>Đơn hàng</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.statusBadgeBtn}
                      onPress={() => {
                        setSelectedOrder(item);
                        setStatusModalVisible(true);
                      }}
                    >
                      <Text style={styles.statusBadgeText}>
                        {formatOrderStatus(item.status)} ▾
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.orderDate}>
                    {formatDateTime(item.createdAt)}
                  </Text>
                  <Text style={styles.orderItems}>📦 {item.items}</Text>
                  {item.recipientName || item.phone || item.address ? (
                    <Text style={styles.orderItems}>
                      👤 {item.recipientName || 'Chưa có tên'}
                      {item.phone ? ` · ${item.phone}` : ''}
                      {item.address ? `\n📍 ${item.address}` : ''}
                      {item.note ? `\n📝 ${item.note}` : ''}
                    </Text>
                  ) : null}
                  <Text style={styles.orderTotal}>
                    Tổng tiền: {formatCurrency(item.total)}
                  </Text>
                </View>
              )}
              ListEmptyComponent={
                <Text style={styles.emptyText}>Chưa có đơn hàng nào.</Text>
              }
            />
          </View>
        </View>
      </Modal>

      {/* Modal Cập nhật Tình trạng Đơn hàng */}
      <Modal visible={statusModalVisible} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Cập nhật Tình trạng</Text>
            <Text style={styles.modalSubtitle}>
              Trạng thái đơn hàng hiện tại:{' '}
              {selectedOrder ? formatOrderStatus(selectedOrder.status) : ''}
            </Text>

            <View style={styles.statusOptions}>
              {['Đang xử lý', 'Đang giao hàng', 'Đã giao thành công', 'Đã hủy'].map(
                (st) => (
                  <TouchableOpacity
                    key={st}
                    style={[
                      styles.statusOptionItem,
                      selectedOrder?.status === st && styles.statusOptionActive,
                    ]}
                    onPress={() => void handleChangeStatus(st)}
                  >
                    <Text
                      style={[
                        styles.statusOptionText,
                        selectedOrder?.status === st && styles.statusOptionTextActive,
                      ]}
                    >
                      {st}
                    </Text>
                  </TouchableOpacity>
                ),
              )}
            </View>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setStatusModalVisible(false);
                setSelectedOrder(null);
              }}
            >
              <Text style={styles.cancelButtonText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default AdminHomeScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4F6FA',
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 28,
  },
  backButton: {
    alignSelf: 'flex-start',
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    marginBottom: 14,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
  },
  backButtonPressed: {
    opacity: 0.7,
  },
  backIcon: {
    color: '#26334A',
    fontSize: 30,
    lineHeight: 32,
    marginRight: 6,
  },
  backText: {
    color: '#26334A',
    fontSize: 14,
    fontWeight: '600',
  },
  hero: {
    overflow: 'hidden',
    minHeight: 200,
    justifyContent: 'center',
    padding: 24,
    marginBottom: 24,
    borderRadius: 24,
    backgroundColor: '#17243B',
  },
  heroBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 14,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  statusDot: {
    width: 7,
    height: 7,
    marginRight: 7,
    borderRadius: 4,
    backgroundColor: '#65D6A4',
  },
  heroBadgeText: {
    color: '#D8E0ED',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  heroDescription: {
    color: '#CBD5E1',
    fontSize: 13,
    lineHeight: 18,
    marginTop: 6,
  },
  sectionHeading: {
    marginBottom: 14,
  },
  sectionTitle: {
    color: '#0F172A',
    fontSize: 18,
    fontWeight: '700',
  },
  sectionSubtitle: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 2,
  },
  cardList: {
    gap: 12,
    paddingBottom: 24,
  },
  card: {
    minHeight: 88,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
  iconContainer: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    borderRadius: 14,
  },
  icon: {
    fontSize: 22,
  },
  cardTextContainer: {
    flex: 1,
  },
  cardTitle: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '700',
  },
  cardDescription: {
    color: '#64748B',
    fontSize: 12,
    lineHeight: 17,
    marginTop: 3,
  },
  arrowContainer: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    borderRadius: 10,
  },
  arrow: {
    fontSize: 24,
    lineHeight: 27,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    elevation: 5,
  },
  orderModalContent: {
    maxHeight: '85%',
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  closeIcon: {
    fontSize: 18,
    color: '#6B7280',
    padding: 4,
  },
  orderCard: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FAFAFA',
    marginBottom: 10,
  },
  orderCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderId: {
    fontWeight: '700',
    fontSize: 14,
    color: '#1F2937',
  },
  statusBadgeBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  statusBadgeText: {
    color: '#B45309',
    fontSize: 11,
    fontWeight: '700',
  },
  orderDate: {
    color: '#9CA3AF',
    fontSize: 11,
    marginTop: 4,
  },
  orderItems: {
    color: '#4B5563',
    fontSize: 13,
    marginTop: 6,
  },
  orderTotal: {
    color: '#147d56',
    fontWeight: '700',
    fontSize: 13,
    marginTop: 4,
  },
  emptyText: {
    textAlign: 'center',
    color: '#9CA3AF',
    marginTop: 20,
    fontSize: 13,
  },
  statusOptions: {
    gap: 8,
    marginVertical: 16,
  },
  statusOptionItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FAFAFA',
    alignItems: 'center',
  },
  statusOptionActive: {
    borderColor: '#1769aa',
    backgroundColor: '#EEF3FF',
  },
  statusOptionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  statusOptionTextActive: {
    color: '#1769aa',
    fontWeight: '700',
  },
  cancelButton: {
    height: 40,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontWeight: '600',
    color: '#4B5563',
  },
});
