import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { getTicketsByProject, createTicket } from "@/lib/tickets";
import { checkUserPermission } from "@/lib/permissions-server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const user = await requireUser();
    const { projectId } = await params;

    const member = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId: user.id } },
    });
    if (!member) {
      return NextResponse.json({ error: "Không có quyền truy cập dự án" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "ALL";
    const priority = searchParams.get("priority") || "ALL";
    const type = searchParams.get("type") || "ALL";
    const search = searchParams.get("search") || "";
    const scope = searchParams.get("scope") || "PROJECT"; // PROJECT | UNASSIGNED | ALL

    const unassignedOnly = scope === "UNASSIGNED";
    const isAll = scope === "ALL";

    const [project, data, allProjects] = await Promise.all([
      prisma.project.findUnique({
        where: { id: projectId },
        select: { id: true, name: true, key: true },
      }),
      getTicketsByProject(unassignedOnly ? "UNASSIGNED" : isAll ? "ALL" : projectId, {
        status,
        priority,
        type,
        search,
        unassignedOnly,
      }),
      prisma.project.findMany({
        select: { id: true, name: true, key: true },
        orderBy: { name: "asc" },
      }),
    ]);

    if (!project) {
      return NextResponse.json({ error: "Không tìm thấy dự án" }, { status: 404 });
    }

    return NextResponse.json({
      project,
      tickets: data.tickets,
      stats: data.stats,
      currentRole: member.role,
      userRole: user.role,
      allProjects,
    });
  } catch (error) {
    console.error("Lỗi khi tải danh sách ticket dự án:", error);
    return NextResponse.json({ error: "Lỗi máy chủ" }, { status: 500 });
  }
}

const createInternalTicketSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(5).max(5000),
  type: z.enum(["BUG", "SUPPORT", "INQUIRY", "FEATURE_REQ"]).default("BUG"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
  customerName: z.string().min(1).max(100),
  customerEmail: z.string().email().max(150),
  customerPhone: z.string().max(30).optional().nullable(),
  customerCompany: z.string().max(150).optional().nullable(),
  environment: z.string().max(500).optional().nullable(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const user = await requireUser();
    const { projectId } = await params;

    const permCheck = await checkUserPermission(user.id, "tickets.create", projectId, user.role);
    if (!permCheck.allowed) {
      return NextResponse.json({ error: permCheck.reason || "Không có quyền tạo Ticket cho dự án này" }, { status: 403 });
    }

    const body = await req.json().catch(() => null);
    const parsed = createInternalTicketSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Dữ liệu không hợp lệ" },
        { status: 400 }
      );
    }

    const ticket = await createTicket({
      projectId,
      ...parsed.data,
    });

    return NextResponse.json({ ticket }, { status: 201 });
  } catch (error) {
    console.error("Lỗi khi tạo ticket nội bộ:", error);
    return NextResponse.json({ error: "Lỗi máy chủ" }, { status: 500 });
  }
}
