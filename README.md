# VAI shop TT

Ứng dụng thương mại điện tử thời trang xây dựng bằng Expo, React Native và TypeScript.

## Chạy ứng dụng

```bash
npm install
npx expo start
```

Các lệnh thường dùng:

```bash
npx expo start --android
npx expo start --web
npx expo lint
npx tsc --noEmit
```

## Cấu trúc dự án

- `src/app/`: các điểm vào màn hình do Expo Router quản lý. Giữ các tệp route ở đây.
- `src/features/shop/`: toàn bộ chức năng cửa hàng, gồm màn hình, điều hướng, dữ liệu, xác thực, giỏ hàng và thành phần dùng chung.
- `src/components/`: thành phần giao diện dùng ở cấp ứng dụng.
- `assets/images/products/`: hình ảnh sản phẩm.
- `docs/reports/`: báo cáo và phiếu chấm.
- `docs/reports/assets/buoi14/`: ảnh minh họa đính kèm tài liệu.
- `docs/scripts/`: tập lệnh tạo tài liệu báo cáo.
- `android/`: cấu hình dự án Android.

## Luồng mua hàng

Người dùng chọn thanh toán từ giỏ hàng, nhập tên, số điện thoại và địa chỉ nhận hàng, sau đó xác nhận đơn COD. Đơn hàng và trạng thái giao hàng được theo dõi trong tab **Đơn hàng**; quản trị viên cập nhật trạng thái trong mục **Quản lý đơn hàng**.

## Ghi chú

Thư mục `dist/` là đầu ra web có thể tạo lại bằng lệnh build của Expo; không chỉnh sửa thủ công.
