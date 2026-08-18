import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createTicket } from "@/lib/tickets";

const publicTicketSchema = z.object({
  projectId: z.string().optional(),
  projectKey: z.string().optional(),
  title: z.string().min(3, "Tiêu đề phải có ít nhất 3 ký tự").max(200),
  description: z.string().min(5, "Mô tả sự cố phải có ít nhất 5 ký tự").max(5000),
  type: z.enum(["BUG", "SUPPORT", "INQUIRY", "FEATURE_REQ"]).default("BUG"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
  customerName: z.string().min(2, "Họ và tên ít nhất 2 ký tự").max(100),
  customerEmail: z.string().email("Email không hợp lệ").max(150),
  customerPhone: z.string().max(30).optional().nullable(),
  customerCompany: z.string().max(150).optional().nullable(),
  environment: z.string().max(500).optional().nullable(),
  attachments: z
    .array(
      z.object({
        fileName: z.string(),
        fileUrl: z.string(),
        fileType: z.string().optional(),
        fileSize: z.number().optional().nullable(),
        mimeType: z.string().optional().nullable(),
      })
    )
    .optional(),
});

// GET /api/tickets/public -> Lấy danh sách dự án công khai để khách hàng lựa chọn
export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      select: {
        id: true,
        name: true,
        key: true,
        description: true,
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ projects });
  } catch (error) {
    console.error("Lỗi khi tải danh sách dự án công khai:", error);
    return NextResponse.json(
      { error: "Không thể tải danh sách dự án" },
      { status: 500 }
    );
  }
}

// POST /api/tickets/public -> Gửi ticket báo lỗi từ khách hàng
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const parsed = publicTicketSchema.safeParse(body);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || "Dữ liệu không hợp lệ";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const d = parsed.data;

    // Tìm Project theo projectId hoặc projectKey
    let targetProject = null;
    if (d.projectId) {
      targetProject = await prisma.project.findUnique({
        where: { id: d.projectId },
        select: { id: true, name: true, key: true },
      });
    } else if (d.projectKey) {
      targetProject = await prisma.project.findUnique({
        where: { key: d.projectKey.toUpperCase() },
        select: { id: true, name: true, key: true },
      });
    }

    // Nếu không chỉ định, lấy project đầu tiên làm mặc định
    if (!targetProject) {
      targetProject = await prisma.project.findFirst({
        orderBy: { createdAt: "asc" },
        select: { id: true, name: true, key: true },
      });
    }

    if (!targetProject) {
      return NextResponse.json(
        { error: "Hệ thống chưa có dự án nào để tiếp nhận ticket" },
        { status: 400 }
      );
    }

    const ticket = await createTicket({
      projectId: targetProject.id,
      title: d.title,
      description: d.description,
      type: d.type,
      priority: d.priority,
      customerName: d.customerName,
      customerEmail: d.customerEmail,
      customerPhone: d.customerPhone,
      customerCompany: d.customerCompany,
      environment: d.environment,
      attachments: d.attachments,
    });

    return NextResponse.json(
      {
        success: true,
        ticket: {
          id: ticket.id,
          trackingCode: ticket.trackingCode,
          title: ticket.title,
          status: ticket.status,
          customerName: ticket.customerName,
          project: targetProject,
          createdAt: ticket.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Lỗi khi tạo ticket từ khách hàng:", error);
    return NextResponse.json(
      { error: "Đã xảy ra lỗi khi gửi yêu cầu báo lỗi. Vui lòng thử lại." },
      { status: 500 }
    );
  }
}
