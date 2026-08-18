import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

function getFileType(mimeType: string, extension: string): "image" | "video" | "document" | "other" {
  if (mimeType.startsWith("image/") || /\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)$/i.test(extension)) {
    return "image";
  }
  if (mimeType.startsWith("video/") || /\.(mp4|webm|mov|avi|mkv|wmv|flv)$/i.test(extension)) {
    return "video";
  }
  if (
    mimeType.includes("pdf") ||
    mimeType.includes("document") ||
    mimeType.includes("sheet") ||
    mimeType.includes("presentation") ||
    mimeType.includes("text") ||
    /\.(pdf|doc|docx|xls|xlsx|ppt|pptx|txt|log|csv|json|zip|rar|7z)$/i.test(extension)
  ) {
    return "document";
  }
  return "other";
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    if (!user) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }

    const formData = await req.formData();
    const files = formData.getAll("file") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "Không tìm thấy tệp để tải lên" }, { status: 400 });
    }

    // Ensure uploads directory exists
    await fs.mkdir(UPLOAD_DIR, { recursive: true });

    const uploadedResults = [];

    for (const file of files) {
      if (!(file instanceof File) || file.size === 0) continue;

      const originalName = file.name || "upload";
      const ext = path.extname(originalName).toLowerCase();
      const randomSuffix = crypto.randomBytes(8).toString("hex");
      const sanitizedBaseName = path
        .basename(originalName, ext)
        .replace(/[^a-zA-Z0-9_\-\.]/g, "_")
        .slice(0, 50);

      const savedFileName = `${Date.now()}-${randomSuffix}-${sanitizedBaseName}${ext}`;
      const filePath = path.join(UPLOAD_DIR, savedFileName);

      const buffer = Buffer.from(await file.arrayBuffer());
      await fs.writeFile(filePath, buffer);

      const fileType = getFileType(file.type || "", ext);
      const fileUrl = `/uploads/${savedFileName}`;

      uploadedResults.push({
        fileName: originalName,
        savedFileName,
        fileUrl,
        fileType,
        fileSize: file.size,
        mimeType: file.type || "application/octet-stream",
      });
    }

    return NextResponse.json({
      success: true,
      files: uploadedResults,
    });
  } catch (error) {
    console.error("Lỗi khi upload file:", error);
    return NextResponse.json({ error: "Lỗi hệ thống khi tải lên tệp" }, { status: 500 });
  }
}
