import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

const createTeamSchema = z.object({
  name: z.string().min(2).max(100),
  code: z
    .string()
    .min(2)
    .max(30)
    .regex(/^[A-Z0-9_]+$/, "Mã nhóm phải là chữ in hoa, số hoặc gạch dưới (VD: HARDWARE, QA_QC)"),
  description: z.string().optional().nullable(),
  color: z.string().default("#F05922"),
  leaderId: z.string().optional().nullable(),
  memberIds: z.array(z.string()).default([]),
});

const DEFAULT_TEAMS = [
  {
    name: "Phòng Kỹ thuật Phần cứng & Bo mạch",
    code: "HARDWARE",
    description: "Nghiên cứu, thiết kế phần cứng, bo mạch Barrier KZ-B100, cảm biến từ và phụ kiện bãi xe",
    color: "#F05922",
  },
  {
    name: "Phòng Firmware & Hệ thống Nhúng",
    code: "FIRMWARE",
    description: "Phát triển firmware vi điều khiển STM32/ESP32, giao tiếp RS485, CAN Bus và bộ đọc thẻ RFID",
    color: "#3B82F6",
  },
  {
    name: "Phòng Phát triển Phần mềm (Software)",
    code: "SOFTWARE",
    description: "Xây dựng hệ thống quản lý KZTEK Work, Backend API, Cloud Server và ứng dụng Desktop/Mobile",
    color: "#10B981",
  },
  {
    name: "Phòng Kiểm thử & Đảm bảo Chất lượng (QA/QC)",
    code: "QA_QC",
    description: "Kiểm thử tự động, đo kiểm chất lượng sản phẩm phần cứng & phần mềm trước khi xuất xưởng",
    color: "#F59E0B",
  },
  {
    name: "Phòng Triển khai Dự án & Hỗ trợ Kỹ thuật",
    code: "DEPLOYMENT",
    description: "Khảo sát công trình, lắp đặt hệ thống bãi xe thông minh tại hiện trường và hỗ trợ khách hàng",
    color: "#8B5CF6",
  },
];

async function ensureDefaultTeams() {
  const count = await prisma.team.count();
  if (count === 0) {
    for (const t of DEFAULT_TEAMS) {
      await prisma.team.upsert({
        where: { code: t.code },
        update: { name: t.name, description: t.description, color: t.color },
        create: { name: t.name, code: t.code, description: t.description, color: t.color },
      });
    }
  }
}

// GET /api/teams — Lấy danh sách tất cả các nhóm/phòng ban
export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  }

  await ensureDefaultTeams();

  const teams = await prisma.team.findMany({
    include: {
      leader: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarColor: true,
          title: true,
          role: true,
        },
      },
      members: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarColor: true,
          title: true,
          role: true,
          _count: {
            select: {
              assignedTasks: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  const formatted = teams.map((t) => {
    const totalAssignedTasks = t.members.reduce(
      (sum, m) => sum + (m._count?.assignedTasks || 0),
      0
    );

    return {
      id: t.id,
      name: t.name,
      code: t.code,
      description: t.description,
      color: t.color,
      leader: t.leader,
      leaderId: t.leaderId,
      members: t.members,
      memberCount: t.members.length,
      taskCount: totalAssignedTasks,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
    };
  });

  return NextResponse.json({ teams: formatted });
}

// POST /api/teams — Tạo nhóm/phòng ban mới
export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  }
  if (user.role !== "ADMIN") {
    return NextResponse.json({ error: "Chỉ Quản trị viên (Admin) mới có quyền tạo Nhóm mới" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = createTeamSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Thông tin nhóm không hợp lệ" },
      { status: 400 }
    );
  }

  const { name, code, description, color, leaderId, memberIds } = parsed.data;
  const upperCode = code.toUpperCase().trim();

  const existingCode = await prisma.team.findUnique({ where: { code: upperCode } });
  if (existingCode) {
    return NextResponse.json({ error: `Mã nhóm "${upperCode}" đã tồn tại` }, { status: 409 });
  }

  const existingName = await prisma.team.findUnique({ where: { name: name.trim() } });
  if (existingName) {
    return NextResponse.json({ error: `Tên nhóm "${name.trim()}" đã tồn tại` }, { status: 409 });
  }

  const newTeam = await prisma.team.create({
    data: {
      name: name.trim(),
      code: upperCode,
      description: description?.trim() || null,
      color,
      leaderId: leaderId || null,
    },
  });

  // Gán các thành viên vào nhóm
  if (memberIds && memberIds.length > 0) {
    await prisma.user.updateMany({
      where: { id: { in: memberIds } },
      data: { teamId: newTeam.id },
    });
  }

  // Nếu leader có chọn, đảm bảo leader cũng thuộc team
  if (leaderId) {
    await prisma.user.update({
      where: { id: leaderId },
      data: { teamId: newTeam.id },
    });
  }

  const fullTeam = await prisma.team.findUnique({
    where: { id: newTeam.id },
    include: {
      leader: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarColor: true,
          title: true,
          role: true,
        },
      },
      members: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarColor: true,
          title: true,
          role: true,
        },
      },
    },
  });

  return NextResponse.json({ team: fullTeam }, { status: 201 });
}
