// AI engine: local heuristic hoạt động ngay, tuỳ chọn OpenAI khi có API key.

export type AiSuggestion = {
  description: string;
  storyPoints: number;
  labels: string[];
  subtasks: string[];
  priority: string;
  source: "local" | "openai";
};

const KEYWORD_RULES: {
  pattern: RegExp;
  labels: string[];
  points: number;
  subtasks: string[];
}[] = [
  {
    pattern: /(api|endpoint|server|database|query|backend|auth|đăng nhập|server)/i,
    labels: ["backend"],
    points: 5,
    subtasks: ["Thiết kế API contract", "Viết unit tests", "Cập nhật API docs"],
  },
  {
    pattern: /(ui|ux|giao diện|component|css|theme|dark mode|responsive|frontend|màn hình)/i,
    labels: ["frontend"],
    points: 3,
    subtasks: ["Dựng layout/component", "Responsive trên mobile", "Kiểm tra accessibility"],
  },
  {
    pattern: /(bug|lỗi|fix|crash|error|hỏng|sai)/i,
    labels: ["bug"],
    points: 2,
    subtasks: ["Tái hiện lỗi", "Xác định nguyên nhân gốc", "Viết regression test"],
  },
  {
    pattern: /(ai|ml|model|gpt|llm|trí tuệ nhân tạo)/i,
    labels: ["ai"],
    points: 8,
    subtasks: ["Nghiên cứu approach", "Dựng prototype", "Đánh giá chất lượng output"],
  },
  {
    pattern: /(deploy|ci|cd|docker|infra|monitor|scale|tối ưu|performance)/i,
    labels: ["infra"],
    points: 5,
    subtasks: ["Đánh giá hiện trạng", "Triển khai thay đổi", "Theo dõi sau triển khai"],
  },
  {
    pattern: /(thiết kế|design|mockup|prototype|figma)/i,
    labels: ["design"],
    points: 3,
    subtasks: ["Khảo sát yêu cầu", "Dựng mockup", "Review với team"],
  },
  {
    pattern: /(báo cáo|report|chart|biểu đồ|dashboard|thống kê|analytics)/i,
    labels: ["frontend", "backend"],
    points: 5,
    subtasks: ["Xác định metrics cần hiển thị", "Xây dựng API tổng hợp dữ liệu", "Dựng biểu đồ"],
  },
];

function localSuggest(title: string, existingLabels: string[]): AiSuggestion {
  const matched = KEYWORD_RULES.filter((r) => r.pattern.test(title));

  const labels = Array.from(
    new Set(matched.flatMap((m) => m.labels).filter((l) => existingLabels.includes(l)))
  ).slice(0, 3);

  const points = matched.length ? Math.max(...matched.map((m) => m.points)) : 3;

  const words = title.trim().split(/\s+/).length;
  const adjustedPoints = words > 12 ? Math.min(points + 2, 13) : points;

  const subtasks = matched.length
    ? matched[0].subtasks
    : ["Xác định phạm vi công việc", "Triển khai", "Kiểm tra và hoàn thiện"];

  const isBug = /bug|lỗi|fix|crash/i.test(title);
  const isUrgent = /gấp|urgent|khẩn cấp|asap|block/i.test(title);

  const description = [
    `## Mục tiêu`,
    `${title}.`,
    ``,
    `## Mô tả`,
    `Triển khai "${title}" đảm bảo chất lượng, đúng phạm vi và có thể kiểm chứng được.`,
    ``,
    `## Acceptance criteria`,
    ...subtasks.map((s) => `- [ ] ${s}`),
    `- [ ] Được review và approve bởi ít nhất 1 thành viên`,
  ].join("\n");

  return {
    description,
    storyPoints: adjustedPoints,
    labels,
    subtasks,
    priority: isUrgent ? "URGENT" : isBug ? "HIGH" : "MEDIUM",
    source: "local",
  };
}

async function openAiSuggest(
  title: string,
  existingLabels: string[],
  apiKey: string
): Promise<AiSuggestion | null> {
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
        temperature: 0.4,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "You are a project management assistant. Given a task title, return JSON with keys: description (markdown with goal + acceptance criteria), storyPoints (1,2,3,5,8,13), labels (subset of available labels), subtasks (3-4 short strings), priority (LOW|MEDIUM|HIGH|URGENT).",
          },
          {
            role: "user",
            content: `Task title: "${title}"\nAvailable labels: ${existingLabels.join(", ") || "(none)"}`,
          },
        ],
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const parsed = JSON.parse(data.choices[0].message.content);
    return {
      description: String(parsed.description ?? ""),
      storyPoints: Number(parsed.storyPoints ?? 3),
      labels: Array.isArray(parsed.labels) ? parsed.labels : [],
      subtasks: Array.isArray(parsed.subtasks) ? parsed.subtasks : [],
      priority: String(parsed.priority ?? "MEDIUM"),
      source: "openai",
    };
  } catch {
    return null;
  }
}

export async function suggestTask(
  title: string,
  existingLabels: string[]
): Promise<AiSuggestion> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (apiKey) {
    const result = await openAiSuggest(title, existingLabels, apiKey);
    if (result) return result;
  }
  return localSuggest(title, existingLabels);
}
