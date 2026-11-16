import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useAuth } from '../auth/AuthContext';
import { fetchOrdersByUserId, type Order } from '../database/database';
import {
  formatCurrency,
  formatDateTime,
  formatOrderStatus,
} from '../utils/displayFormatters';

const orderSteps = ['Đang xử lý', 'Đang giao hàng', 'Đã giao thành công'];

export default function OrderTrackingScreen() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    if (!user) {
      setOrders([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setErrorMessage(null);
    try {
      setOrders(await fetchOrdersByUserId(user.id));
    } catch (error) {
      console.error('Error loading order tracking:', error);
      setErrorMessage('Không thể tải đơn hàng. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      void loadOrders();
    }, [loadOrders]),
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.heading}>
            <Text style={styles.title}>Đơn hàng của tôi</Text>
            <Text style={styles.subtitle}>
              Theo dõi trạng thái và thông tin giao hàng của bạn.
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const cancelled = ['đã hủy', 'cancelled', 'canceled'].includes(
            item.status.trim().toLowerCase(),
          );
          const currentStep = orderSteps.indexOf(item.status);
          const activeStep = currentStep < 0 ? 0 : currentStep;

          return (
            <View style={styles.orderCard}>
              <View style={styles.orderHeader}>
                <View>
                  <Text style={styles.orderId}>Đơn hàng #{item.id}</Text>
                  <Text style={styles.orderDate}>
                    Đặt lúc {formatDateTime(item.createdAt)}
                  </Text>
                </View>
                <View style={[styles.statusBadge, cancelled && styles.cancelledBadge]}>
                  <Text style={[styles.statusText, cancelled && styles.cancelledText]}>
                    {formatOrderStatus(item.status)}
                  </Text>
                </View>
              </View>

              {cancelled ? (
                <View style={styles.cancelledNotice}>
                  <Text style={styles.cancelledNoticeText}>
                    Đơn hàng đã được hủy.
                  </Text>
                </View>
              ) : (
                <View style={styles.timeline}>
                  {orderSteps.map((step, index) => {
                    const complete = index <= activeStep;
                    return (
                      <View key={step} style={styles.timelineStep}>
                        <View style={styles.timelineMarkerColumn}>
                          <View
                            style={[
                              styles.timelineMarker,
                              complete && styles.timelineMarkerActive,
                            ]}
                          >
                            {complete ? (
                              <Text style={styles.timelineCheck}>✓</Text>
                            ) : null}
                          </View>
                          {index < orderSteps.length - 1 ? (
                            <View
                              style={[
                                styles.timelineLine,
                                index < activeStep && styles.timelineLineActive,
                              ]}
                            />
                          ) : null}
                        </View>
                        <Text
                          style={[
                            styles.timelineLabel,
                            complete && styles.timelineLabelActive,
                          ]}
                        >
                          {step}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              )}

              <View style={styles.divider} />
              <Text style={styles.detailLabel}>Sản phẩm</Text>
              <Text style={styles.orderItems}>{item.items}</Text>
              <Text style={styles.detailLabel}>Người nhận</Text>
              <Text style={styles.orderDetail}>
                {item.recipientName || 'Chưa có thông tin'}
                {item.phone ? ` · ${item.phone}` : ''}
              </Text>
              {item.address ? (
                <>
                  <Text style={styles.detailLabel}>Địa chỉ giao hàng</Text>
                  <Text style={styles.orderDetail}>{item.address}</Text>
                </>
              ) : null}
              {item.note ? (
                <Text style={styles.orderNote}>Ghi chú: {item.note}</Text>
              ) : null}
              <View style={styles.totalRow}>
                <Text style={styles.paymentMethod}>
                  {item.paymentMethod || 'Thanh toán khi nhận hàng (COD)'}
                </Text>
                <Text style={styles.orderTotal}>{formatCurrency(item.total)}</Text>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          isLoading ? undefined : errorMessage ? (
            <Text style={styles.messageText}>{errorMessage}</Text>
          ) : (
            <Text style={styles.messageText}>
              Bạn chưa có đơn hàng nào. Đơn đã đặt sẽ hiển thị và cập nhật trạng thái tại đây.
            </Text>
          )
        }
        ListFooterComponent={
          isLoading ? (
            <ActivityIndicator
              style={styles.loading}
              size="large"
              accessibilityLabel="Đang tải đơn hàng"
            />
          ) : undefined
        }
      />
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
    paddingBottom: 28,
  },
  heading: {
    marginBottom: 18,
  },
  title: {
    color: '#1d2939',
    fontSize: 23,
    fontWeight: '800',
  },
  subtitle: {
    marginTop: 4,
    color: '#667085',
    fontSize: 14,
  },
  orderCard: {
    marginBottom: 14,
    padding: 16,
    borderRadius: 14,
    backgroundColor: '#fff',
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  orderId: {
    color: '#1d2939',
    fontSize: 16,
    fontWeight: '800',
  },
  orderDate: {
    marginTop: 4,
    color: '#667085',
    fontSize: 12,
  },
  statusBadge: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: '#FEF3C7',
  },
  statusText: {
    color: '#B45309',
    fontSize: 11,
    fontWeight: '700',
  },
  cancelledBadge: {
    backgroundColor: '#FEE4E2',
  },
  cancelledText: {
    color: '#B42318',
  },
  timeline: {
    marginTop: 18,
    marginBottom: 8,
  },
  timelineStep: {
    minHeight: 34,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  timelineMarkerColumn: {
    width: 22,
    alignItems: 'center',
  },
  timelineMarker: {
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#D0D5DD',
    borderRadius: 10,
    backgroundColor: '#fff',
  },
  timelineMarkerActive: {
    borderColor: '#17A879',
    backgroundColor: '#17A879',
  },
  timelineCheck: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
  },
  timelineLine: {
    width: 2,
    height: 16,
    backgroundColor: '#E4E7EC',
  },
  timelineLineActive: {
    backgroundColor: '#17A879',
  },
  timelineLabel: {
    marginLeft: 10,
    color: '#98A2B3',
    fontSize: 13,
  },
  timelineLabelActive: {
    color: '#344054',
    fontWeight: '700',
  },
  cancelledNotice: {
    marginTop: 14,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#FEF3F2',
  },
  cancelledNoticeText: {
    color: '#B42318',
    fontSize: 13,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    marginVertical: 10,
    backgroundColor: '#EAECF0',
  },
  detailLabel: {
    marginTop: 8,
    color: '#667085',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  orderItems: {
    marginTop: 3,
    color: '#344054',
    fontSize: 13,
    lineHeight: 19,
  },
  orderDetail: {
    marginTop: 3,
    color: '#344054',
    fontSize: 13,
    lineHeight: 18,
  },
  orderNote: {
    marginTop: 7,
    color: '#667085',
    fontSize: 12,
    fontStyle: 'italic',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: 8,
    marginTop: 14,
    paddingTop: 11,
    borderTopWidth: 1,
    borderTopColor: '#EAECF0',
  },
  paymentMethod: {
    flex: 1,
    color: '#667085',
    fontSize: 11,
  },
  orderTotal: {
    color: '#147d56',
    fontSize: 16,
    fontWeight: '800',
  },
  messageText: {
    marginTop: 32,
    color: '#667085',
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
  },
  loading: {
    marginTop: 20,
  },
});
