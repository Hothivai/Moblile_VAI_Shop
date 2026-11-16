# TÀI LIỆU TỔNG HỢP MÃ NGUỒN VÀ BÁO CÁO KỸ THUẬT (CODE SUMMARY)
**Dự án**: MyExpoApp - Ứng dụng Quản trị & Bán hàng Di động  
**Nền tảng**: React Native (Expo SDK 58), Expo Router, React Navigation, Expo SQLite, AsyncStorage  
**Vai trò phát triển**: Senior Full-stack Developer  

---

## MỤC LỤC
1. [Tổng quan dự án & Công nghệ](#1-tổng-quan-dự-án--công-nghệ)
2. [Cấu trúc mã nguồn chi tiết](#2-cấu-trúc-mã-nguồn-chi-tiết)
3. [Báo cáo đối chiếu và hoàn thành các checklist yêu cầu](#3-báo-cáo-đối-chiếu-và-hoàn-thành-các-checklist-yêu-cầu)
   - [3.1. Chức năng Đăng ký, Đăng nhập (HD Buổi 13)](#31-chức-năng-đăng-ký-đăng-nhập-hd-buổi-13)
   - [3.2. Chức năng Quản trị Admin (4.0 Điểm)](#32-chức-năng-quản-trị-admin-40-điểm)
4. [Kiến trúc luồng dữ liệu & Điều hướng](#4-kiến-trúc-luồng-dữ-liệu--điều-hướng)
5. [Hướng dẫn cài đặt, chạy ứng dụng & Kiểm thử](#5-hướng-dẫn-cài-đặt-chạy-ứng-dụng--kiểm-thử)

---

## 1. TỔNG QUAN DỰ ÁN & CÔNG NGHỆ

Dự án là ứng dụng di động hoàn chỉnh đa nền tảng (Android, iOS và Web) phục vụ nhu cầu mua sắm và quản trị cửa hàng:
- **Ngôn ngữ**: TypeScript 5.9+, JavaScript ES2023+.
- **Framework nền tảng**: React Native 0.88.1, React 19.3.0, Expo SDK 58.0.22.
- **Routing & Điều hướng**:
  - Expo Router (File-based routing trong `src/app/`).
  - React Navigation (`@react-navigation/bottom-tabs` & `@react-navigation/native-stack`).
- **Cơ sở dữ liệu cục bộ**:
  - `expo-sqlite`: Lưu trữ quan hệ ACID trên thiết bị di động (Native Android/iOS).
  - Web Fallback: `localStorage` engine giả lập SQLite cho môi trường Web (`database.web.ts`).
- **Quản lý phiên làm việc**:
  - `@react-native-async-storage/async-storage`: Lưu trữ key `loggedInUser`.
  - React Context (`AuthContext.tsx`): Quản lý trạng thái xác thực toàn cục.

---

## 2. CẤU TRÚC MÃ NGUỒN CHI TIẾT

```
c:\LapTrinhDiDong2\MyExpoApp
├── assets/
│   └── images/
│       └── products/                 # Hình ảnh sản phẩm (balo, giày, mũ, túi xách...)
├── src/
│   ├── app/                          # Expo Router File-based Routes
│   │   ├── _layout.tsx               # Root Layout: ThemeProvider, AuthProvider, Stack
│   │   ├── index.tsx                 # Màn hình gốc (Entrypoint) nạp AppTabs
│   │   ├── AdminHomeScreen.tsx       # Màn hình Trang chủ Quản trị (Dashboard)
│   │   ├── CategoryScreen.tsx        # Màn hình Quản lý Loại sản phẩm (SQLite CRUD)
│   │   ├── UserScreen.tsx            # Màn hình Quản lý Người dùng (SQLite CRUD, phân quyền)
│   │   └── ProductSqlite.tsx         # Route nạp AppNavigatorProduct
│   ├── auth/
│   │   └── AuthContext.tsx           # Context quản lý user đăng nhập & AsyncStorage
│   ├── cart/
│   │   └── cartStorage.ts            # Quản lý giỏ hàng người dùng
│   ├── components/
│   │   ├── Header.tsx                # Header: Hiển thị lời chào user/role & nút Đăng xuất
│   │   ├── CategorySelector.tsx      # Bộ lọc danh mục ngang
│   │   └── animated-icon.tsx         # Splash screen overlay
│   ├── database/
│   │   ├── database.ts               # Database Engine SQLite (Bảng categories, products, users)
│   │   └── database.web.ts           # Web Engine đồng bộ cho trình duyệt
│   ├── navigation/
│   │   ├── AppTabs.tsx               # Bottom Tab Navigator (Động theo role: Khách, User, Admin)
│   │   ├── HomeStackScreen.tsx       # Native Stack điều hướng sản phẩm & chi tiết
│   │   └── AppNavigatorProduct.tsx   # Stack điều hướng Quản lý sản phẩm & Chi tiết
│   └── screens/
│       ├── HomeScreen.tsx            # Trang chủ hiển thị danh mục và danh sách sản phẩm
│       ├── LoginSqlite.tsx           # Màn hình Đăng nhập (Buổi 13)
│       ├── SignupSqlite.tsx          # Màn hình Đăng ký tài khoản (Buổi 13)
│       ├── ProductDetailScreen1.tsx  # Chi tiết sản phẩm & Thêm vào giỏ hàng
│       ├── ProductsByCategoryScreen.tsx # Sản phẩm lọc theo loại
│       ├── ProductManagementScreen.tsx # Quản lý sản phẩm (Thêm, Sửa, Xóa, Chi tiết)
│       ├── CartScreen.tsx            # Giỏ hàng người dùng
│       ├── ProfileScreen.tsx         # Thông tin tài khoản người dùng
│       └── AdminDashboard.tsx        # Wrapper điều hướng quản trị
├── App.tsx                           # Điểm nạp dự phòng
├── package.json                      # Danh mục dependencies chuẩn Expo SDK 58
├── tsconfig.json                     # Cấu hình TypeScript nghiêm ngặt
└── CODE_SUMMARY.md                   # Báo cáo tổng hợp này
```

---

## 3. BÁO CÁO ĐỐI CHIẾU VÀ HOÀN THÀNH CÁC CHECKLIST YÊU CẦU

### 3.1. Chức năng Đăng ký, Đăng nhập (HD Buổi 13)

| Mục | Yêu cầu | Tệp tin thực hiện | Chi tiết hiện thực | Trạng thái |
|:---:|:---|:---|:---|:---:|
| 1.1 | **Đăng ký tài khoản** | `src/screens/SignupSqlite.tsx` | - Kiểm tra nhập liệu `username`, `password`.<br>- Gọi `addUser(username, password, 'user')`.<br>- Kiểm tra trùng lặp tên đăng nhập.<br>- Alert thành công và tự động điều hướng sang `LoginSqlite`. | **ĐÃ HOÀN THÀNH** |
| 1.2 | **Đăng nhập tài khoản** | `src/screens/LoginSqlite.tsx` | - Xác thực tài khoản qua `getUserByCredentials`.<br>- Lưu thông tin vào `AsyncStorage.setItem('loggedInUser', ...)`.<br>- Cập nhật trạng thái `setUser` trong `AuthContext`.<br>- **Phân quyền điều hướng**: Nếu là `admin` -> điều hướng tới `AdminTab`; nếu là `user` -> điều hướng tới `HomeTab`. | **ĐÃ HOÀN THÀNH** |
| 1.3 | **Phiên làm việc & Tự khôi phục** | `src/auth/AuthContext.tsx` | - Tự động đọc dữ liệu từ `AsyncStorage` khi khởi chạy app.<br>- Cung cấp hook `useAuth()` cho mọi component con sử dụng. | **ĐÃ HOÀN THÀNH** |

---

### 3.2. Chức năng Quản trị Admin (4.0 Điểm)

#### 2.1. Khởi tạo database (0.25 điểm)
- **Tệp tin**: `src/database/database.ts` & `src/database/database.web.ts`
- **Mã nguồn thực hiện**:
  ```typescript
  await database.runAsync(
    `INSERT OR IGNORE INTO users (username, password, role)
     VALUES ('admin', '123456', 'admin')`,
  );
  ```
- **Kết quả**: Cơ sở dữ liệu tự động khởi tạo bảng `users` và seed sẵn 01 tài khoản Admin (`username: admin`, `password: 123456`, `role: admin`).

#### 2.2. Đăng nhập Admin (0.5 điểm)
- **Tệp tin**: `src/screens/LoginSqlite.tsx`, `src/components/Header.tsx`, `src/app/AdminHomeScreen.tsx`
- **Chi tiết hiện thực**:
  - Đăng nhập thành công với tài khoản Admin sẽ kích hoạt `navigation.navigate('AdminTab')`.
  - Trên `Header.tsx`: Hiển thị rõ lời chào `"Xin chào, admin (admin)"`.
  - Nút **Đăng Xuất**: Khi nhấn sẽ gọi `AsyncStorage.removeItem('loggedInUser')`, đặt `setUser(null)`, xóa phiên làm việc và chuyển về `HomeTab`.
  - Màn hình `AdminHomeScreen` nhúng sẵn `Header.tsx` ở đầu trang.

#### 2.3. Trang chủ quản trị (0.25 điểm)
- **Tệp tin**: `src/app/AdminHomeScreen.tsx`
- **Chi tiết hiện thực**: Giao diện thiết kế theo phong cách hiện đại với 3 thẻ (Card/Button) lớn có icon, màu sắc nhận diện và mô tả:
  1. **Nút Quản lý User**: Điều hướng tới `/UserScreen`.
  2. **Nút Quản lý loại sản phẩm**: Điều hướng tới `/CategoryScreen`.
  3. **Nút Quản lý sản phẩm**: Điều hướng tới `/ProductSqlite`.
  - Có nút `‹ Quay lại` để trở về màn hình trước.

#### 2.4. Admin Bottom Tab (0.5 điểm)
- **Tệp tin**: `src/navigation/AppTabs.tsx`
- **Chi tiết hiện thực**:
  Khi người dùng đăng nhập có vai trò `admin`, thanh Bottom Tab dưới cùng tự động chuyển đổi thành 4 tab đúng chuẩn yêu cầu:
  1. **Home của User** (`title: 'Home User'`, icon: 🏠, Component: `HomeStackScreen`).
  2. **Home của Admin** (`title: 'Home Admin'`, icon: 🛡️, Component: `AdminHomeScreen`).
  3. **Signup** (`title: 'Signup'`, icon: ➕, Component: `SignupSqlite`).
  4. **Login** (`title: 'Login'`, icon: 🔒, Component: `LoginSqlite`).

#### 2.5. Quản trị User (1.0 điểm)
- **Tệp tin**: `src/app/UserScreen.tsx`
- **Chi tiết hiện thực**:
  - **Xem danh sách**: FlatList hiển thị danh sách người dùng lấy trực tiếp từ SQLite qua `fetchUsers()`. Mỗi dòng hiển thị ID, username, badge vai trò (`👑 Quản trị viên` hoặc `👤 Người dùng`), cùng thẻ `"Đang dùng"` nếu trùng với tài khoản hiện tại.
  - **Thêm User**: Form nhập username, password, bộ chọn nút chuyển đổi vai trò (`user` hoặc `admin`). Kiểm tra trùng username và ghi trực tiếp vào SQLite qua `addUser()`.
  - **Sửa User**: Modal chỉnh sửa tên đăng nhập, mật khẩu và thay đổi phân quyền thông qua `updateUser()`.
  - **Xóa User**: Modal xác nhận xóa qua `deleteUser()`. Có cơ chế an toàn: **chặn không cho phép xóa tài khoản Admin đang đăng nhập**.
  - **Điều hướng**: Nút `‹ Quay lại` đưa quản trị viên trở về `AdminHomeScreen`.

#### 2.6. Quản trị loại sản phẩm (0.75 điểm)
- **Tệp tin**: `src/app/CategoryScreen.tsx`, `src/database/database.ts`
- **Chi tiết hiện thực**:
  - Bổ sung các phương thức SQLite vào `database.ts`: `addCategory(name)`, `updateCategory(category)`, `deleteCategory(id)`.
  - **Xem danh sách**: Hiển thị toàn bộ danh mục từ bảng `categories` SQLite qua `fetchCategories()`.
  - **Thêm danh mục**: Ô nhập liệu và nút `+ Thêm Loại Sản Phẩm` có validate khoảng trắng và lưu vào SQLite.
  - **Sửa danh mục**: Nút `✏️` mở Modal cập nhật tên danh mục.
  - **Xóa danh mục**: Nút `🗑️` mở Modal cảnh báo xác nhận xóa.
  - **Điều hướng**: Nút `‹ Quay lại` trở về `AdminHomeScreen`.

#### 2.7. Quản trị sản phẩm (0.75 điểm)
- **Tệp tin**: `src/screens/ProductManagementScreen.tsx`, `src/app/ProductSqlite.tsx`
- **Chi tiết hiện thực**:
  - Hiển thị danh sách sản phẩm, hình ảnh minh họa, giá tiền và danh mục.
  - Thêm mới sản phẩm có chọn danh mục theo chip.
  - Sửa thông tin sản phẩm và xóa sản phẩm có Modal xác nhận.
  - Xem chi tiết sản phẩm qua màn hình `ProductDetailScreen1`.
  - **Bổ sung nút `‹ Quay lại`** ở đầu trang giúp Admin quay về trang chủ quản trị `AdminHomeScreen`.

---

## 4. KIẾN TRÚC LUỒNG DỮ LIỆU & ĐIỀU HƯỚNG

```
                          [Người dùng khởi động Ứng dụng]
                                        │
                               [Kiểm tra AsyncStorage]
                            ┌───────────┴───────────┐
                       [Đã đăng nhập]           [Chưa đăng nhập]
                            │                           │
                   ┌────────┴────────┐                  │
              (role === 'admin') (role === 'user')      │
                   │                 │                  │
                   ▼                 ▼                  ▼
          [Admin Bottom Tab]   [User Bottom Tab]   [Guest Bottom Tab]
          - Home User          - Trang chủ         - Trang chủ
          - Home Admin         - Giỏ hàng          - Đăng ký
          - Signup             - Profile           - Đăng nhập
          - Login
                   │
         [Nhấn vào Home Admin]
                   │
                   ▼
          [AdminHomeScreen]
          ├── Header ("Xin chào, admin (admin)" + Nút Đăng xuất)
          ├── [Card 1: Quản lý người dùng]  ──> [UserScreen (CRUD SQLite)]
          ├── [Card 2: Loại sản phẩm]      ──> [CategoryScreen (CRUD SQLite)]
          └── [Card 3: Quản lý sản phẩm]    ──> [ProductManagementScreen (CRUD SQLite)]
```

---

## 5. HƯỚNG DẪN CÀI ĐẶT, CHẠY ỨNG DỤNG & KIỂM THỬ

### 5.1. Khởi chạy ứng dụng
```bash
# Cài đặt thư viện nếu chưa có (dự án đã sẵn sàng)
npm install

# Khởi chạy ứng dụng trên thiết bị di động / máy ảo
npx expo start

# Hoặc khởi chạy trên nền tảng Web
npx expo start --web
```

### 5.2. Các bước kiểm thử từng chức năng

1. **Kiểm tra Đăng nhập Admin**:
   - Chọn tab **Đăng nhập** (`LoginSqlite`).
   - Nhập thông tin: Tên đăng nhập: `admin` | Mật khẩu: `123456`.
   - Bấm **Đăng nhập** -> Kiểm tra: Ứng dụng thông báo thành công và chuyển thẳng đến tab **Home Admin** (`AdminHomeScreen`).
   - Kiểm tra `Header.tsx`: Hiển thị `"Xin chào, admin (admin)"` và có nút màu đỏ `"Đăng Xuất"`.

2. **Kiểm tra Admin Bottom Tab**:
   - Quan sát thanh điều hướng ở đáy màn hình: Gồm đủ 4 tab: **Home User**, **Home Admin**, **Signup**, **Login**.

3. **Kiểm tra Quản trị User (`UserScreen`)**:
   - Tại `AdminHomeScreen`, nhấn vào thẻ **"Quản lý người dùng"**.
   - Kiểm tra danh sách hiển thị tài khoản `admin` (ID: 1).
   - Thêm user mới: Nhập username, mật khẩu, chọn vai trò `user` hoặc `admin` -> Bấm Thêm -> Kiểm tra hiển thị ngay trên danh sách.
   - Sửa user: Bấm icon ✏️ -> Đổi mật khẩu/vai trò -> Lưu.
   - Xóa user: Bấm icon 🗑️ trên tài khoản mới tạo -> Xác nhận Xóa -> Tài khoản biến mất khỏi SQLite.
   - Kiểm tra nút bảo vệ: Thử bấm xóa tài khoản đang đăng nhập -> Ứng dụng cảnh báo không thể xóa.
   - Bấm nút `‹ Quay lại` -> Trở về trang chủ quản trị an toàn.

4. **Kiểm tra Quản lý Loại sản phẩm (`CategoryScreen`)**:
   - Tại `AdminHomeScreen`, nhấn vào thẻ **"Loại sản phẩm"**.
   - Nhập tên danh mục mới (ví dụ: `Đồng hồ`) -> Bấm Thêm -> Kiểm tra danh mục xuất hiện.
   - Bấm ✏️ để sửa tên danh mục -> Lưu -> Tên mới được cập nhật trong SQLite.
   - Bấm 🗑️ để xóa danh mục -> Xác nhận xóa.
   - Bấm nút `‹ Quay lại` -> Trở về trang chủ quản trị.

5. **Kiểm tra Quản trị Sản phẩm (`ProductSqlite`)**:
   - Tại `AdminHomeScreen`, nhấn vào thẻ **"Quản lý sản phẩm"**.
   - Kiểm tra danh sách sản phẩm, thêm/sửa/xóa sản phẩm, xem chi tiết sản phẩm.
   - Bấm nút `‹ Quay lại` để trở về `AdminHomeScreen`.

6. **Kiểm tra Đăng xuất**:
   - Tại Header trên bất kỳ màn hình nào, bấm nút **Đăng Xuất**.
   - Kiểm tra: Phiên làm việc được xóa, Header chuyển về `"Vui lòng đăng nhập để mua sắm"`, Bottom Tab trở về trạng thái chưa đăng nhập (`Trang chủ`, `Đăng ký`, `Đăng nhập`).

---

### 5.3. Báo cáo kiểm định chất lượng mã nguồn (Code Quality)
- **TypeScript**:
  ```bash
  npx tsc --noEmit
  # Kết quả: EXIT CODE 0 (Không phát hiện lỗi kiểu dữ liệu)
  ```
- **ESLint**:
  ```bash
  npx expo lint
  # Kết quả: EXIT CODE 0 (0 errors)
  ```
