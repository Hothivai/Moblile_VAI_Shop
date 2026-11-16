import { useCallback, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Alert,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useAuth } from '../auth/AuthContext';
import {
  fetchOrdersByUserId,
  updateUser,
  type Order,
} from '../database/database';
import type { BottomTabParamList } from '../navigation/AppTabs';
import {
  formatCurrency,
  formatDateTime,
  formatOrderStatus,
  formatUserRole,
} from '../utils/displayFormatters';

type ProfileNavigationProp = BottomTabNavigationProp<BottomTabParamList>;

export default function ProfileScreen() {
  const navigation = useNavigation<ProfileNavigationProp>();
  const { user, setUser } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Lịch sử mua hàng
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderModalVisible, setOrderModalVisible] = useState(false);

  // Cập nhật thông tin người dùng
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const loadOrders = useCallback(async () => {
    if (!user) return;
    try {
      const userOrders = await fetchOrdersByUserId(user.id);
      setOrders(userOrders);
    } catch (error) {
      console.error('Error fetching user orders:', error);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      void loadOrders();
    }, [loadOrders]),
  );

  const handleUpdatePassword = async () => {
    if (!user) return;
    const trimmed = newPassword.trim();
    if (!trimmed) {
      Alert.alert('Lỗi', 'Mật khẩu mới không được để trống!');
      return;
    }

    try {
      setIsUpdating(true);
      const updatedUser = { ...user, password: trimmed };
      await updateUser(updatedUser);
      await AsyncStorage.setItem('loggedInUser', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setEditModalVisible(false);
      setNewPassword('');
      Alert.alert('Thành công', 'Đã cập nhật mật khẩu mới thành công!');
    } catch (error) {
      console.error('Error updating password:', error);
      Alert.alert('Lỗi', 'Không thể cập nhật mật khẩu. Vui lòng thử lại.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await AsyncStorage.removeItem('loggedInUser');
      setUser(null);
      navigation.navigate('HomeTab');
    } catch (error) {
      console.error('Error logging out:', error);
      Alert.alert('Lỗi', 'Không thể đăng xuất. Vui lòng thử lại.');
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.username.slice(0, 1).toUpperCase() ?? '?'}
          </Text>
        </View>
        <Text style={styles.title}>Thông tin tài khoản</Text>

        <Text style={styles.label}>Tên đăng nhập</Text>
        <Text style={styles.value}>{user?.username ?? 'Không xác định'}</Text>

        <Text style={styles.label}>Loại tài khoản</Text>
        <Text style={styles.value}>{formatUserRole(user?.role ?? '')}</Text>

        {/* Nút Cập nhật thông tin người dùng */}
        <TouchableOpacity
          accessibilityRole="button"
          style={styles.actionOutlineButton}
          onPress={() => {
            setNewPassword('');
            setEditModalVisible(true);
          }}
        >
          <Text style={styles.actionOutlineText}>✏️ Đổi mật khẩu / Cập nhật</Text>
        </TouchableOpacity>

        {/* Nút Xem lịch sử mua hàng */}
        {user?.role === 'user' ? (
          <TouchableOpacity
            accessibilityRole="button"
            style={styles.actionFillButton}
            onPress={() => {
              void loadOrders();
              setOrderModalVisible(true);
            }}
          >
            <Text style={styles.actionFillText}>
              📦 Lịch sử mua hàng ({orders.length} đơn)
            </Text>
          </TouchableOpacity>
        ) : null}

        <Pressable
          accessibilityRole="button"
          disabled={isLoggingOut}
          onPress={handleLogout}
          style={({ pressed }) => [
            styles.logoutButton,
            (pressed || isLoggingOut) && styles.buttonMuted,
          ]}
        >
          <Text style={styles.logoutLabel}>
            {isLoggingOut ? 'Đang đăng xuất...' : 'Đăng xuất'}
          </Text>
        </Pressable>
      </View>

      {/* Modal Cập nhật mật khẩu */}
      <Modal visible={editModalVisible} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Cập nhật thông tin</Text>
            <Text style={styles.modalDesc}>
              Nhập mật khẩu mới cho tài khoản: {user?.username}
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Mật khẩu mới"
              placeholderTextColor="#888"
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.cancelBtn]}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={styles.cancelBtnText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                disabled={isUpdating}
                style={[styles.modalBtn, styles.saveBtn]}
                onPress={handleUpdatePassword}
              >
                <Text style={styles.saveBtnText}>
                  {isUpdating ? 'Đang lưu...' : 'Lưu mật khẩu'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Lịch sử mua hàng */}
      <Modal visible={orderModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, styles.orderModalContent]}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Lịch sử mua hàng</Text>
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
                  <View style={styles.orderHeader}>
                    <Text style={styles.orderId}>Đơn hàng</Text>
                    <View style={styles.statusBadge}>
                      <Text style={styles.statusText}>
                        {formatOrderStatus(item.status)}
                      </Text>
                    </View>
                  </View>
                    <Text style={styles.orderDate}>
                      {formatDateTime(item.createdAt)}
                    </Text>
                  <Text style={styles.orderItems}>{item.items}</Text>
                  <Text style={styles.orderTotal}>
                    Tổng tiền: {formatCurrency(item.total)}
                  </Text>
                </View>
              )}
              ListEmptyComponent={
                <Text style={styles.emptyOrderText}>
                  Bạn chưa có đơn hàng nào.
                </Text>
              }
            />
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5f6fa',
  },
  card: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 18,
    backgroundColor: '#fff',
    elevation: 3,
  },
  avatar: {
    width: 76,
    height: 76,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderRadius: 38,
    backgroundColor: '#e8f2fb',
  },
  avatarText: {
    color: '#1769aa',
    fontSize: 30,
    fontWeight: '700',
  },
  title: {
    marginBottom: 18,
    color: '#1d2939',
    fontSize: 22,
    fontWeight: '700',
  },
  label: {
    alignSelf: 'stretch',
    marginTop: 12,
    color: '#667085',
    fontSize: 13,
  },
  value: {
    alignSelf: 'stretch',
    marginTop: 4,
    color: '#1d2939',
    fontSize: 16,
    fontWeight: '600',
  },
  actionOutlineButton: {
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1769aa',
    backgroundColor: '#fff',
  },
  actionOutlineText: {
    color: '#1769aa',
    fontSize: 14,
    fontWeight: '700',
  },
  actionFillButton: {
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#EAF8F2',
  },
  actionFillText: {
    color: '#17A879',
    fontSize: 14,
    fontWeight: '700',
  },
  logoutButton: {
    minHeight: 48,
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    borderRadius: 10,
    backgroundColor: '#fff0f0',
  },
  logoutLabel: {
    color: '#b42318',
    fontSize: 15,
    fontWeight: '700',
  },
  buttonMuted: {
    opacity: 0.7,
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
    maxWidth: 380,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    elevation: 5,
  },
  orderModalContent: {
    maxHeight: '80%',
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  closeIcon: {
    fontSize: 18,
    color: '#6B7280',
    padding: 4,
  },
  modalDesc: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 16,
    color: '#111827',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  modalBtn: {
    flex: 1,
    height: 42,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtn: { backgroundColor: '#F3F4F6' },
  cancelBtnText: { color: '#374151', fontWeight: '600' },
  saveBtn: { backgroundColor: '#1769aa' },
  saveBtnText: { color: '#fff', fontWeight: '700' },

  // Order Card
  orderCard: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FAFAFA',
    marginBottom: 10,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderId: {
    fontWeight: '700',
    fontSize: 14,
    color: '#1F2937',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: '#FEF3C7',
  },
  statusText: {
    color: '#B45309',
    fontSize: 11,
    fontWeight: '700',
  },
  orderDate: {
    color: '#9CA3AF',
    fontSize: 11,
    marginTop: 2,
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
  emptyOrderText: {
    textAlign: 'center',
    color: '#9CA3AF',
    marginTop: 20,
    fontSize: 13,
  },
});
