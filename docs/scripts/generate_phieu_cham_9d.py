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

def set_cell_margins(cell, top=100, bottom=100, left=140, right=140):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = parse_xml(f'<w:tcMar {nsdecls("w")}><w:top w:w="{top}" w:type="dxa"/><w:bottom w:w="{bottom}" w:type="dxa"/><w:left w:w="{left}" w:type="dxa"/><w:right w:w="{right}" w:type="dxa"/></w:tcMar>')
    tcPr.append(tcMar)

def set_table_borders(table, color="D1D5DB", sz="6"):
    tblPr = table._tbl.tblPr
    borders = parse_xml(
        f'<w:tblBorders {nsdecls("w")}>'
        f'<w:top w:val="single" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'<w:left w:val="single" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'<w:bottom w:val="single" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'<w:right w:val="single" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'<w:insideH w:val="single" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'<w:insideV w:val="single" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'</w:tblBorders>'
    )
    tblPr.append(borders)

def create_phieu_cham_doc():
    doc = docx.Document()
    
    # Set page layout: A4 Portrait, Margins 0.5 inch (để bảng 5 cột rộng rãi)
    for section in doc.sections:
        section.top_margin = Inches(0.5)
        section.bottom_margin = Inches(0.5)
        section.left_margin = Inches(0.5)
        section.right_margin = Inches(0.5)
        
    # Title
    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_title.paragraph_format.space_before = Pt(0)
    p_title.paragraph_format.space_after = Pt(2)
    run_t = p_title.add_run("PHIẾU CHẤM ĐIỂM BÀI TẬP LỚN (THANG ĐIỂM: 9.0 ĐIỂM)\n")
    run_t.font.name = "Arial"
    run_t.font.size = Pt(16)
    run_t.font.bold = True
    run_t.font.color.rgb = RGBColor(15, 76, 129) # Navy blue
    
    run_sub = p_title.add_run("MÔN: LẬP TRÌNH DI ĐỘNG 2 — REACT NATIVE / EXPO SDK 58")
    run_sub.font.name = "Arial"
    run_sub.font.size = Pt(11)
    run_sub.font.bold = True
    run_sub.font.color.rgb = RGBColor(55, 65, 81)
    
    # Student Info
    p_info = doc.add_paragraph()
    p_info.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_info.paragraph_format.space_before = Pt(2)
    p_info.paragraph_format.space_after = Pt(12)
    r_info = p_info.add_run("Sinh viên thực hiện: Hồ Thị Vãi  |  Lớp: PNV27A  |  Mục tiêu: Đạt 9.0/10.0 điểm\n(Đã lược bỏ các chức năng nâng cao/phức tạp: Quản trị đơn hàng Admin, Lịch sử đơn hàng, Cập nhật Profile)")
    r_info.font.name = "Calibri"
    r_info.font.size = Pt(9.5)
    r_info.font.italic = True
    r_info.font.color.rgb = RGBColor(107, 114, 128)
    
    # Table data
    # Columns: STT (0.5"), Chức năng theo phiếu chấm (2.4"), Điểm (0.6"), Tệp tin mã nguồn (1.6"), Khung dán ảnh chụp màn hình (2.4")
    # Total width = 0.5 + 2.4 + 0.6 + 1.6 + 2.4 = 7.5 inches (exact fit for 8.5" page with 0.5" margins)
    col_widths = [Inches(0.55), Inches(2.35), Inches(0.65), Inches(1.65), Inches(2.30)]
    
    headers = [
        "STT",
        "Chức năng theo phiếu chấm",
        "Điểm",
        "Tệp tin mã nguồn",
        "Khung dán ảnh chụp màn hình minh chứng"
    ]
    
    # Rows structure:
    # ("header_group", title, total_score)
    # ("item", stt, name, score, files, photo_hint)
    data = [
        # PHAN A
        ("group", "A", "CHỨC NĂNG CỦA NGƯỜI DÙNG", "4.0đ"),
        ("item", "A.1", "Trang chủ người dùng (gồm các sản phẩm có sẵn khi khởi tạo database)", "0.25đ", "src/screens/HomeScreen.tsx", "Dán ảnh Trang chủ có danh sách sản phẩm hiển thị đầy đủ"),
        ("item", "A.2", "Banner và Menu điều hướng gồm: Home, Danh mục sản phẩm", "0.25đ", "src/screens/HomeScreen.tsx", "Dán ảnh Banner cửa hàng & Menu thanh danh mục"),
        ("item", "A.3", "Xem sản phẩm theo từng danh mục (CategorySelector.tsx)", "0.50đ", "src/screens/ProductsByCategoryScreen.tsx\nsrc/components/CategorySelector.tsx", "Dán ảnh Màn hình lọc sản phẩm theo từng danh mục đã chọn"),
        ("item", "A.4", "Trang chi tiết sản phẩm khi click vào sản phẩm ở trang chủ", "0.25đ", "src/screens/ProductDetailScreen1.tsx", "Dán ảnh Màn hình xem chi tiết 1 sản phẩm (ảnh, tên, giá, loại)"),
        ("item", "A.5", "Bottom Tab ở trang chủ gồm 3 nút: Home, Sign up, Login", "0.25đ", "src/navigation/AppTabs.tsx", "Dán ảnh Thanh Bottom Tab phía dưới có 3 nút: Home, Signup, Login"),
        ("item", "A.6", "Đăng ký thành công tài khoản người dùng", "0.50đ", "src/screens/SignupSqlite.tsx", "Dán ảnh Form Đăng ký điền thông tin và Alert tạo tài khoản thành công"),
        ("item", "A.7", "Đăng nhập ở Bottom Tab, đăng nhập thành công điều hướng đến trang chủ", "0.50đ", "src/screens/LoginSqlite.tsx", "Dán ảnh Form Đăng nhập và điều hướng ngay về Trang chủ"),
        ("item", "A.8", "Hiển thị thông tin người dùng đã đăng nhập và nút Đăng xuất (Header.tsx)", "0.50đ", "src/components/Header.tsx", "Dán ảnh Header hiển thị 'Xin chào, [Tên]' và nút Đăng Xuất màu đỏ"),
        ("item", "A.9", "Tìm kiếm theo tên hoặc theo danh mục", "0.50đ", "src/screens/HomeScreen.tsx", "Dán ảnh Thanh tìm kiếm và kết quả lọc sản phẩm theo từ khóa"),
        ("item", "A.10", "Lọc sản phẩm theo khoảng giá (<300k, 300k-800k, >800k)", "0.50đ", "src/screens/HomeScreen.tsx", "Dán ảnh Chọn chip lọc giá và danh sách sản phẩm lọc tương ứng"),
        
        # PHAN B
        ("group", "B", "CHỨC NĂNG CỦA ADMIN", "4.0đ"),
        ("item", "B.1", "Khởi tạo database với 1 tài khoản Admin có sẵn (admin / 123456)", "0.25đ", "src/database/database.ts", "Dán ảnh Mã nguồn initDatabase hoặc thông tin đăng nhập admin/123456"),
        ("item", "B.2", "Đăng nhập Admin (Header hiển thị admin, Đăng xuất, điều hướng đến trang chủ quản trị)", "0.50đ", "src/screens/LoginSqlite.tsx\nsrc/components/Header.tsx", "Dán ảnh Đăng nhập Admin thành công chuyển vào trang Quản trị"),
        ("item", "B.3", "Trang chủ quản trị: gồm các nút Quản lý user, Loại sản phẩm, Quản lý sản phẩm", "0.25đ", "src/app/AdminHomeScreen.tsx", "Dán ảnh Dashboard Admin có các thẻ: Quản lý User, Loại SP, Sản phẩm"),
        ("item", "B.4", "Admin Bottom Tab gồm: Home của user, Home của admin, Signup, Login", "0.50đ", "src/navigation/AppTabs.tsx", "Dán ảnh Thanh Bottom Tab Admin gồm 4 tab (Home User, Home Admin, Signup, Login)"),
        ("item", "B.5", "Quản trị user: xem danh sách, cập nhật vai trò (admin/user), xóa user", "0.50đ", "src/app/UserScreen.tsx", "Dán ảnh Màn hình danh sách User, Modal sửa vai trò & nút Xóa"),
        ("item", "B.6", "Quản trị loại sản phẩm: xem, thêm, sửa, xóa (0.5đ) + thêm sản phẩm cho loại tương ứng (0.5đ)", "1.00đ", "src/app/CategoryScreen.tsx", "Dán ảnh Màn hình Quản lý loại SP: CRUD loại và nút [+ Thêm SP] theo loại"),
        ("item", "B.7", "Quản trị sản phẩm: xem danh sách, thêm mới, sửa, xóa sản phẩm", "1.00đ", "src/screens/ProductManagementScreen.tsx", "Dán ảnh Màn hình Quản lý sản phẩm: danh sách SP, Modal thêm/sửa, xác nhận xóa"),
        
        # PHAN C
        ("group", "C", "CHỨC NĂNG KHÁC (GIỎ HÀNG & ĐẶT HÀNG - ĐÃ BỎ MỤC KHÓ)", "1.0đ"),
        ("item", "C.1", "Xem và cập nhật giỏ hàng: xem danh sách, tăng/giảm (+/-) số lượng, xóa món", "0.50đ", "src/screens/CartScreen.tsx\nsrc/cart/cartStorage.ts", "Dán ảnh Màn hình Giỏ hàng: danh sách món hàng, nút [+] [-], số lượng và tổng tiền"),
        ("item", "C.2", "Checkout đơn hàng và Đặt hàng: xác nhận đặt hàng, lưu database, xóa giỏ hàng", "0.50đ", "src/screens/CartScreen.tsx\nsrc/database/database.ts", "Dán ảnh Alert 'Xác nhận đặt hàng' và thông báo '🎉 Đặt hàng thành công!'"),
    ]
    
    # Calculate row count
    table = doc.add_table(rows=len(data) + 2, cols=5) # +1 header, +1 summary
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False
    set_table_borders(table, color="CBD5E1", sz="6")
    
    # Format Header Row
    hdr_cells = table.rows[0].cells
    for i, title in enumerate(headers):
        hdr_cells[i].width = col_widths[i]
        set_cell_background(hdr_cells[i], "1E40AF") # Deep Indigo Blue
        set_cell_margins(hdr_cells[i], top=120, bottom=120, left=100, right=100)
        p = hdr_cells[i].paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.space_before = Pt(2)
        p.paragraph_format.space_after = Pt(2)
        run = p.add_run(title)
        run.font.name = "Arial"
        run.font.size = Pt(9.5)
        run.font.bold = True
        run.font.color.rgb = RGBColor(255, 255, 255)
        
    current_row = 1
    for entry in data:
        row_cells = table.rows[current_row].cells
        for i in range(5):
            row_cells[i].width = col_widths[i]
            
        if entry[0] == "group":
            _, group_id, group_name, group_score = entry
            # Merge 5 cells
            a = row_cells[0]
            for i in range(1, 5):
                a.merge(row_cells[i])
            set_cell_background(a, "E0F2FE") # Soft sky blue
            set_cell_margins(a, top=100, bottom=100, left=140, right=140)
            p = a.paragraphs[0]
            p.paragraph_format.space_before = Pt(4)
            p.paragraph_format.space_after = Pt(4)
            r = p.add_run(f"PHẦN {group_id}: {group_name} — TỔNG: {group_score}")
            r.font.name = "Arial"
            r.font.size = Pt(10)
            r.font.bold = True
            r.font.color.rgb = RGBColor(3, 105, 161)
        else:
            _, stt, name, score, files, photo_hint = entry
            set_cell_margins(row_cells[0], top=80, bottom=80, left=80, right=80)
            set_cell_margins(row_cells[1], top=80, bottom=80, left=100, right=100)
            set_cell_margins(row_cells[2], top=80, bottom=80, left=80, right=80)
            set_cell_margins(row_cells[3], top=80, bottom=80, left=100, right=100)
            set_cell_margins(row_cells[4], top=80, bottom=80, left=100, right=100)
            
            # STT
            p0 = row_cells[0].paragraphs[0]
            p0.alignment = WD_ALIGN_PARAGRAPH.CENTER
            p0.paragraph_format.space_before = Pt(2)
            p0.paragraph_format.space_after = Pt(2)
            r0 = p0.add_run(stt)
            r0.font.name = "Arial"
            r0.font.bold = True
            r0.font.size = Pt(9)
            r0.font.color.rgb = RGBColor(30, 41, 59)
            
            # Chức năng
            p1 = row_cells[1].paragraphs[0]
            p1.paragraph_format.space_before = Pt(2)
            p1.paragraph_format.space_after = Pt(2)
            r1 = p1.add_run(name)
            r1.font.name = "Calibri"
            r1.font.size = Pt(9.5)
            r1.font.color.rgb = RGBColor(17, 24, 39)
            
            # Điểm
            p2 = row_cells[2].paragraphs[0]
            p2.alignment = WD_ALIGN_PARAGRAPH.CENTER
            p2.paragraph_format.space_before = Pt(2)
            p2.paragraph_format.space_after = Pt(2)
            r2 = p2.add_run(score)
            r2.font.name = "Arial"
            r2.font.bold = True
            r2.font.size = Pt(9.5)
            r2.font.color.rgb = RGBColor(22, 101, 52) # Dark green
            
            # Tệp tin mã nguồn
            p3 = row_cells[3].paragraphs[0]
            p3.paragraph_format.space_before = Pt(2)
            p3.paragraph_format.space_after = Pt(2)
            r3 = p3.add_run(files)
            r3.font.name = "Consolas"
            r3.font.size = Pt(8)
            r3.font.color.rgb = RGBColor(71, 85, 105)
            
            # Khung dán ảnh minh chứng
            set_cell_background(row_cells[4], "F8FAFC")
            p4 = row_cells[4].paragraphs[0]
            p4.alignment = WD_ALIGN_PARAGRAPH.CENTER
            p4.paragraph_format.space_before = Pt(4)
            p4.paragraph_format.space_after = Pt(4)
            
            r4_icon = p4.add_run("📷 ")
            r4_icon.font.size = Pt(11)
            
            r4 = p4.add_run(f"[{photo_hint}]\n")
            r4.font.name = "Calibri"
            r4.font.size = Pt(8.5)
            r4.font.bold = True
            r4.font.color.rgb = RGBColor(75, 85, 99)
            
            r4_hint = p4.add_run("(Nhấp vào đây rồi nhấn Ctrl+V để dán ảnh)")
            r4_hint.font.name = "Calibri"
            r4_hint.font.size = Pt(8)
            r4_hint.font.italic = True
            r4_hint.font.color.rgb = RGBColor(156, 163, 175)
            
        current_row += 1
        
    # Summary Row
    sum_cells = table.rows[current_row].cells
    for i in range(5):
        sum_cells[i].width = col_widths[i]
    sum_a = sum_cells[0]
    sum_a.merge(sum_cells[1])
    set_cell_background(sum_a, "FEF3C7") # Warm yellow
    set_cell_margins(sum_a, top=120, bottom=120, left=140, right=140)
    p_sum = sum_a.paragraphs[0]
    p_sum.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    r_sum = p_sum.add_run("TỔNG ĐIỂM DỰ KIẾN THEO PHIẾU CHẤM:")
    r_sum.font.name = "Arial"
    r_sum.font.size = Pt(10.5)
    r_sum.font.bold = True
    r_sum.font.color.rgb = RGBColor(146, 64, 14)
    
    # Score
    set_cell_background(sum_cells[2], "FEF3C7")
    set_cell_margins(sum_cells[2], top=120, bottom=120, left=80, right=80)
    p_sc = sum_cells[2].paragraphs[0]
    p_sc.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_sc = p_sc.add_run("9.0 / 10.0 đ")
    r_sc.font.name = "Arial"
    r_sc.font.size = Pt(11)
    r_sc.font.bold = True
    r_sc.font.color.rgb = RGBColor(180, 83, 9)
    
    # Merge remaining cells in summary
    sum_rem = sum_cells[3]
    sum_rem.merge(sum_cells[4])
    set_cell_background(sum_rem, "FEF3C7")
    set_cell_margins(sum_rem, top=120, bottom=120, left=100, right=100)
    p_note = sum_rem.paragraphs[0]
    r_note = p_note.add_run("Đã lược bỏ các mục nâng cao: Quản trị đơn hàng Admin (-0.5đ), Xem lịch sử đơn hàng (-0.25đ), Cập nhật thông tin User (-0.25đ).")
    r_note.font.name = "Calibri"
    r_note.font.size = Pt(8.5)
    r_note.font.italic = True
    r_note.font.color.rgb = RGBColor(120, 53, 15)
    
    # Save
    out_path = os.path.join(
        PROJECT_ROOT, "docs", "reports", "PHIEU_CHAM_DIEM_9_DIEM.docx"
    )
    doc.save(out_path)
    print(f"Phiếu chấm điểm 9.0 đã tạo thành công tại: {out_path}")

if __name__ == "__main__":
    create_phieu_cham_doc()

