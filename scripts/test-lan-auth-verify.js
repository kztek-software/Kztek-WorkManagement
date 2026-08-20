console.log('══════════════════════════════════════════════════════════════════════');
console.log('  🔍 KIỂM THỬ XÁC MINH: ĐĂNG NHẬP & SỬ DỤNG MÁY KHÁC TRÊN MẠNG LAN');
console.log('══════════════════════════════════════════════════════════════════════\n');

let passCount = 0;
let failCount = 0;

function assert(condition, name, detail = '') {
  if (condition) {
    console.log(`  ✅ [PASS] ${name} ${detail ? `(${detail})` : ''}`);
    passCount++;
  } else {
    console.log(`  ❌ [FAIL] ${name} -> ${detail}`);
    failCount++;
  }
}

async function runTest() {
  try {
    console.log('--- 1. GIẢ LẬP ĐĂNG NHẬP TỪ MÁY KHÁC (LAN IP HTTP) ---');
    const loginRes = await fetch('http://127.0.0.1:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Host': '192.168.1.100:3000', // Giả lập LAN IP
        'X-Forwarded-Proto': 'http',
      },
      body: JSON.stringify({ email: 'admin', password: 'admin' }),
    });

    const loginData = await loginRes.json();
    assert(loginRes.status === 200, 'API Login trả về HTTP 200', `Status: ${loginRes.status}`);
    assert(loginData?.token != null, 'API Login trả về JWT token', loginData?.token ? 'OK' : 'Thiếu token');

    const setCookie = loginRes.headers.get('set-cookie') || '';
    console.log('  ℹ️ Set-Cookie header:', setCookie);

    const hasSecure = /;\s*Secure/i.test(setCookie);
    assert(!hasSecure, 'Cookie KHÔNG chứa cờ Secure trên kết nối HTTP LAN (tránh bị browser drop)', hasSecure ? 'Bị cờ Secure!' : 'Không có cờ Secure - Chuẩn');

    const match = setCookie.match(/flowboard_session=([^;]+)/);
    const token = match ? match[1] : loginData?.token;
    assert(token != null, 'Trích xuất được session cookie flowboard_session');

    console.log('\n--- 2. KIỂM TRA TRUY CẬP API AUTH/ME VỚI COOKIE LAN ---');
    const meRes = await fetch('http://127.0.0.1:3000/api/auth/me', {
      method: 'GET',
      headers: {
        'Host': '192.168.1.100:3000',
        'Cookie': `flowboard_session=${token}`,
      },
    });

    const meData = await meRes.json();
    assert(meRes.status === 200, 'API /api/auth/me trả về HTTP 200', `Status: ${meRes.status}`);
    assert(meData?.user?.name != null, 'Nhận diện đúng thông tin user', meData?.user?.name);
    assert(meData?.role != null, 'Nhận diện đúng quyền hạn role', meData?.role);

    console.log('\n--- 3. KIỂM TRA TẢI DỮ LIỆU DỰ ÁN QUA COOKIE LAN ---');
    const projRes = await fetch('http://127.0.0.1:3000/api/projects', {
      method: 'GET',
      headers: {
        'Host': '192.168.1.100:3000',
        'Cookie': `flowboard_session=${token}`,
      },
    });

    const projData = await projRes.json();
    assert(projRes.status === 200, 'API /api/projects trả về HTTP 200', `Status: ${projRes.status}`);
    assert(Array.isArray(projData?.projects), 'Trả về danh sách dự án hợp lệ', `Số dự án: ${projData?.projects?.length}`);

    console.log('\n--- 4. KIỂM TRA ĐĂNG XUẤT (LOGOUT) ---');
    const logoutRes = await fetch('http://127.0.0.1:3000/api/auth/logout', {
      method: 'POST',
      headers: {
        'Host': '192.168.1.100:3000',
        'Cookie': `flowboard_session=${token}`,
      },
    });

    assert(logoutRes.status === 200, 'API /api/auth/logout trả về HTTP 200');
    const logoutCookie = logoutRes.headers.get('set-cookie') || '';
    assert(logoutCookie.includes('Max-Age=0') || logoutCookie.includes('flowboard_session=;'), 'Xóa cookie session thành công');

    console.log('\n══════════════════════════════════════════════════════════════════════');
    console.log(`  KẾT QUẢ KIỂM THỬ: ${passCount} PASS, ${failCount} FAIL`);
    console.log('══════════════════════════════════════════════════════════════════════\n');

    process.exit(failCount > 0 ? 1 : 0);
  } catch (err) {
    console.error('Lỗi khi chạy kiểm thử:', err.message);
    process.exit(1);
  }
}

runTest();
