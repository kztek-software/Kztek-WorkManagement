import { NextRequest, NextResponse } from "next/server";
import { verifyZaloWebhookSignature } from "@/lib/zalo/client";
import { consumeZaloLinkCode } from "@/lib/zalo/link";
import { getEffectiveZaloConfig } from "@/lib/system-config";

/**
 * Webhook công khai (KHÔNG cần đăng nhập) — Zalo gọi vào đây khi có sự kiện từ Official Account
 * (user follow/unfollow, gửi tin nhắn...). Cấu hình URL này (kèm domain public HTTPS) tại
 * developers.zalo.me > App > Cấu hình OA > Webhook URL.
 *
 * ⚠️ Field payload dưới đây (event_name, sender.id, message.text) theo cấu trúc phổ biến của
 * Zalo OA Webhook — CẦN đối chiếu lại với payload thật khi có OA thật gửi webhook lần đầu
 * (có thể log tạm ra console để xem cấu trúc chính xác trước khi tin tưởng hoàn toàn).
 */
export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const cfg = getEffectiveZaloConfig();

  let body: {
    app_id?: string;
    oa_id?: string;
    event_name?: string;
    timestamp?: string;
    sender?: { id?: string };
    follower?: { id?: string };
    message?: { text?: string; msg_id?: string };
  };

  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Payload không hợp lệ" }, { status: 400 });
  }

  // Xác thực chữ ký để đảm bảo request thực sự đến từ Zalo, không phải giả mạo
  if (cfg.oaSecretKey) {
    const signatureHeader = req.headers.get("x-zevent-signature");
    const isValid = verifyZaloWebhookSignature({
      rawBody,
      appId: body.app_id || cfg.appId,
      timestamp: body.timestamp || "",
      oaSecretKey: cfg.oaSecretKey,
      signatureHeader,
    });
    if (!isValid) {
      console.warn("[Zalo Webhook] Chữ ký không hợp lệ, có thể request giả mạo — từ chối xử lý");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
  }

  const senderId = body.sender?.id || body.follower?.id;

  try {
    switch (body.event_name) {
      case "user_send_text": {
        const text = body.message?.text;
        if (text && senderId) {
          const linkedUserId = await consumeZaloLinkCode(text, senderId);
          if (linkedUserId) {
            console.log(`[Zalo Webhook] Đã liên kết Zalo ${senderId} với user ${linkedUserId} qua mã xác nhận`);
            // TODO: khi đã có access_token thật, có thể gọi sendOaTextMessage để phản hồi
            // "✅ Liên kết thành công! Bạn sẽ nhận thông báo công việc qua Zalo." cho senderId.
          }
        }
        break;
      }
      case "follow":
        console.log(`[Zalo Webhook] User ${senderId} vừa follow OA`);
        break;
      case "unfollow":
        console.log(`[Zalo Webhook] User ${senderId} vừa unfollow OA`);
        break;
      default:
        console.log(`[Zalo Webhook] Nhận event chưa xử lý: ${body.event_name}`);
    }
  } catch (error) {
    console.error("[Zalo Webhook] Lỗi khi xử lý event:", error);
    // Vẫn trả 200 để Zalo không retry liên tục — lỗi đã được log lại để tra soát
  }

  return NextResponse.json({ ok: true });
}
