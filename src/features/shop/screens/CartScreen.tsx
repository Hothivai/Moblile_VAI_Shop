import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../auth/AuthContext';
import { createOrder } from '../database/database';
import { getProductImageSource } from '../productImages';
import {
  clearCart,
  getCartItems,
  removeCartItem,
  updateCartItemQuantity,
  type CartItem,
} from '../cart/cartStorage';
import { formatCurrency } from '../utils/displayFormatters';

export default function CartScreen() {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutVisible, setCheckoutVisible] = useState(false);
  const [recipientName, setRecipientName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [note, setNote] = useState('');
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const shippingFee = 30000;

  const loadCart = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      if (!user || user.role !== 'user') {
        setItems([]);
        return;
      }
      const cartItems = await getCartItems(user.id);
      setItems(cartItems);
    } catch (error) {
      console.error('Error loading cart:', error);
      setErrorMessage('Không thể tải giỏ hàng. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      void loadCart();
    }, [loadCart]),
  );

  const handleUpdateQuantity = async (productId: number, currentQuantity: number, change: number) => {
    if (!user) return;
    const newQty = currentQuantity + change;
    try {
      await updateCartItemQuantity(user.id, productId, newQty);
      if (newQty <= 0) {
        setItems((currentItems) =>
          currentItems.filter((item) => item.product.id !== productId),
        );
      } else {
        setItems((currentItems) =>
          currentItems.map((item) =>
            item.product.id === productId ? { ...item, quantity: newQty } : item,
          ),
        );
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      Alert.alert('Lỗi', 'Không thể cập nhật số lượng.');
    }
  };

  const handleRemove = async (productId: number) => {
    if (!user) return;
    try {
      await removeCartItem(user.id, productId);
      setItems((currentItems) =>
        currentItems.filter((item) => item.product.id !== productId),
      );
    } catch (error) {
      console.error('Error removing cart item:', error);
      setErrorMessage('Không thể xóa sản phẩm khỏi giỏ hàng. Vui lòng thử lại.');
    }
  };

  const executeCheckout = async () => {
    if (!user || items.length === 0) return;
    const trimmedName = recipientName.trim();
    const trimmedPhone = phone.trim();
    const trimmedAddress = address.trim();
    const phoneDigits = trimmedPhone.replace(/\D/g, '');

    if (trimmedName.length < 2) {
      setCheckoutError('Vui lòng nhập họ tên người nhận (ít nhất 2 ký tự).');
      return;
    }
    if (
      !/^\+?[0-9\s().-]+$/.test(trimmedPhone) ||
      phoneDigits.length < 9 ||
      phoneDigits.length > 12
    ) {
      setCheckoutError('Vui lòng nhập số điện thoại hợp lệ.');
      return;
    }
    if (trimmedAddress.length < 8) {
      setCheckoutError('Vui lòng nhập địa chỉ giao hàng đầy đủ.');
      return;
    }

    let orderId: number | null = null;
    try {
      setIsCheckingOut(true);
      setCheckoutError(null);
      const itemsSummary = items
        .map((i) => `${i.product.name} (x${i.quantity})`)
        .join(', ');
      orderId = await createOrder(user.id, itemsSummary, orderTotal, {
        recipientName: trimmedName,
        phone: trimmedPhone,
        address: trimmedAddress,
        note: note.trim(),
        paymentMethod: 'Thanh toán khi nhận hàng (COD)',
        shippingFee,
      });
      await clearCart(user.id);
      setItems([]);
      setCheckoutVisible(false);
      if (Platform.OS === 'web') {
        window.alert(
          `Đặt hàng thành công! Mã đơn #${orderId}. Bạn có thể theo dõi trong tab Đơn hàng.`,
        );
      } else {
        Alert.alert(
          'Thành công',
          `Đặt hàng thành công! Mã đơn #${orderId}. Bạn có thể theo dõi trong tab Đơn hàng.`,
        );
      }
    } catch (error) {
      if (orderId !== null) {
        console.error('Order created but cart could not be cleared:', error);
        setItems([]);
        setCheckoutVisible(false);
        const message = `Đơn hàng #${orderId} đã được tạo, nhưng không thể làm trống giỏ hàng. Bạn có thể theo dõi đơn trong tab Đơn hàng.`;
        if (Platform.OS === 'web') {
          window.alert(message);
        } else {
          Alert.alert('Đã tạo đơn hàng', message);
        }
        return;
      }
      console.error('Error checkout:', error);
      if (Platform.OS === 'web') {
        window.alert('Không thể đặt hàng. Vui lòng thử lại.');
      } else {
        Alert.alert('Lỗi', 'Không thể đặt hàng. Vui lòng thử lại.');
      }
    } finally {
      setIsCheckingOut(false);
    }
  };

  const handleCheckout = () => {
    if (!user || items.length === 0) return;
    setCheckoutError(null);
    setCheckoutVisible(true);
  };

  const total = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );
  const orderTotal = total + shippingFee;

  return (
    <View style={styles.container}>
      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" accessibilityLabel="Đang tải giỏ hàng" />
        </View>
      ) : errorMessage ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.product.id.toString()}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const imageSource = getProductImageSource(
              item.product.img,
              item.product.categoryId,
            );
            return (
              <View style={styles.itemCard}>
                {imageSource ? (
                  <Image
                    source={imageSource}
                    style={styles.productImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={[styles.productImage, styles.imagePlaceholder]}>
                    <Text style={styles.placeholderText}>Không có ảnh</Text>
                  </View>
                )}
                <View style={styles.itemInfo}>
                  <Text style={styles.productName}>{item.product.name}</Text>
                  <Text style={styles.productPrice}>
                    {formatCurrency(item.product.price)}
                  </Text>
                  <View style={styles.qtyRow}>
                    <TouchableOpacity
                      style={styles.qtyButton}
                      onPress={() =>
                        void handleUpdateQuantity(item.product.id, item.quantity, -1)
                      }
                    >
                      <Text style={styles.qtyButtonText}>−</Text>
                    </TouchableOpacity>
                    <Text style={styles.qtyText}>{item.quantity}</Text>
                    <TouchableOpacity
                      style={styles.qtyButton}
                      onPress={() =>
                        void handleUpdateQuantity(item.product.id, item.quantity, 1)
                      }
                    >
                      <Text style={styles.qtyButtonText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Xóa ${item.product.name} khỏi giỏ hàng`}
                  onPress={() => void handleRemove(item.product.id)}
                  style={styles.removeButton}
                >
                  <Text style={styles.removeLabel}>✕</Text>
                </Pressable>
              </View>
            );
          }}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Giỏ hàng của bạn đang trống.</Text>
          }
          ListFooterComponent={
            items.length ? (
              <View style={styles.footerContainer}>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Tổng cộng</Text>
                  <Text style={styles.totalValue}>
                    {formatCurrency(total)}
                  </Text>
                </View>
                <Text style={styles.shippingHint}>
                  Phí giao hàng {formatCurrency(shippingFee)} sẽ được tính tại bước xác nhận.
                </Text>
                <TouchableOpacity
                  accessibilityRole="button"
                  disabled={isCheckingOut}
                  style={[
                    styles.checkoutButton,
                    isCheckingOut && styles.buttonDisabled,
                  ]}
                  onPress={handleCheckout}
                >
                  {isCheckingOut ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.checkoutText}>
                      🛍️ Thanh toán &amp; Đặt hàng
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            ) : undefined
          }
        />
      )}
      <Modal
      visible={checkoutVisible}
      animationType="slide"
      onRequestClose={() => setCheckoutVisible(false)}
      >
      <KeyboardAvoidingView
        style={styles.checkoutScreen}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.checkoutContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.checkoutHeader}>
            <Pressable
              accessibilityRole="button"
              onPress={() => setCheckoutVisible(false)}
              style={styles.backButton}
            >
              <Text style={styles.backButtonText}>‹  Giỏ hàng</Text>
            </Pressable>
            <Text style={styles.checkoutTitle}>Xác nhận đơn hàng</Text>
            <Text style={styles.checkoutSubtitle}>
              Điền thông tin nhận hàng để hoàn tất đơn.
            </Text>
          </View>

          <View style={styles.checkoutCard}>
            <Text style={styles.sectionTitle}>Thông tin người nhận</Text>
            <Text style={styles.fieldLabel}>Họ và tên *</Text>
            <TextInput
              accessibilityLabel="Họ và tên người nhận"
              style={styles.textInput}
              placeholder="Tên người nhận hàng"
              value={recipientName}
              onChangeText={setRecipientName}
              autoCapitalize="words"
              maxLength={80}
            />
            <Text style={styles.fieldLabel}>Số điện thoại *</Text>
            <TextInput
              accessibilityLabel="Số điện thoại người nhận"
              style={styles.textInput}
              placeholder="Số điện thoại liên hệ"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              maxLength={16}
            />
            <Text style={styles.fieldLabel}>Địa chỉ giao hàng *</Text>
            <TextInput
              accessibilityLabel="Địa chỉ giao hàng"
              style={[styles.textInput, styles.multilineInput]}
              placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành"
              value={address}
              onChangeText={setAddress}
              multiline
              textAlignVertical="top"
              maxLength={300}
            />
            <Text style={styles.fieldLabel}>Ghi chú cho người giao hàng</Text>
            <TextInput
              accessibilityLabel="Ghi chú giao hàng"
              style={[styles.textInput, styles.multilineInput, styles.noteInput]}
              placeholder="Ví dụ: gọi trước khi giao"
              value={note}
              onChangeText={setNote}
              multiline
              textAlignVertical="top"
              maxLength={300}
            />
          </View>

          <View style={styles.checkoutCard}>
            <Text style={styles.sectionTitle}>Sản phẩm</Text>
            {items.map((item) => (
              <View key={item.product.id} style={styles.summaryItem}>
                <Text style={styles.summaryItemName}>
                  {item.product.name} × {item.quantity}
                </Text>
                <Text style={styles.summaryItemPrice}>
                  {formatCurrency(item.product.price * item.quantity)}
                </Text>
              </View>
            ))}
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Tiền hàng</Text>
              <Text style={styles.summaryValue}>{formatCurrency(total)}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Phí giao hàng</Text>
              <Text style={styles.summaryValue}>{formatCurrency(shippingFee)}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.grandTotalLabel}>Tổng thanh toán</Text>
              <Text style={styles.grandTotalValue}>
                {formatCurrency(orderTotal)}
              </Text>
            </View>
            <View style={styles.paymentMethod}>
              <Text style={styles.paymentIcon}>💵</Text>
              <View>
                <Text style={styles.paymentTitle}>Thanh toán khi nhận hàng</Text>
                <Text style={styles.paymentSubtitle}>COD · Trả tiền mặt cho shipper</Text>
              </View>
            </View>
          </View>

          {checkoutError ? (
            <Text accessibilityRole="alert" style={styles.checkoutError}>
              {checkoutError}
            </Text>
          ) : null}
          <TouchableOpacity
            accessibilityRole="button"
            disabled={isCheckingOut}
            style={[
              styles.confirmButton,
              isCheckingOut && styles.buttonDisabled,
            ]}
            onPress={() => void executeCheckout()}
          >
            {isCheckingOut ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.confirmButtonText}>
                Đặt hàng · {formatCurrency(orderTotal)}
              </Text>
            )}
          </TouchableOpacity>
          <Text style={styles.checkoutDisclaimer}>
            Bằng cách đặt hàng, bạn xác nhận thông tin giao hàng là chính xác.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
  },
  listContent: {
    flexGrow: 1,
    padding: 16,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#fff',
    elevation: 2,
  },
  productImage: {
    width: 72,
    height: 72,
    borderRadius: 8,
  },
  imagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
    backgroundColor: '#e8ecf4',
  },
  placeholderText: {
    color: '#596579',
    fontSize: 11,
    textAlign: 'center',
  },
  itemInfo: {
    flex: 1,
    paddingHorizontal: 12,
  },
  productName: {
    color: '#1d2939',
    fontSize: 15,
    fontWeight: '600',
  },
  productPrice: {
    marginTop: 4,
    color: '#147d56',
    fontSize: 14,
    fontWeight: '700',
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  qtyButton: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  qtyButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
  },
  qtyText: {
    fontSize: 14,
    fontWeight: '700',
    minWidth: 20,
    textAlign: 'center',
    color: '#111827',
  },
  removeButton: {
    padding: 8,
  },
  removeLabel: {
    color: '#b42318',
    fontWeight: '700',
    fontSize: 16,
  },
  footerContainer: {
    marginTop: 8,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  totalLabel: {
    color: '#1d2939',
    fontSize: 16,
    fontWeight: '600',
  },
  totalValue: {
    color: '#147d56',
    fontSize: 16,
    fontWeight: '700',
  },
  shippingHint: {
    marginTop: 7,
    color: '#667085',
    fontSize: 12,
    textAlign: 'right',
  },
  checkoutButton: {
    marginTop: 12,
    backgroundColor: '#1769aa',
    height: 48,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  checkoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  emptyText: {
    marginTop: 36,
    color: '#667085',
    textAlign: 'center',
  },
  errorText: {
    color: '#b42318',
    textAlign: 'center',
  },
  checkoutScreen: {
    flex: 1,
    backgroundColor: '#f5f6fa',
  },
  checkoutContent: {
    padding: 18,
    paddingBottom: 36,
  },
  checkoutHeader: {
    marginBottom: 16,
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingRight: 12,
  },
  backButtonText: {
    color: '#1769aa',
    fontSize: 15,
    fontWeight: '700',
  },
  checkoutTitle: {
    marginTop: 6,
    color: '#1d2939',
    fontSize: 24,
    fontWeight: '800',
  },
  checkoutSubtitle: {
    marginTop: 4,
    color: '#667085',
    fontSize: 14,
  },
  checkoutCard: {
    marginBottom: 14,
    padding: 16,
    borderRadius: 14,
    backgroundColor: '#fff',
    elevation: 2,
  },
  sectionTitle: {
    marginBottom: 12,
    color: '#1d2939',
    fontSize: 17,
    fontWeight: '700',
  },
  fieldLabel: {
    marginBottom: 6,
    color: '#344054',
    fontSize: 13,
    fontWeight: '600',
  },
  textInput: {
    minHeight: 46,
    marginBottom: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#D0D5DD',
    borderRadius: 9,
    backgroundColor: '#fff',
    color: '#1d2939',
    fontSize: 15,
  },
  multilineInput: {
    minHeight: 74,
    paddingTop: 12,
  },
  noteInput: {
    minHeight: 64,
    marginBottom: 0,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 7,
  },
  summaryItemName: {
    flex: 1,
    color: '#475467',
    fontSize: 13,
  },
  summaryItemPrice: {
    color: '#344054',
    fontSize: 13,
    fontWeight: '600',
  },
  summaryDivider: {
    height: 1,
    marginVertical: 8,
    backgroundColor: '#EAECF0',
  },
  summaryLabel: {
    color: '#667085',
    fontSize: 14,
  },
  summaryValue: {
    color: '#344054',
    fontSize: 14,
    fontWeight: '600',
  },
  grandTotalLabel: {
    color: '#1d2939',
    fontSize: 15,
    fontWeight: '700',
  },
  grandTotalValue: {
    color: '#147d56',
    fontSize: 16,
    fontWeight: '800',
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#B7E4D2',
    borderRadius: 10,
    backgroundColor: '#F0FAF5',
  },
  paymentIcon: {
    marginRight: 10,
    fontSize: 22,
  },
  paymentTitle: {
    color: '#175C43',
    fontSize: 14,
    fontWeight: '700',
  },
  paymentSubtitle: {
    marginTop: 2,
    color: '#667085',
    fontSize: 12,
  },
  checkoutError: {
    marginBottom: 10,
    color: '#b42318',
    fontSize: 13,
  },
  confirmButton: {
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 11,
    backgroundColor: '#1769aa',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  checkoutDisclaimer: {
    marginTop: 10,
    color: '#667085',
    fontSize: 12,
    textAlign: 'center',
  },
});
