import { prisma } from "../src/lib/prisma";

async function runTest() {
  console.log("=== BẮT ĐẦU KIỂM THỬ TỰ ĐỘNG E2E: TÍNH NĂNG TÀI LIỆU DỰ ÁN (FILE, ẢNH, VIDEO) ===");

  // 1. Lấy hoặc tạo user admin để test
  let adminUser = await prisma.user.findFirst({
    where: { role: "ADMIN" },
  });

  if (!adminUser) {
    adminUser = await prisma.user.findFirst();
  }

  if (!adminUser) {
    throw new Error("Không tìm thấy user nào trong database để chạy test");
  }

  console.log(`[PASS] Sử dụng user: ${adminUser.name} (${adminUser.email}, role: ${adminUser.role})`);

  const testKey = `TST${Math.floor(100 + Math.random() * 900)}`;
  const testProjectName = `Dự Án Thử Nghiệm Attachments ${testKey}`;

  // 2. Tạo dự án mới kèm danh sách tài liệu đính kèm (File, Ảnh, Video)
  const sampleAttachments = [
    {
      fileName: "dac-ta-he-thong.pdf",
      fileUrl: "/uploads/test-dac-ta-he-thong.pdf",
      fileType: "document",
      fileSize: 1024 * 500, // 500 KB
      mimeType: "application/pdf",
    },
    {
      fileName: "so-do-kien-truc.png",
      fileUrl: "/uploads/test-so-do-kien-truc.png",
      fileType: "image",
      fileSize: 1024 * 250, // 250 KB
      mimeType: "image/png",
    },
    {
      fileName: "demo-tinh-nang.mp4",
      fileUrl: "/uploads/test-demo-tinh-nang.mp4",
      fileType: "video",
      fileSize: 1024 * 1024 * 15, // 15 MB
      mimeType: "video/mp4",
    },
  ];

  console.log(`\n--- 1. Tạo dự án mới [${testKey}] kèm 3 tệp đính kèm (PDF, PNG, MP4) ---`);
  const project = await prisma.project.create({
    data: {
      name: testProjectName,
      key: testKey,
      description: "Dự án kiểm thử tính năng đẩy tài liệu (file, ảnh, video)",
      status: "PLANNING",
      ownerId: adminUser.id,
      members: {
        create: [{ userId: adminUser.id, role: "OWNER" }],
      },
      attachments: {
        create: sampleAttachments.map((att) => ({
          fileName: att.fileName,
          fileUrl: att.fileUrl,
          fileType: att.fileType,
          fileSize: att.fileSize,
          mimeType: att.mimeType,
          uploaderId: adminUser.id,
        })),
      },
    },
    include: {
      attachments: {
        include: { uploader: true },
        orderBy: { createdAt: "desc" },
      },
      _count: { select: { attachments: true, members: true } },
    },
  });

  console.log(`[PASS] Đã tạo thành công dự án ID: ${project.id}, Key: ${project.key}`);
  console.log(`[PASS] Số lượng attachments được liên kết: ${project.attachments.length}`);
  if (project.attachments.length !== 3) {
    throw new Error(`Kỳ vọng 3 attachments nhưng nhận được ${project.attachments.length}`);
  }

  // 3. Kiểm tra các trường dữ liệu của từng attachment
  for (const att of project.attachments) {
    console.log(`  ✓ Attachment: ${att.fileName} | Type: ${att.fileType} | Size: ${att.fileSize} B | Uploader: ${att.uploader?.name}`);
    if (att.projectId !== project.id) {
      throw new Error(`Attachment ${att.id} có projectId không khớp (${att.projectId} vs ${project.id})`);
    }
  }

  // 4. Thêm một tài liệu mới bổ sung vào dự án
  console.log("\n--- 2. Bổ sung thêm tài liệu mới vào dự án ---");
  const newAttachment = await prisma.attachment.create({
    data: {
      projectId: project.id,
      fileName: "bang-tinh-kinh-phi.xlsx",
      fileUrl: "/uploads/test-bang-tinh-kinh-phi.xlsx",
      fileType: "document",
      fileSize: 1024 * 80,
      mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      uploaderId: adminUser.id,
    },
    include: { uploader: true },
  });

  console.log(`[PASS] Đã đính kèm thêm: ${newAttachment.fileName} (ID: ${newAttachment.id})`);

  // 5. Truy vấn toàn bộ danh sách attachments của dự án
  const allProjectAttachments = await prisma.attachment.findMany({
    where: { projectId: project.id },
    orderBy: { createdAt: "desc" },
  });

  console.log(`[PASS] Tổng số attachments hiện tại của dự án: ${allProjectAttachments.length}`);
  if (allProjectAttachments.length !== 4) {
    throw new Error(`Kỳ vọng 4 attachments nhưng nhận được ${allProjectAttachments.length}`);
  }

  // 6. Xóa 1 attachment
  console.log("\n--- 3. Xóa 1 tệp đính kèm khỏi dự án ---");
  await prisma.attachment.delete({
    where: { id: newAttachment.id },
  });

  const remainingAttachments = await prisma.attachment.findMany({
    where: { projectId: project.id },
  });

  console.log(`[PASS] Số lượng attachments còn lại sau khi xóa: ${remainingAttachments.length}`);
  if (remainingAttachments.length !== 3) {
    throw new Error(`Kỳ vọng 3 attachments nhưng nhận được ${remainingAttachments.length}`);
  }

  // 7. Xóa dự án và kiểm tra cascade / transaction dọn dẹp
  console.log("\n--- 4. Xóa dự án và dọn dẹp dữ liệu ---");
  await prisma.$transaction(async (tx) => {
    await tx.attachment.deleteMany({ where: { projectId: project.id } });
    await tx.projectMember.deleteMany({ where: { projectId: project.id } });
    await tx.project.delete({ where: { id: project.id } });
  });

  const checkAttachments = await prisma.attachment.findMany({
    where: { projectId: project.id },
  });

  console.log(`[PASS] Attachments còn lại của dự án sau khi xóa dự án: ${checkAttachments.length}`);
  if (checkAttachments.length !== 0) {
    throw new Error("Lỗi: Vẫn còn attachments tồn đọng sau khi xóa dự án");
  }

  console.log("\n========================================================");
  console.log("🎉 TOÀN BỘ 7 BƯỚC KIỂM THỬ E2E CHO TÀI LIỆU DỰ ÁN ĐÃ PASS 100%!");
  console.log("========================================================");
}

runTest()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ TEST THẤT BẠI:", err);
    process.exit(1);
  });
