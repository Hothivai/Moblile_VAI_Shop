# PHIẾU CHẤM ĐIỂM MÔN LẬP TRÌNH DI ĐỘNG 2 (90T)

- **Họ tên sinh viên**: Hồ Thị Vãi
- **Lớp**: PNV27A
- **Link git**: *(Dán đường dẫn Git repository của bạn tại đây)*
- **Môi trường phát triển**: Windows 11, Node.js LTS, Visual Studio Code, Expo Go / Web Browser
- **React Native phiên bản**: `0.88.1` (React `19.3.0`)
- **Các thư viện sử dụng và phiên bản**:
  - `expo`: `~58.0.22`
  - `expo-sqlite`: `~58.0.15` (Cơ sở dữ liệu SQLite cục bộ)
  - `@react-native-async-storage/async-storage`: `2.2.0` (Lưu phiên đăng nhập `loggedInUser` & Giỏ hàng)
  - `expo-router`: `~58.0.29` (File-based navigation)
  - `@react-navigation/bottom-tabs`: `^7.21.0` (Bottom Tab Navigator)
  - `@react-navigation/native`: `^7.5.1` & `@react-navigation/native-stack`: `^7.21.0` (Stack Navigator)
  - `expo-image`: `~58.0.18`, `react-native-screens`: `~4.30.1`, `react-native-safe-area-context`: `~5.10.1`

---

## BẢNG ĐÁNH GIÁ CHI TIẾT & HÌNH ẢNH MINH CHỨNG

> **Hướng dẫn dành cho sinh viên**: Cột **"Ảnh chụp màn hình minh chứng"** đã được tạo sẵn khung. Khi chụp ảnh màn hình chạy trên điện thoại hoặc máy tính, bạn chỉ cần dán ảnh hoặc chèn cú pháp `![mô tả](đường_dẫn_ảnh.png)` vào đúng ô tương ứng.

| STT | Chức năng | Điểm thành phần | Trạng thái thực hiện | Tệp tin mã nguồn (Code Location) | Ảnh chụp màn hình minh chứng (Dán ảnh vào ô này) |
|:---:|:---|:---:|:---:|:---|:---:|
| **A** | **CHỨC NĂNG CỦA NGƯỜI DÙNG** | **4.0đ** | **100% Hoàn thành** | | |
| A.1 | **Trang chủ người dùng**<br>*(Gồm các sản phẩm có sẵn khi khởi tạo database)* | 0.25đ | **Đã hoàn thành** | `src/screens/HomeScreen.tsx`<br>`src/database/database.ts` | *(Chụp ảnh màn hình danh sách sản phẩm hiển thị trên trang chủ)*<br><br>![Trang chủ](assets/images/products/hinh1.jpg) |
| A.2 | **Banner và Menu điều hướng**<br>*(Gồm: Home, Danh mục sản phẩm)* | 0.25đ | **Đã hoàn thành** | `src/screens/HomeScreen.tsx` | *(Chụp ảnh phần Banner khuyến mại và 2 nút Menu điều hướng: Home, Danh mục SP)* |
| A.3 | **Xem sản phẩm theo từng danh mục**<br>*(CategorySelector.tsx)* | 0.5đ | **Đã hoàn thành** | `src/components/CategorySelector.tsx`<br>`src/screens/ProductsByCategoryScreen.tsx` | *(Chụp ảnh khi bấm chọn 1 danh mục như Áo, Giày... và danh sách sản phẩm lọc theo loại đó)* |
| A.4 | **Trang chi tiết sản phẩm**<br>*(Khi click vào sản phẩm ở trang chủ)* | 0.25đ | **Đã hoàn thành** | `src/screens/ProductDetailScreen1.tsx` | *(Chụp ảnh giao diện xem chi tiết 1 sản phẩm: Tên, ảnh lớn, giá, danh mục, nút Thêm vào giỏ hàng)* |
| A.5 | **Bottom Tab ở trang chủ gồm 3 nút**<br>*(Home, Sign up, Login)* | 0.25đ | **Đã hoàn thành** | `src/navigation/AppTabs.tsx` | *(Chụp ảnh thanh Bottom Tab phía dưới khi chưa đăng nhập gồm 3 tab: Trang chủ, Đăng ký, Đăng nhập)* |
| A.6 | **Đăng ký thành công** | 0.5đ | **Đã hoàn thành** | `src/screens/SignupSqlite.tsx` | *(Chụp ảnh form đăng ký tài khoản và thông báo popup "Thành công / Tạo tài khoản thành công")* |
| A.7 | **Đăng nhập ở Bottom Tab**<br>*(Đăng nhập thành công điều hướng đến trang chủ người dùng)* | 0.5đ | **Đã hoàn thành** | `src/screens/LoginSqlite.tsx` | *(Chụp ảnh màn hình Đăng nhập bằng tài khoản user và chuyển thẳng về Trang chủ)* |
| A.8 | **Hiển thị thông tin người dùng đã đăng nhập và đăng xuất**<br>*(Header.tsx)* | 0.5đ | **Đã hoàn thành** | `src/components/Header.tsx` | *(Chụp ảnh Header hiển thị: "Xin chào, {username} ({role})" và nút "Đăng Xuất")* |
| A.9 | **Tìm kiếm theo tên/danh mục** | 0.5đ | **Đã hoàn thành** | `src/screens/HomeScreen.tsx` | *(Chụp ảnh nhập từ khóa tìm kiếm vào ô Search và kết quả lọc trực tiếp bên dưới)* |
| A.10 | **Lọc sản phẩm theo khoảng giá** | 0.5đ | **Đã hoàn thành** | `src/screens/HomeScreen.tsx` | *(Chụp ảnh bấm chọn chip lọc giá: < 300k, 300k - 800k, > 800k và sản phẩm tương ứng)* |
| **B** | **CHỨC NĂNG CỦA ADMIN** | **4.0đ** | **100% Hoàn thành** | | |
| B.1 | **Khởi tạo database với 1 tài khoản admin có sẵn** | 0.25đ | **Đã hoàn thành** | `src/database/database.ts`<br>`src/database/database.web.ts` | *(Chụp ảnh mã nguồn SQLite `INSERT OR IGNORE` tài khoản `admin` / `123456`)* |
| B.2 | **Đăng nhập Admin**<br>*(Hiển thị thông tin đăng nhập trên Header.tsx, Đăng xuất, đăng nhập thành công điều hướng đến trang chủ quản trị)* | 0.5đ | **Đã hoàn thành** | `src/screens/LoginSqlite.tsx`<br>`src/components/Header.tsx` | *(Chụp ảnh đăng nhập tài khoản admin/123456 -> điều hướng sang trang chủ Admin kèm Header "Xin chào, admin (admin)")* |
| B.3 | **Trang chủ quản trị (Admin Home)**<br>*(Gồm các nút: Quản lý user, Quản lý loại sản phẩm, Quản lý sản phẩm, Quản lý đơn hàng)* | 0.25đ | **Đã hoàn thành** | `src/app/AdminHomeScreen.tsx` | *(Chụp ảnh giao diện Admin Dashboard với đầy đủ các thẻ chức năng: Quản lý người dùng, Loại sản phẩm, Quản lý sản phẩm, Quản lý đơn hàng)* |
| B.4 | **Admin Bottom Tab gồm 4 nút**<br>*(Home của user, Home của admin, Signup, Login)* | 0.5đ | **Đã hoàn thành** | `src/navigation/AppTabs.tsx` | *(Chụp ảnh thanh Bottom Tab của Admin hiển thị đủ 4 tab: Home User, Home Admin, Signup, Login)* |
| B.5 | **Quản trị user**<br>*(Xem danh sách, thêm, cập nhật vai trò/mật khẩu, xóa user an toàn)* | 0.5đ | **Đã hoàn thành** | `src/app/UserScreen.tsx` | *(Chụp ảnh màn hình Quản lý người dùng: Danh sách user, Modal sửa vai trò admin/user, Modal xác nhận xóa)* |
| B.6 | **Quản trị loại sản phẩm**<br>*(+ Xem, thêm, sửa, xóa: 0.5đ)<br>(+ Thêm sản phẩm cho loại tương ứng: 0.5đ)* | 1.0đ | **Đã hoàn thành** | `src/app/CategoryScreen.tsx` | *(Chụp ảnh Quản lý loại sản phẩm: Thêm loại mới, sửa/xóa, và nút "+ Thêm SP" để thêm sản phẩm trực tiếp cho loại đó)* |
| B.7 | **Quản trị sản phẩm**<br>*(Xem danh sách, thêm, sửa, xóa sản phẩm kèm chọn danh mục, xem chi tiết)* | 1.0đ | **Đã hoàn thành** | `src/screens/ProductManagementScreen.tsx`<br>`src/app/ProductSqlite.tsx` | *(Chụp ảnh danh sách sản phẩm, Modal thêm/sửa sản phẩm và nút "‹ Quay lại" về trang chủ quản trị)* |
| **C** | **CHỨC NĂNG KHÁC** | **2.0đ** | **100% Hoàn thành** | | |
| C.1 | **Chức năng khác của người dùng**<br>*(Tổng: 1.5đ)*<br>+ Xem và cập nhật giỏ hàng (0.5đ)<br>+ Checkout đơn hàng và Đặt hàng (0.5đ)<br>+ Xem lịch sử mua hàng (0.25đ)<br>+ Cập nhật thông tin người dùng (0.25đ) | 1.5đ | **Đã hoàn thành** | `src/screens/CartScreen.tsx`<br>`src/cart/cartStorage.ts`<br>`src/screens/ProfileScreen.tsx` | *(Chụp ảnh màn hình giỏ hàng có nút tăng/giảm số lượng + Nút đặt hàng; Modal lịch sử đơn hàng; Modal đổi mật khẩu trong Profile)* |
| C.2 | **Chức năng khác của admin**<br>*(Quản trị đơn hàng: xem danh sách, cập nhật tình trạng đơn hàng: 0.5đ)* | 0.5đ | **Đã hoàn thành** | `src/app/AdminHomeScreen.tsx`<br>`src/database/database.ts` | *(Chụp ảnh Modal "Quản Lý Đơn Hàng" trong Admin Dashboard và Modal cập nhật tình trạng đơn: Đang xử lý, Đang giao, Đã giao, Đã hủy)* |
| | **TỔNG ĐIỂM DỰ KIẾN ĐẠT ĐƯỢC** | **10 / 10đ** | **HOÀN THÀNH TOÀN BỘ 100%** | | |

---

## CHI TIẾT TỪNG BƯỚC TEST ĐỂ CHỤP ẢNH MINH CHỨNG

### 1. Phần Người dùng (A)
1. **Trang chủ & Banner & Menu (A.1, A.2)**:
   - Mở app -> Quan sát Banner "Bộ Sưu Tập Xu Hướng 2026", 2 nút menu Home & Danh mục, danh sách sản phẩm mẫu. Chụp ảnh màn hình.
2. **Tìm kiếm & Lọc giá (A.9, A.10)**:
   - Gõ "Áo" hoặc "Giày" vào thanh tìm kiếm -> Sản phẩm lọc ngay lập tức.
   - Bấm chọn chip giá `< 300.000 đ` hoặc `300k - 800k` -> Sản phẩm hiển thị theo khoảng giá. Chụp ảnh màn hình.
3. **Danh mục & Chi tiết sản phẩm (A.3, A.4)**:
   - Bấm vào danh mục "Áo" trên thanh tròn ngang -> Chuyển sang trang sản phẩm theo danh mục.
   - Bấm vào một sản phẩm bất kỳ -> Chuyển sang trang Chi tiết sản phẩm. Chụp ảnh màn hình.
4. **Đăng ký & Đăng nhập (A.5, A.6, A.7, A.8)**:
   - Chụp thanh Bottom Tab lúc chưa đăng nhập gồm: `Trang chủ`, `Đăng ký`, `Đăng nhập`.
   - Vào tab Đăng ký -> Nhập tài khoản mới (ví dụ `user1` / `123456`) -> Bấm Đăng ký -> Chụp thông báo thành công.
   - Vào tab Đăng nhập -> Nhập `user1` / `123456` -> Bấm Đăng nhập -> Chụp ảnh điều hướng về Trang chủ và Header hiển thị `"Xin chào, user1 (user)"` cùng nút Đăng xuất.

### 2. Phần Admin (B)
1. **Đăng nhập Admin & Header & Bottom Tab (B.1, B.2, B.4)**:
   - Vào tab Đăng nhập -> Nhập `admin` / `123456`.
   - Bấm Đăng nhập -> Chuyển ngay đến tab `Home Admin` (`AdminHomeScreen`).
   - Header hiển thị: `"Xin chào, admin (admin)"` và nút Đăng xuất.
   - Thanh Bottom Tab bên dưới chuyển sang 4 tab: `Home User`, `Home Admin`, `Signup`, `Login`. Chụp ảnh màn hình.
2. **Trang chủ quản trị (B.3)**:
   - Chụp ảnh `AdminHomeScreen` với 4 thẻ chức năng: `Quản lý người dùng`, `Loại sản phẩm`, `Quản lý sản phẩm`, `Quản lý đơn hàng`.
3. **Quản trị User (B.5)**:
   - Bấm thẻ "Quản lý người dùng" -> Xem danh sách user từ SQLite.
   - Thêm user mới với vai trò Admin hoặc User -> Bấm sửa vai trò -> Thử bấm xóa. Chụp ảnh màn hình.
4. **Quản trị Loại sản phẩm (B.6)**:
   - Bấm thẻ "Loại sản phẩm" -> Xem danh mục, thêm danh mục mới, sửa, xóa.
   - Bấm nút `+ Thêm SP` trên 1 danh mục -> Nhập tên và giá -> Thêm sản phẩm trực tiếp cho loại đó. Chụp ảnh màn hình.
5. **Quản trị Sản phẩm (B.7)**:
   - Bấm thẻ "Quản lý sản phẩm" -> Xem danh sách sản phẩm, bấm "+ Thêm sản phẩm", sửa/xóa sản phẩm, bấm nút `‹ Quay lại`. Chụp ảnh màn hình.

### 3. Phần Chức năng khác (C)
1. **Giỏ hàng, Checkout & Lịch sử mua hàng (C.1)**:
   - Đăng nhập tài khoản User -> Chọn sản phẩm -> Bấm "Thêm vào giỏ hàng".
   - Vào tab "Giỏ hàng" -> Bấm `+` và `-` để tăng/giảm số lượng sản phẩm.
   - Bấm "🛍️ Thanh toán & Đặt hàng" -> Xác nhận đặt hàng. Chụp ảnh giỏ hàng & thông báo đặt hàng thành công.
   - Vào tab "Profile" -> Bấm "📦 Lịch sử mua hàng" -> Xem đơn hàng vừa đặt. Chụp ảnh màn hình.
   - Tại Profile, bấm "✏️ Đổi mật khẩu / Cập nhật" -> Đổi mật khẩu mới. Chụp ảnh màn hình.
2. **Quản trị đơn hàng Admin (C.2)**:
   - Đăng nhập tài khoản Admin -> Vào `Home Admin` -> Bấm "Quản lý đơn hàng".
   - Danh sách đơn hàng của khách hiển thị chi tiết: Mã đơn, ID khách, món hàng, tổng tiền, ngày đặt.
   - Bấm vào trạng thái đơn hàng -> Chọn trạng thái mới (`Đang giao hàng`, `Đã giao thành công`...). Chụp ảnh màn hình.

