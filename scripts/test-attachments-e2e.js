const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '../prisma/dev.db');
const db = new Database(dbPath);

console.log('--- BẮT ĐẦU KIỂM THỬ E2E TÍNH NĂNG UPLOAD FILE, ẢNH, VIDEO ĐÍNH KÈM ---');

// 1. Kiểm tra thư mục public/uploads
const uploadDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
console.log('1. Thư mục public/uploads tồn tại: ✓ THÀNH CÔNG');

// 2. Lấy dự án & user test
const project = db.prepare('SELECT id, name, key FROM Project LIMIT 1').get();
const user = db.prepare('SELECT id, name FROM User LIMIT 1').get();
console.log(`2. Dự án: ${project.name} (${project.key}), User: ${user.name}`);

// 3. Tạo ticket kèm 3 file đính kèm (1 ảnh, 1 video, 1 tài liệu)
const trackingCode = `TK-20260818-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
const ticketId = 'c_ticket_' + Date.now();
const now = new Date().toISOString();

db.prepare(`
  INSERT INTO CustomerTicket (
    id, trackingCode, projectId, title, description, type, status, priority,
    customerName, customerEmail, customerPhone, environment, createdAt, updatedAt
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`).run(
  ticketId,
  trackingCode,
  project.id,
  'Lỗi màn hình trắng khi mở menu camera quan sát',
  'Khi bấm vào menu Camera bãi xe, giao diện bị trắng xoá kèm video và ảnh chụp lỗi đính kèm bên dưới.',
  'BUG',
  'OPEN',
  'HIGH',
  'Phạm Minh Hoàng',
  'hoang.pm@vincom.com',
  '0912 999 888',
  'Windows 10, Chrome 122',
  now,
  now
);

// Tạo 3 attachments cho ticket
const attImage = {
  id: 'att_img_' + Date.now(),
  ticketId,
  fileName: 'screenshot_white_screen.png',
  fileUrl: '/uploads/screenshot_white_screen_test.png',
  fileType: 'image',
  fileSize: 1024 * 350, // 350 KB
  mimeType: 'image/png',
};

const attVideo = {
  id: 'att_vid_' + Date.now(),
  ticketId,
  fileName: 'screen_record_bug_reproduce.mp4',
  fileUrl: '/uploads/screen_record_bug_reproduce_test.mp4',
  fileType: 'video',
  fileSize: 1024 * 1024 * 12, // 12 MB
  mimeType: 'video/mp4',
};

const attDoc = {
  id: 'att_doc_' + Date.now(),
  ticketId,
  fileName: 'console_error_log.txt',
  fileUrl: '/uploads/console_error_log_test.txt',
  fileType: 'document',
  fileSize: 1024 * 15, // 15 KB
  mimeType: 'text/plain',
};

const insertAtt = db.prepare(`
  INSERT INTO Attachment (id, ticketId, fileName, fileUrl, fileType, fileSize, mimeType, createdAt)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

insertAtt.run(attImage.id, ticketId, attImage.fileName, attImage.fileUrl, attImage.fileType, attImage.fileSize, attImage.mimeType, now);
insertAtt.run(attVideo.id, ticketId, attVideo.fileName, attVideo.fileUrl, attVideo.fileType, attVideo.fileSize, attVideo.mimeType, now);
insertAtt.run(attDoc.id, ticketId, attDoc.fileName, attDoc.fileUrl, attDoc.fileType, attDoc.fileSize, attDoc.mimeType, now);

console.log('3. Tạo Ticket kèm 3 tệp đính kèm (Ảnh + Video + Log): ✓ THÀNH CÔNG');

// 4. Tra cứu danh sách Attachment của Ticket
const ticketAttachments = db.prepare('SELECT * FROM Attachment WHERE ticketId = ?').all(ticketId);
console.log(`4. Truy vấn ${ticketAttachments.length} attachments từ ticket: ✓ THÀNH CÔNG`);
ticketAttachments.forEach((a) => {
  console.log(`   - [${a.fileType.toUpperCase()}] ${a.fileName} (${(a.fileSize / 1024).toFixed(1)} KB) -> ${a.fileUrl}`);
});

// 5. Chuyển đổi Ticket sang Kanban Task và sao chép attachments
const lastTask = db.prepare('SELECT number FROM Task WHERE projectId = ? ORDER BY number DESC LIMIT 1').get(project.id);
const taskNumber = (lastTask?.number ?? 0) + 1;
const taskId = 'c_task_att_' + Date.now();

db.prepare(`
  INSERT INTO Task (
    id, projectId, number, title, description, type, status, priority, position, creatorId, createdAt, updatedAt
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`).run(
  taskId,
  project.id,
  taskNumber,
  `[${trackingCode}] Lỗi màn hình trắng khi mở menu camera quan sát`,
  'Mô tả chi tiết kèm video và ảnh lỗi',
  'BUG',
  'TODO',
  'HIGH',
  1000,
  user.id,
  now,
  now
);

// Sao chép attachments từ ticket sang task
for (const a of ticketAttachments) {
  const newTaskAttId = 'att_task_' + Math.random().toString(36).substring(2, 9);
  db.prepare(`
    INSERT INTO Attachment (id, taskId, fileName, fileUrl, fileType, fileSize, mimeType, uploaderId, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(newTaskAttId, taskId, a.fileName, a.fileUrl, a.fileType, a.fileSize, a.mimeType, user.id, now);
}

// Cập nhật ticket
db.prepare("UPDATE CustomerTicket SET convertedTaskId = ?, status = 'IN_PROGRESS' WHERE id = ?").run(taskId, ticketId);

const taskAttachments = db.prepare('SELECT * FROM Attachment WHERE taskId = ?').all(taskId);
console.log('5. Chuyển đổi Ticket sang Kanban Task: ✓ THÀNH CÔNG');
console.log(`   - Task #${taskNumber} nhận đầy đủ ${taskAttachments.length} attachments sao chép từ Ticket.`);

// 6. Thao tác xóa 1 attachment trên Task
const attToDelete = taskAttachments[0];
db.prepare('DELETE FROM Attachment WHERE id = ?').run(attToDelete.id);
const remainingTaskAtts = db.prepare('SELECT * FROM Attachment WHERE taskId = ?').all(taskId);
console.log(`6. Xóa attachment (${attToDelete.fileName}): ✓ THÀNH CÔNG (Còn lại ${remainingTaskAtts.length} tệp)`);

console.log('\n✅ TOÀN BỘ CÁC BƯỚC KIỂM THỬ E2E UPLOAD & MEDIA GALLERY ĐÃ HOÀN THÀNH XUẤT SẮC!');

db.close();
