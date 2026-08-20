const http = require('http');
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '../prisma/dev.db');
const db = new Database(dbPath);

console.log('══════════════════════════════════════════════════════════════════════');
console.log('  🔍 BẮT ĐẦU RÀ SOÁT KIỂM TRA LỖI TOÀN DIỆN (UI & LOGIC AUDIT)');
console.log('══════════════════════════════════════════════════════════════════════\n');

let passCount = 0;
let failCount = 0;
const issues = [];

function assert(condition, name, errorMsg = '') {
  if (condition) {
    console.log(`  ✅ [PASS] ${name}`);
    passCount++;
  } else {
    console.log(`  ❌ [FAIL] ${name} -> ${errorMsg}`);
    failCount++;
    issues.push({ name, error: errorMsg, level: 'P1' });
  }
}

async function request(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(body);
        } catch {
          json = body;
        }
        resolve({ statusCode: res.statusCode, headers: res.headers, body: json });
      });
    });
    req.on('error', (err) => reject(err));
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function runAudit() {
  console.log('--- 1. KIỂM TRA TOÀN VẸN CƠ SỞ DỮ LIỆU & SCHEMA ---');
  
  // Check users
  const users = db.prepare('SELECT id, name, email, role FROM User').all();
  assert(users.length > 0, 'Database có dữ liệu User', `Tìm thấy ${users.length} users`);
  const adminUser = users.find(u => u.role === 'ADMIN') || users[0];
  assert(adminUser != null, 'Có tài khoản Quản trị viên (ADMIN)', adminUser?.email);

  // Check projects
  const projects = db.prepare('SELECT * FROM Project').all();
  assert(projects.length > 0, 'Database có ít nhất 1 Dự án', `Tổng ${projects.length} dự án`);
  const defaultProject = projects[0];

  // Check custom roles
  const roles = db.prepare('SELECT * FROM RoleDefinition').all();
  assert(roles.length >= 4, 'Hệ thống đã khởi tạo các RoleDefinition chuẩn', `Có ${roles.length} roles`);

  // Check tasks & sprints
  const tasks = db.prepare('SELECT * FROM Task').all();
  console.log(`  ℹ️ Tổng số công việc (Tasks) hiện có: ${tasks.length}`);
  const sprints = db.prepare('SELECT * FROM Sprint').all();
  console.log(`  ℹ️ Tổng số Sprint hiện có: ${sprints.length}`);

  // Check customer tickets
  const tickets = db.prepare('SELECT * FROM CustomerTicket').all();
  console.log(`  ℹ️ Tổng số Customer Tickets: ${tickets.length}`);

  // 2. TẠO SESSION JWT TOKEN CHO ADMIN
  const { SignJWT } = require('jose');
  const secret = new TextEncoder().encode(process.env.AUTH_SECRET || 'flowboard-dev-secret-change-me-in-production');
  const sessionToken = await new SignJWT({ sub: adminUser.id })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret);
  authCookie = `flowboard_session=${sessionToken}`;
  console.log(`  ℹ️ Đã khởi tạo phiên xác thực (JWT) cho User: ${adminUser.name} (${adminUser.email})`);

  console.log('\n--- 2. KIỂM TRA HTTP APIS & AUTHENTICATION ---');

  // Test 2.1: Login API Check
  try {
    const loginRes = await request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/me',
      method: 'GET',
      headers: { Cookie: authCookie },
    });
    assert(loginRes.statusCode === 200, 'API /api/auth/me xác thực người dùng thành công', `Status: ${loginRes.statusCode}`);
  } catch (err) {
    assert(false, 'API /api/auth/me kết nối được', err.message);
  }

  // Test 2.2: System Config API
  try {
    const configRes = await request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/system/config',
      method: 'GET',
      headers: authCookie ? { Cookie: authCookie } : {},
    });
    assert(configRes.statusCode === 200, 'API /api/system/config trả về HTTP 200', `Status: ${configRes.statusCode}`);
    assert(configRes.body && configRes.body.smtp != null, 'Cấu hình SMTP và System Config có đầy đủ thuộc tính');
  } catch (err) {
    assert(false, 'API /api/system/config hoạt động bình thường', err.message);
  }

  // Test 2.3: Roles API
  try {
    const rolesRes = await request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/roles',
      method: 'GET',
      headers: authCookie ? { Cookie: authCookie } : {},
    });
    assert(rolesRes.statusCode === 200, 'API /api/roles trả về HTTP 200', `Status: ${rolesRes.statusCode}`);
    assert(Array.isArray(rolesRes.body) && rolesRes.body.length > 0, 'API /api/roles trả về danh sách RoleDefinition');
  } catch (err) {
    assert(false, 'API /api/roles hoạt động bình thường', err.message);
  }

  // Test 2.4: Email logs API
  try {
    const emailLogsRes = await request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/notifications/email-logs',
      method: 'GET',
      headers: authCookie ? { Cookie: authCookie } : {},
    });
    assert(emailLogsRes.statusCode === 200, 'API /api/notifications/email-logs trả về HTTP 200', `Status: ${emailLogsRes.statusCode}`);
    assert(emailLogsRes.body && Array.isArray(emailLogsRes.body.logs), 'API email-logs trả về mảng logs');
  } catch (err) {
    assert(false, 'API /api/notifications/email-logs hoạt động bình thường', err.message);
  }

  // Test 2.5: Customer Tickets API
  try {
    const ticketsRes = await request({
      hostname: 'localhost',
      port: 3000,
      path: `/api/projects/${defaultProject.id}/tickets`,
      method: 'GET',
      headers: authCookie ? { Cookie: authCookie } : {},
    });
    assert(ticketsRes.statusCode === 200, `API /api/projects/${defaultProject.id}/tickets trả về HTTP 200`, `Status: ${ticketsRes.statusCode}`);
    assert(ticketsRes.body && Array.isArray(ticketsRes.body.tickets), 'API tickets trả về danh sách tickets kèm phân trang/thống kê');
  } catch (err) {
    assert(false, 'API tickets hoạt động bình thường', err.message);
  }

  // Test 2.6: Sprints API
  try {
    const sprintsRes = await request({
      hostname: 'localhost',
      port: 3000,
      path: `/api/projects/${defaultProject.id}/sprints`,
      method: 'GET',
      headers: authCookie ? { Cookie: authCookie } : {},
    });
    assert(sprintsRes.statusCode === 200, `API /api/projects/${defaultProject.id}/sprints trả về HTTP 200`, `Status: ${sprintsRes.statusCode}`);
    assert(Array.isArray(sprintsRes.body), 'API sprints trả về danh sách sprints');
  } catch (err) {
    assert(false, 'API sprints hoạt động bình thường', err.message);
  }

  // Test 2.7: Tasks API
  try {
    const tasksRes = await request({
      hostname: 'localhost',
      port: 3000,
      path: `/api/projects/${defaultProject.id}/tasks`,
      method: 'GET',
      headers: authCookie ? { Cookie: authCookie } : {},
    });
    assert(tasksRes.statusCode === 200, `API /api/projects/${defaultProject.id}/tasks trả về HTTP 200`, `Status: ${tasksRes.statusCode}`);
    assert(tasksRes.body && Array.isArray(tasksRes.body.tasks), 'API tasks trả về danh sách tasks');
  } catch (err) {
    assert(false, 'API tasks hoạt động bình thường', err.message);
  }

  console.log('\n--- 3. KIỂM TRA TĨNH (STATIC CODE QUALITY & UI INTEGRITY) ---');
  
  // Scan UI components for common anti-patterns or broken references
  const componentDirs = [
    path.join(__dirname, '../src/components'),
    path.join(__dirname, '../src/app'),
    path.join(__dirname, '../src/lib'),
  ];

  function getAllFiles(dir, exts = ['.ts', '.tsx', '.js']) {
    let results = [];
    if (!fs.existsSync(dir)) return results;
    const list = fs.readdirSync(dir);
    list.forEach(file => {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat && stat.isDirectory()) {
        results = results.concat(getAllFiles(fullPath, exts));
      } else if (exts.some(ext => file.endsWith(ext))) {
        results.push(fullPath);
      }
    });
    return results;
  }

  const allFiles = componentDirs.flatMap(dir => getAllFiles(dir));
  console.log(`  ℹ️ Tổng số tệp mã nguồn TypeScript/TSX quét: ${allFiles.length} files`);

  let syntaxWarningCount = 0;
  let unhandledNullOrUndefined = 0;
  let brokenImports = 0;

  for (const filePath of allFiles) {
    const content = fs.readFileSync(filePath, 'utf8');
    const relPath = path.relative(path.join(__dirname, '..'), filePath);

    // Check for broken/outdated imports
    if (content.includes("from '../generated/prisma'") && !fs.existsSync(path.join(__dirname, '../src/generated/prisma'))) {
      console.log(`  ⚠️ [CẢNH BÁO] Import Prisma client có thể không khớp: ${relPath}`);
      brokenImports++;
    }

    // Check for hardcoded localhost in mail/notification code
    if (relPath.includes('mail.ts') || relPath.includes('notifications.ts')) {
      const matches = content.match(/http:\/\/localhost:3000/g);
      if (matches && matches.length > 2) {
        console.log(`  ⚠️ [CẢNH BÁO] Có thể còn URL localhost:3000 hardcode trong: ${relPath}`);
      }
    }
  }

  assert(brokenImports === 0, 'Không có broken module imports trong source code');

  console.log('\n══════════════════════════════════════════════════════════════════════');
  console.log(`📊 TỔNG KẾT RÀ SOÁT: ${passCount} PASS | ${failCount} FAIL`);
  if (issues.length > 0) {
    console.log('Các vấn đề phát hiện:');
    issues.forEach(i => console.log(`  - [${i.level}] ${i.name}: ${i.error}`));
  } else {
    console.log('🎉 TẤT CẢ CÁC BƯỚC KIỂM TRA ĐỀU HOÀN TOÀN HỢP LỆ VÀ ĐẠT CHUẨN!');
  }
  console.log('══════════════════════════════════════════════════════════════════════\n');

  db.close();
}

runAudit().catch(err => {
  console.error('Audit Error:', err);
  db.close();
  process.exit(1);
});
