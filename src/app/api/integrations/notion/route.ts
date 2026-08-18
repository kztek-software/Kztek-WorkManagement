import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import {
  testNotionConnection,
  getNotionDatabases,
  getNotionDatabaseTasks,
} from "@/lib/notion";

const notionRequestSchema = z.object({
  action: z.enum(["test", "databases", "tasks"]),
  apiKey: z.string().min(5, "API Key Notion không hợp lệ"),
  databaseId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    await requireUser();

    const body = await req.json().catch(() => null);
    const parsed = notionRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Tham số không hợp lệ" },
        { status: 400 }
      );
    }

    const { action, apiKey, databaseId } = parsed.data;

    // 1. Kiểm tra kết nối token
    if (action === "test") {
      const result = await testNotionConnection(apiKey);
      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
      return NextResponse.json(result);
    }

    // 2. Lấy danh sách database
    if (action === "databases") {
      const result = await getNotionDatabases(apiKey);
      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
      return NextResponse.json(result);
    }

    // 3. Lấy danh sách tasks từ database được chọn
    if (action === "tasks") {
      if (!databaseId) {
        return NextResponse.json(
          { error: "Vui lòng chọn Database để kiểm tra tasks" },
          { status: 400 }
        );
      }
      const result = await getNotionDatabaseTasks(apiKey, databaseId);
      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: "Action không hỗ trợ" }, { status: 400 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Lỗi máy chủ nội bộ";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
