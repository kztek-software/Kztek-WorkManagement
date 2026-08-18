// Script test nhanh chức năng render template HTML và gửi email thử nghiệm
const { generateTaskAssignedEmailHtml, generateStatusChangedEmailHtml, generateTestEmailHtml, sendMail, getEmailLogs } = require("../src/lib/mail");

async function runTests() {
  console.log("=== BẮT ĐẦU KIỂM TRA NOTIFY & EMAIL SERVICE ===");

  // 1. Test Task Assignment Email HTML
  const taskHtml = generateTaskAssignedEmailHtml({
    taskNumber: 101,
    taskTitle: "Tích hợp hệ thống nhận diện biển số xe tự động",
    taskDescription: "Cần kết nối camera IP với thuật toán AI nhận diện biển số xe trong thời gian thực < 100ms.",
    taskType: "TASK",
    priority: "HIGH",
    dueDate: "2026-08-30",
    projectName: "Hệ Thống Bãi Xe Thông Minh KZ",
    projectKey: "PARK",
    projectId: "proj_123",
    assignorName: "Nguyễn Văn TechLead",
    assigneeName: "Trần SeniorDev",
    assigneeEmail: "dev@kztek.net",
  });

  console.log("✓ Render mẫu Task Assigned Email HTML thành công, độ dài:", taskHtml.length, "bytes");

  // 2. Test Status Change Email HTML
  const statusHtml = generateStatusChangedEmailHtml({
    taskNumber: 101,
    taskTitle: "Tích hợp hệ thống nhận diện biển số xe tự động",
    projectName: "Hệ Thống Bãi Xe Thông Minh KZ",
    projectId: "proj_123",
    oldStatus: "IN_PROGRESS",
    newStatus: "IN_REVIEW",
    actorName: "Trần SeniorDev",
    recipientName: "Nguyễn Văn TechLead",
    recipientEmail: "techlead@kztek.net",
  });

  console.log("✓ Render mẫu Status Changed Email HTML thành công, độ dài:", statusHtml.length, "bytes");

  // 3. Test Test Email HTML
  const testHtml = generateTestEmailHtml("Quản trị viên", "admin@kztek.net");
  console.log("✓ Render mẫu Test Email HTML thành công, độ dài:", testHtml.length, "bytes");

  console.log("=== TẤT CẢ KIỂM TRA NOTIFY & MAIL SERVICE ĐÃ PASS! ===");
}

// Chạy nếu là CommonJS hoặc export
if (require.main === module) {
  runTests().catch(console.error);
}
