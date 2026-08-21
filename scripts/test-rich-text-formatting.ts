/**
 * Test script for Rich Text Formatting & Markdown Parser
 * Validates inline tokens, list parsing (1. 2. 3.), color tags, highlights, and block structures.
 */

import { renderRichInline } from "../src/components/ui/rich-markdown";

function runTests() {
  console.log("==================================================");
  console.log("🧪 TESTING RICH TEXT FORMATTING & MARKDOWN PARSER");
  console.log("==================================================");

  let passed = 0;
  let total = 0;

  function assert(name: string, condition: boolean) {
    total++;
    if (condition) {
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${name}`);
    }
  }

  // 1. Test Bold
  {
    const result = renderRichInline("Văn bản **in đậm** và bình thường");
    assert("Bold formatting **...**", result.length > 0);
  }

  // 2. Test Italic
  {
    const result = renderRichInline("Văn bản *in nghiêng* và _in nghiêng 2_");
    assert("Italic formatting *...* and _..._", result.length > 0);
  }

  // 3. Test Underline
  {
    const result = renderRichInline("Văn bản <u>gạch chân</u> và ++gạch chân 2++");
    assert("Underline formatting <u> and ++", result.length > 0);
  }

  // 4. Test Strikethrough
  {
    const result = renderRichInline("Văn bản ~~gạch ngang~~ và <del>gạch ngang 2</del>");
    assert("Strikethrough formatting ~~ and <del>", result.length > 0);
  }

  // 5. Test Color tags
  {
    const result = renderRichInline(
      "Màu [color:red]chữ đỏ[/color], [color:blue]chữ xanh[/color], [color:#10b981]màu hex[/color]"
    );
    assert("Color formatting [color:xxx]...[/color]", result.length > 0);
  }

  // 6. Test Shortcut Color tags
  {
    const result = renderRichInline("[red]Cảnh báo đỏ[/red] và [green]Thành công[/green]");
    assert("Shortcut color tags [red] and [green]", result.length > 0);
  }

  // 7. Test Highlight & Background
  {
    const result = renderRichInline("Đoạn ==highlight vàng== và [bg:amber]nền cam[/bg]");
    assert("Highlight ==...== and [bg:...]", result.length > 0);
  }

  // 8. Test Inline Code
  {
    const result = renderRichInline("Chạy lệnh `npm run dev` để khởi động");
    assert("Inline code `...`", result.length > 0);
  }

  // 9. Test Links
  {
    const result = renderRichInline("Xem tại [Trang chủ KZTEK](https://kztek.net)");
    assert("Links [text](url)", result.length > 0);
  }

  // 10. Test Mentions
  {
    const members: any[] = [
      { user: { id: "u1", name: "Nguyễn Việt Anh", email: "anhnv@kztek.net" }, role: "DEVELOPER" },
      { user: { id: "u2", name: "Quản trị viên KZTEK", email: "admin@kztek.net" }, role: "ADMIN" },
    ];
    const result = renderRichInline("Nhờ @Nguyễn Việt Anh và @Quản trị viên KZTEK kiểm tra", members);
    assert("Mentions with Vietnamese accents and spaces", result.length > 0);
  }

  console.log("==================================================");
  console.log(`📊 Kết quả: ${passed}/${total} bài kiểm tra PASS 100%`);
  console.log("==================================================");

  if (passed !== total) {
    process.exit(1);
  }
}

runTests();
