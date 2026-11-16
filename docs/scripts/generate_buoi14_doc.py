import os
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import parse_xml, OxmlElement
from docx.oxml.ns import nsdecls, qn

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))

def set_cell_background(cell, fill_hex):
    tcPr = cell._tc.get_or_add_tcPr()
    tcPr.append(parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>'))

def set_cell_margins(cell, top=140, bottom=140, left=200, right=200):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = parse_xml(f'<w:tcMar {nsdecls("w")}><w:top w:w="{top}" w:type="dxa"/><w:bottom w:w="{bottom}" w:type="dxa"/><w:left w:w="{left}" w:type="dxa"/><w:right w:w="{right}" w:type="dxa"/></w:tcMar>')
    tcPr.append(tcMar)

def set_cell_border(cell, color="9CA3AF", sz="12", val="dashed"):
    tcPr = cell._tc.get_or_add_tcPr()
    borders = parse_xml(
        f'<w:tcBorders {nsdecls("w")}>'
        f'<w:top w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'<w:left w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'<w:bottom w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'<w:right w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'</w:tcBorders>'
    )
    tcPr.append(borders)

def read_source_file(file_path):
    if os.path.exists(file_path):
        with open(file_path, "r", encoding="utf-8") as f:
            return f.read()
    return "// Không tìm thấy file"

def add_code_block(doc, code_text):
    table = doc.add_table(rows=1, cols=1)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False
    
    cell = table.cell(0, 0)
    cell.width = Inches(6.5)
    set_cell_background(cell, "F8FAFC")
    set_cell_margins(cell, top=120, bottom=120, left=180, right=180)
    
    # Border for code block
    tcPr = cell._tc.get_or_add_tcPr()
    borders = parse_xml(
        f'<w:tcBorders {nsdecls("w")}>'
        f'<w:top w:val="single" w:sz="6" w:space="0" w:color="CBD5E1"/>'
        f'<w:left w:val="single" w:sz="18" w:space="0" w:color="0284C7"/>'
        f'<w:bottom w:val="single" w:sz="6" w:space="0" w:color="CBD5E1"/>'
        f'<w:right w:val="single" w:sz="6" w:space="0" w:color="CBD5E1"/>'
        f'</w:tcBorders>'
    )
    tcPr.append(borders)
    
    p = cell.paragraphs[0]
    p.paragraph_format.space_before = Pt(2)
    p.paragraph_format.space_after = Pt(2)
    p.paragraph_format.line_spacing = 1.15
    
    lines = code_text.splitlines()
    for idx, line in enumerate(lines):
        run = p.add_run(line + ("\n" if idx < len(lines) - 1 else ""))
        run.font.name = "Consolas"
        run.font.size = Pt(8.5)
        run.font.color.rgb = RGBColor(30, 41, 59)
    
    # add spacing after table
    doc.add_paragraph().paragraph_format.space_after = Pt(4)

def add_screenshot_box(doc, title, instruction):
    table = doc.add_table(rows=1, cols=1)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False
    
    cell = table.cell(0, 0)
    cell.width = Inches(6.5)
    set_cell_background(cell, "F9FAFB")
    set_cell_border(cell, color="9CA3AF", sz="12", val="dashed")
    set_cell_margins(cell, top=200, bottom=200, left=200, right=200)
    
    p = cell.paragraphs[0]
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(6)
    p.paragraph_format.space_after = Pt(3)
    
    run_icon = p.add_run("📸 ")
    run_icon.font.size = Pt(14)
    
    run_title = p.add_run(f"HÌNH ẢNH MINH CHỨNG: {title}\n")
    run_title.font.name = "Calibri"
    run_title.font.bold = True
    run_title.font.size = Pt(11)
    run_title.font.color.rgb = RGBColor(31, 41, 55)
    
    p2 = cell.add_paragraph()
    p2.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p2.paragraph_format.space_before = Pt(0)
    p2.paragraph_format.space_after = Pt(6)
    
    run_inst = p2.add_run(f"👉 {instruction}\n(Click vào khung này rồi nhấn Ctrl + V để dán ảnh chụp màn hình)")
    run_inst.font.name = "Calibri"
    run_inst.font.italic = True
    run_inst.font.size = Pt(9.5)
    run_inst.font.color.rgb = RGBColor(107, 114, 128)
    
    doc.add_paragraph().paragraph_format.space_after = Pt(8)

def build_document():
    doc = docx.Document()
    
    # Page setup: Margins 0.8 inch
    sections = doc.sections
    for section in sections:
        section.top_margin = Inches(0.8)
        section.bottom_margin = Inches(0.8)
        section.left_margin = Inches(0.8)
        section.right_margin = Inches(0.8)
        
    # Title
    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_title.paragraph_format.space_before = Pt(0)
    p_title.paragraph_format.space_after = Pt(4)
    run_t = p_title.add_run("BÁO CÁO BÀI TẬP BUỔI 14\n")
    run_t.font.name = "Arial"
    run_t.font.size = Pt(18)
    run_t.font.bold = True
    run_t.font.color.rgb = RGBColor(23, 105, 170) # primary blue
    
    run_sub = p_title.add_run("CHỨC NĂNG GIỎ HÀNG & THANH TOÁN ĐẶT HÀNG (SHOPPING CART & CHECKOUT)")
    run_sub.font.name = "Arial"
    run_sub.font.size = Pt(13)
    run_sub.font.bold = True
    run_sub.font.color.rgb = RGBColor(55, 65, 81)
    
    # Info Box
    p_info = doc.add_paragraph()
    p_info.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_info.paragraph_format.space_after = Pt(16)
    r_info = p_info.add_run("Môn học: Lập trình Di động 2 (React Native / Expo SDK 58)\nSinh viên thực hiện: Hồ Thị Vãi  |  Lớp: PNV27A")
    r_info.font.name = "Calibri"
    r_info.font.size = Pt(10.5)
    r_info.font.italic = True
    r_info.font.color.rgb = RGBColor(75, 85, 99)
    
    doc.add_heading("I. TỔNG QUAN LUỒNG CHỨC NĂNG GIỎ HÀNG", level=1)
    p_intro = doc.add_paragraph(
        "Chức năng Giỏ hàng trong Bài 14 được xây dựng hoàn chỉnh gồm các thành phần chính:\n"
        "1. Quản lý lưu trữ trạng thái giỏ hàng (Cart Storage) qua AsyncStorage theo ID từng User.\n"
        "2. Màn hình Chi tiết sản phẩm (ProductDetailScreen1.tsx) với chức năng chọn và Thêm vào giỏ hàng.\n"
        "3. Màn hình Giỏ hàng (CartScreen.tsx) cho phép xem danh sách, tăng/giảm (+/-) số lượng, xóa sản phẩm, tự động tính tổng tiền.\n"
        "4. Đặt hàng & Thanh toán (Checkout): Lưu đơn hàng vào bảng orders trong cơ sở dữ liệu SQLite và xóa giỏ hàng.\n"
        "5. Lịch sử đơn hàng (ProfileScreen.tsx): Xem lại các đơn hàng đã đặt thành công từ giỏ hàng.\n"
        "6. Điều hướng (AppTabs.tsx): Tích hợp Tab Giỏ hàng hiển thị trên thanh Bottom Tab dành cho User."
    )
    p_intro.paragraph_format.line_spacing = 1.2
    p_intro.paragraph_format.space_after = Pt(14)
    
    # ----------------------------------------------------
    # PHẦN 1: cartStorage.ts
    # ----------------------------------------------------
    doc.add_heading("1. Module Lưu trữ & Logic Giỏ hàng (cartStorage.ts)", level=2)
    p_desc1 = doc.add_paragraph(
        "Đường dẫn: src/cart/cartStorage.ts\n"
        "Chức năng: Cung cấp các phương thức thao tác dữ liệu giỏ hàng với AsyncStorage: getCartItems, addCartItem, updateCartItemQuantity, removeCartItem, clearCart."
    )
    p_desc1.runs[0].font.italic = True
    
    code_cart_storage = read_source_file(
        os.path.join(PROJECT_ROOT, "src", "features", "shop", "cart", "cartStorage.ts")
    )
    add_code_block(doc, code_cart_storage)
    
    # ----------------------------------------------------
    # PHẦN 2: ProductDetailScreen1.tsx
    # ----------------------------------------------------
    doc.add_heading("2. Màn hình Chi tiết sản phẩm & Thêm vào giỏ (ProductDetailScreen1.tsx)", level=2)
    p_desc2 = doc.add_paragraph(
        "Đường dẫn: src/screens/ProductDetailScreen1.tsx\n"
        "Chức năng: Hiển thị đầy đủ thông tin chi tiết của sản phẩm (ảnh, tên, giá, danh mục). Khi người dùng đăng nhập tài khoản user, xuất hiện nút \"Thêm vào giỏ hàng\" gọi hàm addCartItem."
    )
    p_desc2.runs[0].font.italic = True
    
    code_detail = read_source_file(
        os.path.join(PROJECT_ROOT, "src", "features", "shop", "screens", "ProductDetailScreen1.tsx")
    )
    add_code_block(doc, code_detail)
    
    add_screenshot_box(
        doc,
        "Chi tiết sản phẩm & Nút Thêm vào giỏ hàng",
        "Chụp ảnh màn hình Chi tiết sản phẩm có nút 'Thêm vào giỏ hàng' và thông báo Alert đã thêm sản phẩm thành công."
    )
    
    # ----------------------------------------------------
    # PHẦN 3: CartScreen.tsx
    # ----------------------------------------------------
    doc.add_heading("3. Giao diện Màn hình Giỏ hàng (CartScreen.tsx)", level=2)
    p_desc3 = doc.add_paragraph(
        "Đường dẫn: src/screens/CartScreen.tsx\n"
        "Chức năng: Hiển thị danh sách sản phẩm trong giỏ hàng. Hỗ trợ bấm (+) để tăng, (-) để giảm số lượng, (✕) để xóa món hàng. Tự động tính Tổng cộng tiền thanh toán và nút '🛍️ Thanh toán & Đặt hàng'."
    )
    p_desc3.runs[0].font.italic = True
    
    code_cart = read_source_file(
        os.path.join(PROJECT_ROOT, "src", "features", "shop", "screens", "CartScreen.tsx")
    )
    add_code_block(doc, code_cart)
    
    add_screenshot_box(
        doc,
        "Giao diện Giỏ hàng & Thao tác Tăng/Giảm số lượng",
        "Chụp ảnh màn hình Giỏ hàng với các món hàng, nút [+] [-], số lượng thay đổi và ô Tổng cộng số tiền."
    )
    
    add_screenshot_box(
        doc,
        "Xác nhận Thanh toán & Đặt hàng thành công",
        "Chụp ảnh hộp thoại Alert xác nhận đặt hàng và thông báo '🎉 Đặt hàng thành công! Đơn hàng của bạn đã được ghi nhận vào hệ thống.'"
    )
    
    # ----------------------------------------------------
    # PHẦN 4: database.ts (Orders Table & Functions)
    # ----------------------------------------------------
    doc.add_heading("4. Xử lý Đơn hàng trong Cơ sở dữ liệu SQLite (database.ts)", level=2)
    p_desc4 = doc.add_paragraph(
        "Đường dẫn: src/database/database.ts (trích đoạn xử lý Đơn hàng / Orders)\n"
        "Chức năng: Bảng orders lưu thông tin đơn hàng sau khi thanh toán giỏ hàng (userId, items, total, status, createdAt). Các hàm: createOrder, fetchOrdersByUserId, fetchAllOrders, updateOrderStatus."
    )
    p_desc4.runs[0].font.italic = True
    
    order_db_code = """// Trích đoạn xử lý Đơn hàng (Orders) trong src/database/database.ts:

export type Order = {
  id: number;
  userId: number;
  items: string;
  total: number;
  status: string;
  createdAt: string;
};

// Khởi tạo bảng orders trong initDatabase:
await database.execAsync(`
  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER,
    items TEXT,
    total REAL,
    status TEXT DEFAULT 'Đang xử lý',
    createdAt TEXT
  );
`);

// Tạo đơn hàng mới khi thanh toán giỏ hàng:
export const createOrder = async (
  userId: number,
  items: string,
  total: number,
): Promise<void> => {
  const database = await getDb();
  const createdAt = new Date().toLocaleString("vi-VN");
  await database.runAsync(
    "INSERT INTO orders (userId, items, total, status, createdAt) VALUES (?, ?, ?, ?, ?)",
    [userId, items, total, "Đang xử lý", createdAt],
  );
};

// Lấy lịch sử đơn hàng của người dùng:
export const fetchOrdersByUserId = async (userId: number): Promise<Order[]> => {
  const database = await getDb();
  return database.getAllAsync<Order>(
    "SELECT * FROM orders WHERE userId = ? ORDER BY id DESC",
    [userId],
  );
};

// Cập nhật trạng thái đơn hàng (Dành cho Admin duyệt đơn):
export const updateOrderStatus = async (
  orderId: number,
  status: string,
): Promise<void> => {
  const database = await getDb();
  await database.runAsync("UPDATE orders SET status = ? WHERE id = ?", [
    status,
    orderId,
  ]);
};"""
    add_code_block(doc, order_db_code)
    
    # ----------------------------------------------------
    # PHẦN 5: ProfileScreen.tsx (Xem Lịch sử Đơn hàng)
    # ----------------------------------------------------
    doc.add_heading("5. Xem Lịch sử Đơn hàng sau khi đặt (ProfileScreen.tsx)", level=2)
    p_desc5 = doc.add_paragraph(
        "Đường dẫn: src/screens/ProfileScreen.tsx\n"
        "Chức năng: Sau khi thanh toán từ Giỏ hàng, đơn hàng được lưu trữ. Màn hình Profile cung cấp nút '📦 Lịch sử mua hàng' để người dùng xem lại chi tiết các đơn đã đặt và trạng thái xử lý."
    )
    p_desc5.runs[0].font.italic = True
    
    code_profile = read_source_file(
        os.path.join(PROJECT_ROOT, "src", "features", "shop", "screens", "ProfileScreen.tsx")
    )
    add_code_block(doc, code_profile)
    
    add_screenshot_box(
        doc,
        "Lịch sử Đơn hàng trong trang Profile",
        "Chụp ảnh màn hình Modal 'Lịch sử mua hàng' hiển thị các đơn hàng vừa đặt từ giỏ hàng kèm thời gian, danh sách món và tổng tiền."
    )
    
    # ----------------------------------------------------
    # PHẦN 6: AppTabs.tsx (Cấu hình Bottom Tab Giỏ hàng)
    # ----------------------------------------------------
    doc.add_heading("6. Điều hướng Bottom Tab tích hợp Giỏ hàng (AppTabs.tsx)", level=2)
    p_desc6 = doc.add_paragraph(
        "Đường dẫn: src/navigation/AppTabs.tsx\n"
        "Chức năng: Hiển thị tab '🛒 Giỏ hàng' trên thanh Bottom Tab Navigator khi người dùng đăng nhập tài khoản User."
    )
    p_desc6.runs[0].font.italic = True
    
    code_tabs = read_source_file(
        os.path.join(PROJECT_ROOT, "src", "features", "shop", "navigation", "AppTabs.tsx")
    )
    add_code_block(doc, code_tabs)
    
    add_screenshot_box(
        doc,
        "Thanh Bottom Tab với biểu tượng Giỏ hàng 🛒",
        "Chụp ảnh toàn bộ màn hình ứng dụng hiển thị thanh điều hướng phía dưới có Tab 'Giỏ hàng'."
    )
    
    # Save
    out_path = os.path.join(
        PROJECT_ROOT, "docs", "reports", "BAO_CAO_BUOI_14_GIO_HANG.docx"
    )
    doc.save(out_path)
    print(f"Báo cáo Word đã được tạo thành công tại: {out_path}")

if __name__ == "__main__":
    build_document()

