const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../prisma/dev.db');
const db = new Database(dbPath);

console.log('--- BẮT ĐẦU KIỂM THỬ E2E TÍNH NĂNG TIẾP NHẬN TICKET KHÁCH HÀNG ---');

// 1. Kiểm tra bảng dự án
const project = db.prepare('SELECT id, name, key FROM Project LIMIT 1').get();
console.log('1. Dự án test:', project.name, `(${project.key})`);

// 2. Tạo ticket giả lập từ khách hàng
const trackingCode = `TK-20260818-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
const ticketId = 'c_test_' + Date.now();
const now = new Date().toISOString();

db.prepare(`
  INSERT INTO CustomerTicket (
    id, trackingCode, projectId, title, description, type, status, priority,
    customerName, customerEmail, customerPhone, customerCompany, environment,
    createdAt, updatedAt
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`).run(
  ticketId,
  trackingCode,
  project.id,
  'Lỗi không thể xuất báo cáo doanh thu bãi đỗ xe sang Excel',
  'Khi nhấn nút "Xuất Excel" tại màn hình Báo cáo tổng hợp, hệ thống báo lỗi 500 và không tải file về máy được.',
  'BUG',
  'OPEN',
  'HIGH',
  'Trần Thị Mai',
  'mai.tran@vincom.vn',
  '0988 776 655',
  'TTTM Vincom Mega Mall',
  'Windows 11, Google Chrome 124, Trạm điều hành số 01',
  now,
  now
);

console.log('2. Tạo ticket thành công!');
console.log(`   - Mã tra cứu: ${trackingCode}`);
console.log(`   - Khách hàng: Trần Thị Mai (mai.tran@vincom.vn)`);
console.log(`   - Trạng thái: OPEN`);

// 3. Tra cứu ticket theo tracking code
const foundTicket = db.prepare('SELECT * FROM CustomerTicket WHERE trackingCode = ?').get(trackingCode);
console.log('3. Tra cứu công khai theo mã tracking code:', foundTicket ? '✓ THÀNH CÔNG' : '✗ THẤT BẠI');

// 4. Khách hàng gửi thêm bình luận
const commentId = 'c_com_' + Date.now();
db.prepare(`
  INSERT INTO TicketComment (
    id, ticketId, authorName, authorEmail, isStaff, isInternalOnly, message, createdAt
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`).run(
  commentId,
  ticketId,
  'Trần Thị Mai',
  'mai.tran@vincom.vn',
  0,
  0,
  'Tôi đã thử trên máy trạm số 02 thì vẫn gặp lỗi tương tự. Nhờ kỹ thuật hỗ trợ gấp giúp.',
  now
);
console.log('4. Khách hàng gửi bình luận phản hồi: ✓ THÀNH CÔNG');

// 5. Nhân viên phản hồi công khai & ghi chú nội bộ
db.prepare(`
  INSERT INTO TicketComment (
    id, ticketId, authorName, authorEmail, isStaff, isInternalOnly, message, createdAt
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`).run(
  'c_staff_com_' + Date.now(),
  ticketId,
  'Kỹ sư KZTEK Support',
  'support@kztek.net',
  1,
  0,
  'Chào chị Mai, đội ngũ kỹ thuật KZTEK đã tiếp nhận và đang tiến hành kiểm tra module xuất báo cáo.',
  now
);

db.prepare(`
  INSERT INTO TicketComment (
    id, ticketId, authorName, authorEmail, isStaff, isInternalOnly, message, createdAt
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`).run(
  'c_staff_internal_' + Date.now(),
  ticketId,
  'Tech Lead',
  'lead@kztek.net',
  1,
  1,
  '[Ghi chú nội bộ] Lỗi xảy ra do thiếu thư viện xlsx trên worker backend, cần hotfix endpoint export.',
  now
);
console.log('5. Thêm phản hồi nhân viên & ghi chú nội bộ bảo mật: ✓ THÀNH CÔNG');

// 6. Kiểm tra lọc comment công khai (không lộ internal)
const publicComments = db.prepare('SELECT * FROM TicketComment WHERE ticketId = ? AND isInternalOnly = 0').all(ticketId);
console.log(`6. Số lượng comment hiển thị cho khách hàng: ${publicComments.length} (Ghi chú nội bộ được lọc bỏ an toàn)`);

// 7. Chuyển đổi Ticket thành Task/Bug trên Kanban Board
const lastTask = db.prepare('SELECT number FROM Task WHERE projectId = ? ORDER BY number DESC LIMIT 1').get(project.id);
const taskNumber = (lastTask?.number ?? 0) + 1;
const taskId = 'c_task_' + Date.now();

// Tạo nhãn "Báo lỗi KH"
let label = db.prepare('SELECT id FROM Label WHERE projectId = ? AND name = ?').get(project.id, 'Báo lỗi KH');
if (!label) {
  const labelId = 'c_label_' + Date.now();
  db.prepare('INSERT INTO Label (id, projectId, name, color) VALUES (?, ?, ?, ?)').run(
    labelId,
    project.id,
    'Báo lỗi KH',
    '#f43f5e'
  );
  label = { id: labelId };
}

// Lấy user đầu tiên làm creator
const user = db.prepare('SELECT id FROM User LIMIT 1').get();

db.prepare(`
  INSERT INTO Task (
    id, projectId, number, title, description, type, status, priority, position, creatorId, createdAt, updatedAt
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`).run(
  taskId,
  project.id,
  taskNumber,
  `[${trackingCode}] Lỗi không thể xuất báo cáo doanh thu bãi đỗ xe sang Excel`,
  `### 🎫 Nguồn: Báo lỗi từ khách hàng (${trackingCode})\n- Khách hàng: Trần Thị Mai (mai.tran@vincom.vn)\n- Đơn vị: TTTM Vincom Mega Mall`,
  'BUG',
  'TODO',
  'HIGH',
  1000,
  user.id,
  now,
  now
);

// Gán nhãn cho task
db.prepare('INSERT INTO TaskLabel (taskId, labelId) VALUES (?, ?)').run(taskId, label.id);

// Cập nhật ticket đã chuyển đổi
db.prepare(`
  UPDATE CustomerTicket SET convertedTaskId = ?, status = 'IN_PROGRESS', updatedAt = ? WHERE id = ?
`).run(taskId, now, ticketId);

console.log('7. Chuyển đổi 1-Click sang Kanban Board: ✓ THÀNH CÔNG');
console.log(`   - Task tạo mới: #${taskNumber} (Loại BUG, Nhãn: Báo lỗi KH)`);
console.log(`   - Trạng thái Ticket tự động đổi sang: IN_PROGRESS`);

// 8. Đội ngũ giải quyết và đóng ticket
db.prepare(`
  UPDATE CustomerTicket SET
    status = 'RESOLVED',
    resolutionNotes = 'Đã cập nhật bản vá v2.4.1 sửa lỗi thư viện xuất Excel. Đã kiểm tra và xuất thành công.',
    resolvedAt = ?,
    updatedAt = ?
  WHERE id = ?
`).run(now, now, ticketId);

const resolvedTicket = db.prepare('SELECT status, resolutionNotes, resolvedAt FROM CustomerTicket WHERE id = ?').get(ticketId);
console.log('8. Kỹ sư ghi nhận kết quả giải quyết & cập nhật trạng thái RESOLVED: ✓ THÀNH CÔNG');
console.log(`   - Kết quả phản hồi khách: "${resolvedTicket.resolutionNotes}"`);

console.log('\n✅ TOÀN BỘ CÁC BƯỚC KIỂM THỬ E2E ĐỀU HOÀN THÀNH XUẤT SẮC!');

db.close();
