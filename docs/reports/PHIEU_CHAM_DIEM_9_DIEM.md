# PHIẾU CHẤM ĐIỂM BÀI TẬP LỚN MÔN LẬP TRÌNH DI ĐỘNG 2
## THANG ĐIỂM MỤC TIÊU: 9.0 / 10.0 ĐIỂM

- **Sinh viên thực hiện:** Hồ Thị Vãi
- **Lớp:** PNV27A
- **File Word hoàn chỉnh có sẵn khung dán ảnh:** [PHIEU_CHAM_DIEM_9_DIEM.docx](file:///c:/LapTrinhDiDong2/MyExpoApp/PHIEU_CHAM_DIEM_9_DIEM.docx)
- **Ghi chú điều chỉnh thang điểm 9.0đ:** Đã lược bỏ 3 chức năng phức tạp/nâng cao:
  - ❌ *Admin quản trị đơn hàng* (-0.5đ)
  - ❌ *Xem lịch sử mua hàng* (-0.25đ)
  - ❌ *Cập nhật thông tin profile* (-0.25đ)
  - **👉 Tổng điểm còn lại đúng chuẩn: 4.0đ (User) + 4.0đ (Admin) + 1.0đ (Giỏ hàng & Đặt hàng) = 9.0 điểm.**

---

### BẢNG PHIẾU CHẤM ĐIỂM VÀ MINH CHỨNG (KÈM KHUNG DÁN ẢNH KẾ BÊN)

| STT | Chức năng theo phiếu chấm | Điểm | Tệp tin mã nguồn | Khung dán ảnh chụp màn hình minh chứng (kế bên) |
| :---: | :--- | :---: | :--- | :--- |
| **A** | **CHỨC NĂNG CỦA NGƯỜI DÙNG** | **4.0đ** | | |
| **A.1** | Trang chủ người dùng (gồm các sản phẩm có sẵn khi khởi tạo database) | **0.25đ** | `src/screens/HomeScreen.tsx` | 📷 *[Dán ảnh Trang chủ có danh sách sản phẩm hiển thị đầy đủ]* |
| **A.2** | Banner và Menu điều hướng gồm: Home, Danh mục sản phẩm | **0.25đ** | `src/screens/HomeScreen.tsx` | 📷 *[Dán ảnh Banner cửa hàng & Menu thanh danh mục]* |
| **A.3** | Xem sản phẩm theo từng danh mục (CategorySelector.tsx) | **0.50đ** | `src/screens/ProductsByCategoryScreen.tsx`<br>`src/components/CategorySelector.tsx` | 📷 *[Dán ảnh Màn hình lọc sản phẩm theo từng danh mục đã chọn]* |
| **A.4** | Trang chi tiết sản phẩm khi click vào sản phẩm ở trang chủ | **0.25đ** | `src/screens/ProductDetailScreen1.tsx` | 📷 *[Dán ảnh Màn hình xem chi tiết 1 sản phẩm (ảnh, tên, giá, loại)]* |
| **A.5** | Bottom Tab ở trang chủ gồm 3 nút: Home, Sign up, Login | **0.25đ** | `src/navigation/AppTabs.tsx` | 📷 *[Dán ảnh Thanh Bottom Tab phía dưới có 3 nút: Home, Signup, Login]* |
| **A.6** | Đăng ký thành công tài khoản người dùng | **0.50đ** | `src/screens/SignupSqlite.tsx` | 📷 *[Dán ảnh Form Đăng ký điền thông tin và Alert tạo tài khoản thành công]* |
| **A.7** | Đăng nhập ở Bottom Tab, đăng nhập thành công điều hướng đến trang chủ | **0.50đ** | `src/screens/LoginSqlite.tsx` | 📷 *[Dán ảnh Form Đăng nhập và điều hướng ngay về Trang chủ]* |
| **A.8** | Hiển thị thông tin người dùng đã đăng nhập và nút Đăng xuất (Header.tsx) | **0.50đ** | `src/components/Header.tsx` | 📷 *[Dán ảnh Header hiển thị "Xin chào, [Tên]" và nút Đăng Xuất màu đỏ]* |
| **A.9** | Tìm kiếm theo tên hoặc theo danh mục | **0.50đ** | `src/screens/HomeScreen.tsx` | 📷 *[Dán ảnh Thanh tìm kiếm và kết quả lọc sản phẩm theo từ khóa]* |
| **A.10** | Lọc sản phẩm theo khoảng giá (<300k, 300k-800k, >800k) | **0.50đ** | `src/screens/HomeScreen.tsx` | 📷 *[Dán ảnh Chọn chip lọc giá và danh sách sản phẩm lọc tương ứng]* |
| **B** | **CHỨC NĂNG CỦA ADMIN** | **4.0đ** | | |
| **B.1** | Khởi tạo database với 1 tài khoản Admin có sẵn (admin / 123456) | **0.25đ** | `src/database/database.ts` | 📷 *[Dán ảnh Mã nguồn initDatabase hoặc thông tin đăng nhập admin/123456]* |
| **B.2** | Đăng nhập Admin (Header hiển thị admin, Đăng xuất, điều hướng đến trang chủ quản trị) | **0.50đ** | `src/screens/LoginSqlite.tsx`<br>`src/components/Header.tsx` | 📷 *[Dán ảnh Đăng nhập Admin thành công chuyển vào trang Quản trị]* |
| **B.3** | Trang chủ quản trị: gồm các nút Quản lý user, Loại sản phẩm, Quản lý sản phẩm | **0.25đ** | `src/app/AdminHomeScreen.tsx` | 📷 *[Dán ảnh Dashboard Admin có các thẻ: Quản lý User, Loại SP, Sản phẩm]* |
| **B.4** | Admin Bottom Tab gồm: Home của user, Home của admin, Signup, Login | **0.50đ** | `src/navigation/AppTabs.tsx` | 📷 *[Dán ảnh Thanh Bottom Tab Admin gồm 4 tab (Home User, Home Admin, Signup, Login)]* |
| **B.5** | Quản trị user: xem danh sách, cập nhật vai trò (admin/user), xóa user | **0.50đ** | `src/app/UserScreen.tsx` | 📷 *[Dán ảnh Màn hình danh sách User, Modal sửa vai trò & nút Xóa]* |
| **B.6** | Quản trị loại sản phẩm: xem, thêm, sửa, xóa (0.5đ) + thêm sản phẩm cho loại tương ứng (0.5đ) | **1.00đ** | `src/app/CategoryScreen.tsx` | 📷 *[Dán ảnh Màn hình Quản lý loại SP: CRUD loại và nút [+ Thêm SP] theo loại]* |
| **B.7** | Quản trị sản phẩm: xem danh sách, thêm mới, sửa, xóa sản phẩm | **1.00đ** | `src/screens/ProductManagementScreen.tsx` | 📷 *[Dán ảnh Màn hình Quản lý sản phẩm: danh sách SP, Modal thêm/sửa, xác nhận xóa]* |
| **C** | **CHỨC NĂNG KHÁC (GIỎ HÀNG & CHECKOUT)** | **1.0đ** | | |
| **C.1** | Xem và cập nhật giỏ hàng: xem danh sách, tăng/giảm (+/-) số lượng, xóa món | **0.50đ** | `src/screens/CartScreen.tsx`<br>`src/cart/cartStorage.ts` | 📷 *[Dán ảnh Màn hình Giỏ hàng: danh sách món hàng, nút [+] [-], số lượng và tổng tiền]* |
| **C.2** | Checkout đơn hàng và Đặt hàng: xác nhận đặt hàng, lưu database, xóa giỏ hàng | **0.50đ** | `src/screens/CartScreen.tsx`<br>`src/database/database.ts` | 📷 *[Dán ảnh Alert "Xác nhận đặt hàng" và thông báo "🎉 Đặt hàng thành công!"]* |
| **TỔNG**| **TỔNG ĐIỂM DỰ KIẾN THEO PHIẾU CHẤM** | **9.0đ** | | *(Đã bỏ 3 tính năng nâng cao -1.0đ để đạt chuẩn 9.0đ)* |

