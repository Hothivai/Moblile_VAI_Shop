export function formatCurrency(amount: number): string {
  return `${amount.toLocaleString('vi-VN')}đ`;
}

export function formatDateTime(value: string): string {
  if (/^\d{1,2}\/\d{1,2}\/\d{4}/.test(value)) {
    return value;
  }

  const date = new Date(value);
  if (!Number.isNaN(date.getTime())) {
    return new Intl.DateTimeFormat('vi-VN', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(date);
  }

  return 'Không rõ thời gian';
}

export function formatOrderStatus(status: string): string {
  const normalizedStatus = status.trim().toLowerCase();
  const translations: Record<string, string> = {
    pending: 'Chờ xử lý',
    processing: 'Đang xử lý',
    shipped: 'Đang giao hàng',
    delivered: 'Đã giao thành công',
    cancelled: 'Đã hủy',
    canceled: 'Đã hủy',
    'đang xử lý': 'Đang xử lý',
    'đang giao hàng': 'Đang giao hàng',
    'đã giao thành công': 'Đã giao thành công',
    'đã hủy': 'Đã hủy',
  };

  return translations[normalizedStatus] ?? 'Chưa xác định';
}

export function formatUserRole(role: string): string {
  if (role === 'admin') return 'Quản trị viên';
  if (role === 'user') return 'Người dùng';
  return 'Chưa xác định';
}
