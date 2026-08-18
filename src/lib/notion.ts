// Notion API v1 Integration Module for KZTEK Work Management

export type NotionDatabaseInfo = {
  id: string;
  title: string;
  url: string;
  properties: Record<string, { type: string; name: string }>;
};

export type NotionTaskItem = {
  id: string;
  title: string;
  url: string;
  status?: string;
  priority?: string;
  dueDate?: string;
  assigneeName?: string;
  rawProperties?: Record<string, unknown>;
};

export type NotionConnectionTestResult = {
  success: boolean;
  botName?: string;
  workspaceName?: string;
  error?: string;
};

const NOTION_API_BASE = "https://api.notion.com/v1";
const NOTION_VERSION = "2022-06-28";

function getNotionHeaders(apiKey: string) {
  return {
    Authorization: `Bearer ${apiKey.trim()}`,
    "Notion-Version": NOTION_VERSION,
    "Content-Type": "application/json",
  };
}

/**
 * Kiểm tra kết nối trực tiếp với Notion API bằng API Key (Internal Integration Token)
 */
export async function testNotionConnection(apiKey: string): Promise<NotionConnectionTestResult> {
  if (!apiKey || !apiKey.trim()) {
    return { success: false, error: "API Key Notion không được để trống" };
  }

  try {
    const res = await fetch(`${NOTION_API_BASE}/users/me`, {
      method: "GET",
      headers: getNotionHeaders(apiKey),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return {
        success: false,
        error: err.message || `Lỗi xác thực Notion (Mã HTTP: ${res.status})`,
      };
    }

    const data = await res.json();
    return {
      success: true,
      botName: data.name || data.bot?.owner?.user?.name || "KZTEK Notion Bot",
      workspaceName: data.bot?.workspace_name || "KZTEK Workspace",
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Không thể kết nối đến máy chủ Notion";
    return { success: false, error: msg };
  }
}

/**
 * Lấy danh sách tất cả các Database mà Notion Bot có quyền truy cập
 */
export async function getNotionDatabases(apiKey: string): Promise<{
  success: boolean;
  databases: NotionDatabaseInfo[];
  error?: string;
}> {
  try {
    const res = await fetch(`${NOTION_API_BASE}/search`, {
      method: "POST",
      headers: getNotionHeaders(apiKey),
      body: JSON.stringify({
        filter: { value: "database", property: "object" },
        page_size: 50,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, databases: [], error: err.message || "Không thể tìm kiếm Database" };
    }

    const data = await res.json();
    const databases: NotionDatabaseInfo[] = (data.results || []).map((db: any) => {
      const title =
        db.title && db.title.length > 0
          ? db.title.map((t: any) => t.plain_text).join("")
          : "Không có tiêu đề";

      const properties: Record<string, { type: string; name: string }> = {};
      if (db.properties) {
        for (const [key, prop] of Object.entries(db.properties as Record<string, any>)) {
          properties[key] = { type: prop.type, name: prop.name || key };
        }
      }

      return {
        id: db.id,
        title: title || "Database không tên",
        url: db.url || `https://notion.so/${db.id.replace(/-/g, "")}`,
        properties,
      };
    });

    return { success: true, databases };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Lỗi khi tải danh sách Database Notion";
    return { success: false, databases: [], error: msg };
  }
}

/**
 * Đọc danh sách Pages / Tasks trực tiếp từ một Notion Database
 */
export async function getNotionDatabaseTasks(
  apiKey: string,
  databaseId: string,
  pageSize = 50
): Promise<{ success: boolean; tasks: NotionTaskItem[]; total: number; error?: string }> {
  try {
    const cleanDbId = databaseId.trim().replace(/-/g, "");
    const res = await fetch(`${NOTION_API_BASE}/databases/${cleanDbId}/query`, {
      method: "POST",
      headers: getNotionHeaders(apiKey),
      body: JSON.stringify({
        page_size: pageSize,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return {
        success: false,
        tasks: [],
        total: 0,
        error: err.message || `Lỗi khi truy vấn Notion Database (HTTP ${res.status})`,
      };
    }

    const data = await res.json();
    const tasks: NotionTaskItem[] = (data.results || []).map((page: any) => {
      let title = "Task không tên";
      let status: string | undefined = undefined;
      let priority: string | undefined = undefined;
      let dueDate: string | undefined = undefined;
      let assigneeName: string | undefined = undefined;

      const props = page.properties || {};

      for (const [key, prop] of Object.entries(props as Record<string, any>)) {
        // Parse Title
        if (prop.type === "title" && Array.isArray(prop.title) && prop.title.length > 0) {
          title = prop.title.map((t: any) => t.plain_text).join("");
        }

        // Parse Status / Select
        if (prop.type === "status" && prop.status) {
          status = prop.status.name;
        } else if (prop.type === "select" && prop.select && !status) {
          const lowerKey = key.toLowerCase();
          if (lowerKey.includes("status") || lowerKey.includes("trạng thái") || lowerKey.includes("tiến độ")) {
            status = prop.select.name;
          } else if (lowerKey.includes("priority") || lowerKey.includes("ưu tiên")) {
            priority = prop.select.name;
          }
        }

        // Parse Priority
        if (prop.type === "select" && prop.select && (key.toLowerCase().includes("priority") || key.toLowerCase().includes("ưu tiên"))) {
          priority = prop.select.name;
        }

        // Parse Date
        if (prop.type === "date" && prop.date?.start) {
          dueDate = prop.date.start;
        }

        // Parse People / Assignee
        if (prop.type === "people" && Array.isArray(prop.people) && prop.people.length > 0) {
          assigneeName = prop.people.map((p: any) => p.name || p.person?.email || "User").join(", ");
        }
      }

      return {
        id: page.id,
        title: title || "Task không có tiêu đề",
        url: page.url || `https://notion.so/${page.id.replace(/-/g, "")}`,
        status,
        priority,
        dueDate,
        assigneeName,
      };
    });

    return { success: true, tasks, total: tasks.length };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Lỗi khi đọc dữ liệu từ Notion";
    return { success: false, tasks: [], total: 0, error: msg };
  }
}

/**
 * Ánh xạ trạng thái từ Notion sang trạng thái chuẩn KZTEK WorkManagement
 */
export function mapNotionStatusToKztek(notionStatus?: string): "BACKLOG" | "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE" {
  if (!notionStatus) return "TODO";
  const s = notionStatus.toLowerCase().trim();

  if (s.includes("done") || s.includes("hoàn thành") || s.includes("complete") || s.includes("đã xong")) {
    return "DONE";
  }
  if (s.includes("review") || s.includes("kiểm tra") || s.includes("duyệt") || s.includes("testing")) {
    return "IN_REVIEW";
  }
  if (s.includes("in progress") || s.includes("doing") || s.includes("đang làm") || s.includes("triển khai")) {
    return "IN_PROGRESS";
  }
  if (s.includes("backlog") || s.includes("tồn đọng") || s.includes("chờ")) {
    return "BACKLOG";
  }
  return "TODO";
}

/**
 * Ánh xạ độ ưu tiên từ Notion sang chuẩn KZTEK WorkManagement
 */
export function mapNotionPriorityToKztek(notionPriority?: string): "LOW" | "MEDIUM" | "HIGH" | "URGENT" {
  if (!notionPriority) return "MEDIUM";
  const p = notionPriority.toLowerCase().trim();

  if (p.includes("urgent") || p.includes("khẩn") || p.includes("gấp") || p.includes("critical")) {
    return "URGENT";
  }
  if (p.includes("high") || p.includes("cao") || p.includes("p1")) {
    return "HIGH";
  }
  if (p.includes("low") || p.includes("thấp") || p.includes("p3")) {
    return "LOW";
  }
  return "MEDIUM";
}
