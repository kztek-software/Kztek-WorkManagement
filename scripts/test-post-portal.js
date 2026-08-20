const http = require('http');

const payload = JSON.stringify({
  type: "BUG",
  priority: "HIGH",
  customerName: "Nguyễn Văn Test",
  customerEmail: "test@kztek.net",
  customerPhone: "0912345678",
  customerCompany: "Công ty Test",
  title: "Test gửi báo lỗi từ portal",
  description: "Đây là mô tả chi tiết lỗi để kiểm tra nút gửi báo lỗi có hoạt động hay không.",
  environment: "Windows 11, Chrome",
  attachments: []
});

const req = http.request({
  hostname: 'localhost',
  port: 3000,
  path: '/api/tickets/public',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload)
  }
}, (res) => {
  let data = '';
  res.on('data', chunk => { data += chunk; });
  res.on('end', () => {
    console.log(`Status Code: ${res.statusCode}`);
    console.log('Response:', data);
  });
});

req.on('error', (e) => {
  console.error('Request Error:', e.message);
});

req.write(payload);
req.end();
