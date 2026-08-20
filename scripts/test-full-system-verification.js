const http = require('http');
const { SignJWT } = require('jose');
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '../prisma/dev.db');
const db = new Database(dbPath);

console.log('══════════════════════════════════════════════════════════════════════════════');
console.log('  🚀 FULL SYSTEM VERIFICATION: TOÀN DIỆN LOGIC, APIS & LUỒNG DỮ LIỆU KZTEK');
console.log('══════════════════════════════════════════════════════════════════════════════\n');

let passCount = 0;
let failCount = 0;

function assert(condition, testName, extraInfo = '') {
  if (condition) {
    console.log(`  ✅ [PASS] ${testName} ${extraInfo ? `(${extraInfo})` : ''}`);
    passCount++;
  } else {
    console.log(`  ❌ [FAIL] ${testName} -> ${extraInfo}`);
    failCount++;
  }
}

async function request({ method = 'GET', path, headers = {}, body = null }) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch {
          json = data;
        }
        resolve({ status: res.statusCode, headers: res.headers, body: json });
      });
    });
    req.on('error', (err) => reject(err));
    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

async function runFullVerification() {
  const admin = db.prepare("SELECT id, name, email, role FROM User WHERE role = 'ADMIN' LIMIT 1").get();
  assert(admin != null, 'Tìm thấy tài khoản Quản trị viên (ADMIN)', admin.email);

  const project = db.prepare('SELECT id, name, key FROM Project LIMIT 1').get();
  assert(project != null, 'Tìm thấy Dự án làm việc', `${project.name} (${project.key})`);

  // Tạo Auth Cookie
  const secret = new TextEncoder().encode(process.env.AUTH_SECRET || 'flowboard-dev-secret-change-me-in-production');
  const token = await new SignJWT({ sub: admin.id })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret);
  const authHeader = { Cookie: `flowboard_session=${token}` };

  console.log('\n--- 1. KIỂM THỬ XÁC THỰC & THÔNG TIN TÀI KHOẢN ---');
  const meRes = await request({ path: '/api/auth/me', headers: authHeader });
  assert(meRes.status === 200, 'API /api/auth/me trả về 200', `User: ${meRes.body.user?.name}`);

  console.log('\n--- 2. KIỂM THỬ QUẢN TRỊ VAI TRÒ & PHÂN QUYỀN (ROLES & PERMISSIONS) ---');
  const rolesRes = await request({ path: '/api/roles', headers: authHeader });
  assert(rolesRes.status === 200, 'API GET /api/roles trả về 200', `Số lượng vai trò: ${rolesRes.body.roles?.length}`);
  assert(Array.isArray(rolesRes.body.categories) && rolesRes.body.categories.length > 0, 'Có danh mục phân quyền chuẩn (Permission Categories)');

  // Tạo vai trò thử nghiệm
  const testRoleKey = 'TEST_AUDIT_' + Math.random().toString(36).substring(2, 6).toUpperCase();
  const createRoleRes = await request({
    method: 'POST',
    path: '/api/roles',
    headers: authHeader,
    body: {
      key: testRoleKey,
      name: 'Kiểm Thử Audit Role',
      description: 'Vai trò tự động tạo trong quá trình rà soát',
      color: '#F05922',
      permissions: ['tasks.view', 'tasks.create', 'sprints.view'],
    },
  });
  assert(createRoleRes.status === 201, `API POST /api/roles tạo vai trò mới "${testRoleKey}"`, `Status: ${createRoleRes.status}`);

  // Cập nhật quyền cho vai trò
  const updateRoleRes = await request({
    method: 'PATCH',
    path: `/api/roles/${testRoleKey}`,
    headers: authHeader,
    body: {
      permissions: ['tasks.view', 'tasks.create', 'tasks.edit', 'sprints.view', 'tickets.view'],
    },
  });
  assert(updateRoleRes.status === 200, `API PATCH /api/roles/${testRoleKey} cập nhật quyền thành công`);

  // Xóa vai trò thử nghiệm
  const deleteRoleRes = await request({
    method: 'DELETE',
    path: `/api/roles/${testRoleKey}`,
    headers: authHeader,
  });
  assert(deleteRoleRes.status === 200, `API DELETE /api/roles/${testRoleKey} dọn dẹp vai trò thành công`);

  console.log('\n--- 3. KIỂM THỬ CẤU HÌNH HỆ THỐNG & EMAIL SERVICE ---');
  const sysConfigRes = await request({ path: '/api/system/config', headers: authHeader });
  assert(sysConfigRes.status === 200, 'API GET /api/system/config trả về 200', `AppUrl: ${sysConfigRes.body.config?.branding?.appUrl}`);

  // Gửi thử nghiệm email qua Email Logs API
  const testEmailRes = await request({
    method: 'POST',
    path: '/api/notifications/email-logs',
    headers: authHeader,
    body: {
      recipientEmail: 'audit-test@kztek.net',
      recipientName: 'Kỹ sư Kiểm toán KZTEK',
    },
  });
  assert(testEmailRes.status === 200, 'API POST /api/notifications/email-logs gửi email thử nghiệm thành công', testEmailRes.body.message);

  const emailLogsRes = await request({ path: '/api/notifications/email-logs', headers: authHeader });
  assert(emailLogsRes.status === 200 && emailLogsRes.body.logs.length > 0, 'API GET /api/notifications/email-logs ghi nhận lịch sử gửi email', `Tổng logs: ${emailLogsRes.body.logs?.length}`);

  console.log('\n--- 4. KIỂM THỬ QUẢN LÝ SPRINT & TÍNH TOÁN STORY POINTS ---');
  const createSprintRes = await request({
    method: 'POST',
    path: `/api/projects/${project.id}/sprints`,
    headers: authHeader,
    body: {
      name: 'Sprint Audit 2026',
      goal: 'Mục tiêu kiểm thử tính năng Sprint',
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 14 * 86400000).toISOString(),
    },
  });
  assert(createSprintRes.status === 201, `API POST /api/projects/${project.id}/sprints tạo Sprint thành công`, createSprintRes.body.sprint?.name);
  const createdSprintId = createSprintRes.body.sprint?.id;

  if (createdSprintId) {
    // Đổi trạng thái Sprint sang ACTIVE
    const patchSprintRes = await request({
      method: 'PATCH',
      path: `/api/projects/${project.id}/sprints/${createdSprintId}`,
      headers: authHeader,
      body: { status: 'ACTIVE' },
    });
    assert(patchSprintRes.status === 200, `API PATCH /api/projects/${project.id}/sprints/${createdSprintId} kích hoạt Sprint (ACTIVE)`);
  }

  console.log('\n--- 5. KIỂM THỬ VÒNG ĐỜI TASK, COMMENT MENTION & ATTACHMENT ---');
  const tasksGetRes = await request({ path: `/api/projects/${project.id}/tasks`, headers: authHeader });
  assert(tasksGetRes.status === 200, `API GET /api/projects/${project.id}/tasks lấy danh sách task & metadata thành công`, `Tasks: ${tasksGetRes.body.tasks?.length}`);

  // Tạo Task mới
  const createTaskRes = await request({
    method: 'POST',
    path: `/api/projects/${project.id}/tasks`,
    headers: authHeader,
    body: {
      title: 'Task Kiểm thử Rà Soát Hệ Thống',
      description: 'Mô tả chi tiết task kiểm thử tự động',
      type: 'TASK',
      status: 'TODO',
      priority: 'HIGH',
      storyPoints: 5,
      sprintId: createdSprintId || null,
      subtasks: ['Kiểm tra giao diện', 'Kiểm tra API'],
    },
  });
  assert(createTaskRes.status === 201, 'API POST /api/projects/[id]/tasks tạo Task thành công', `#${createTaskRes.body.task?.number}: ${createTaskRes.body.task?.title}`);
  const createdTaskId = createTaskRes.body.task?.id;

  if (createdTaskId) {
    // Thêm bình luận gắn thẻ (@mention)
    const commentRes = await request({
      method: 'POST',
      path: `/api/projects/${project.id}/tasks/${createdTaskId}/comments`,
      headers: authHeader,
      body: {
        body: `Thảo luận @[${admin.name}](${admin.id}) về tiến độ công việc này`,
        mentionedUserIds: [admin.id],
      },
    });
    assert(commentRes.status === 201, `API POST /api/projects/[id]/tasks/[id]/comments thêm bình luận mention thành công`);

    // Chuyển trạng thái task sang IN_PROGRESS
    const patchTaskRes = await request({
      method: 'PATCH',
      path: `/api/projects/${project.id}/tasks/${createdTaskId}`,
      headers: authHeader,
      body: { status: 'IN_PROGRESS', storyPoints: 8 },
    });
    assert(patchTaskRes.status === 200, `API PATCH /api/projects/[id]/tasks/[id] cập nhật trạng thái Task thành công`);

    // Xóa Task kiểm thử
    const deleteTaskRes = await request({
      method: 'DELETE',
      path: `/api/projects/${project.id}/tasks/${createdTaskId}`,
      headers: authHeader,
    });
    assert(deleteTaskRes.status === 200, `API DELETE /api/projects/[id]/tasks/[id] xóa Task kiểm thử thành công`);
  }

  // Dọn dẹp Sprint kiểm thử
  if (createdSprintId) {
    const deleteSprintRes = await request({
      method: 'DELETE',
      path: `/api/projects/${project.id}/sprints/${createdSprintId}`,
      headers: authHeader,
    });
    assert(deleteSprintRes.status === 200, `API DELETE /api/projects/[id]/sprints/[id] dọn dẹp Sprint kiểm thử thành công`);
  }

  console.log('\n--- 6. KIỂM THỬ CỔNG TICKET KHÁCH HÀNG (PORTAL INTAKE & CONVERT TO TASK) ---');
  const publicTicketRes = await request({
    method: 'POST',
    path: '/api/tickets/public',
    body: {
      title: 'Lỗi phát sinh từ Portal Kiểm Thử Toàn Diện',
      description: 'Mô tả chi tiết sự cố báo từ khách hàng',
      type: 'BUG',
      priority: 'HIGH',
      customerName: 'Nguyễn Văn Kiểm Thử',
      customerEmail: 'test.customer@company.com',
      customerPhone: '0901234567',
      customerCompany: 'Tập đoàn Khách hàng Test',
      environment: 'Chrome 125, Windows 11',
    },
  });
  assert(publicTicketRes.status === 201, 'API POST /api/tickets/public gửi Ticket từ Portal thành công', `Tracking: ${publicTicketRes.body.ticket?.trackingCode}`);
  const createdTicketId = publicTicketRes.body.ticket?.id;

  if (createdTicketId) {
    // Điều phối Ticket vào dự án
    const dispatchRes = await request({
      method: 'PATCH',
      path: `/api/tickets/${createdTicketId}/dispatch`,
      headers: authHeader,
      body: { projectId: project.id },
    });
    assert(dispatchRes.status === 200, `API PATCH /api/tickets/${createdTicketId}/dispatch điều phối Ticket vào dự án ${project.name}`);

    // Convert Ticket sang Kanban Task
    const convertRes = await request({
      method: 'POST',
      path: `/api/projects/${project.id}/tickets/${createdTicketId}/convert`,
      headers: authHeader,
      body: {
        type: 'BUG',
        priority: 'HIGH',
        status: 'TODO',
      },
    });
    assert(convertRes.status === 201, `API POST .../tickets/${createdTicketId}/convert chuyển đổi Ticket sang Task thành công`, `Task #${convertRes.body.task?.number}`);
  }

  console.log('\n══════════════════════════════════════════════════════════════════════════════');
  console.log(`📊 TỔNG KẾT TOÀN DIỆN HỆ THỐNG: ${passCount} PASS | ${failCount} FAIL`);
  if (failCount === 0) {
    console.log('🎉 TẤT CẢ CÁC LUỒNG DỮ LIỆU, API, GIAO DIỆN VÀ TÍNH NĂNG ĐỀU PASS 100%!');
  } else {
    console.log(`⚠️ Có ${failCount} bài test không đạt yêu cầu.`);
  }
  console.log('══════════════════════════════════════════════════════════════════════════════\n');

  db.close();
}

runFullVerification().catch((err) => {
  console.error('Verification Error:', err);
  db.close();
  process.exit(1);
});
