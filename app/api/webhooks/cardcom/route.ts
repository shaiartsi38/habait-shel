import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { randomInt } from "crypto";

// מיפוי: ProdGroupID של קארדקום → subscription_tier
// להוסיף כאן כשיהיו מוצרי מנוי נוספים בקארדקום
const GROUP_TIER: Record<string, string> = {
  "32": "basic", // קבוצת טסט
};

function generateTempPassword(): string {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  return Array.from({ length: 16 }, () => chars[randomInt(0, chars.length)]).join("");
}

function cleanName(raw: string): string {
  return raw.replace(/[‎‏‪-‮]/g, "").trim();
}

function buildEmailHtml(firstName: string, email: string, password: string): string {
  return `<!DOCTYPE html>
<html dir="rtl" lang="he">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#080608;font-family:Arial,sans-serif;direction:rtl;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#080608;padding:40px 16px;">
  <tr><td align="center">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#0D0810;border:1px solid rgba(196,133,122,0.2);border-radius:16px;overflow:hidden;">
      <tr><td style="background:linear-gradient(135deg,#C4857A,#D4998E);height:4px;font-size:0;">&nbsp;</td></tr>
      <tr><td style="padding:36px 36px 20px;text-align:center;">
        <p style="color:#C4857A;font-size:10px;letter-spacing:4px;text-transform:uppercase;margin:0 0 6px;font-family:Arial,sans-serif;">NATALIE ARTSI</p>
        <h1 style="color:#FFF8F5;font-size:24px;margin:0;font-weight:900;font-family:Arial,sans-serif;">הבית של המאפרים</h1>
      </td></tr>
      <tr><td style="padding:0 36px 32px;">
        <p style="color:#FFF8F5;font-size:16px;margin:0 0 4px;font-family:Arial,sans-serif;">שלום ${firstName} 👋</p>
        <p style="color:#C4857A;font-size:13px;margin:0 0 20px;font-family:Arial,sans-serif;">מה שלומך?</p>
        <p style="color:#C8B8B3;font-size:14px;line-height:1.8;margin:0 0 28px;font-family:Arial,sans-serif;">
          איזה כיף שהצטרפת לבית הדיגיטלי של המאפרים!<br>
          כל מאסטר קלאס, כל שיעור — נבנה ונצולם בדרך ייחודית,<br>
          כדי שיהיה לך הכי קל והכי נוח ללמוד, לתרגל ולצפות בחומרים שוב ושוב.
        </p>
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#1A1014;border:1px solid rgba(196,133,122,0.25);border-radius:12px;margin-bottom:28px;">
          <tr><td style="padding:24px 28px;">
            <p style="color:#8B6355;font-size:10px;letter-spacing:2px;text-transform:uppercase;margin:0 0 16px;font-family:Arial,sans-serif;">פרטי התחברות שלך</p>
            <p style="margin:0 0 12px;font-family:Arial,sans-serif;font-size:14px;color:#FFF8F5;">
              <span style="color:#8B6355;">שם משתמש:</span>&nbsp;
              <span dir="ltr" style="color:#C4857A;font-weight:bold;">${email}</span>
            </p>
            <p style="margin:0;font-family:Arial,sans-serif;font-size:14px;color:#FFF8F5;">
              <span style="color:#8B6355;">סיסמה:</span>&nbsp;
              <span style="color:#C4857A;font-weight:bold;letter-spacing:2px;">${password}</span>
            </p>
          </td></tr>
        </table>
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr><td align="center" style="padding-bottom:28px;">
            <a href="https://academy.natalieartsi.com/login"
               style="display:inline-block;background:linear-gradient(135deg,#C4857A,#D4998E);color:#080608;text-decoration:none;font-size:15px;font-weight:900;padding:14px 48px;border-radius:12px;font-family:Arial,sans-serif;">
              כניסה לבית של המאפרים
            </a>
          </td></tr>
        </table>
        <p style="color:#5A3830;font-size:13px;text-align:center;margin:0 0 20px;line-height:1.7;font-family:Arial,sans-serif;">
          אם יש לך שאלות — את תמיד יכולה לפנות אלי.<br>
          את הולכת להיות טרפת ברשת שלום!
        </p>
        <p style="color:#C8B8B3;font-size:14px;margin:0;font-family:Arial,sans-serif;">אוהבת המון,</p>
        <p style="color:#C4857A;font-size:16px;font-weight:bold;margin:4px 0 0;font-family:Arial,sans-serif;">נטלי ארצי</p>
      </td></tr>
      <tr><td style="background:linear-gradient(135deg,#C4857A,#D4998E);height:2px;font-size:0;">&nbsp;</td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const data = Object.fromEntries(new URLSearchParams(rawBody).entries());

  console.log("[cardcom] received fields:", Object.keys(data).join(", "));

  // אמת שהתשלום הצליח ושזה הטרמינל שלנו
  if (data.responsecode !== "0") {
    console.log("[cardcom] non-success code:", data.responsecode);
    return new Response("OK", { status: 200 });
  }
  if (data.terminalnumber !== process.env.CARDCOM_TERMINAL) {
    console.warn("[cardcom] unexpected terminal:", data.terminalnumber);
    return new Response("OK", { status: 200 });
  }

  const userEmail = data.UserEmail?.toLowerCase().trim();
  if (!userEmail) {
    console.error("[cardcom] missing UserEmail");
    return new Response("OK", { status: 200 });
  }

  const rawName = cleanName(data.CardOwnerName ?? "");
  const parts = rawName.split(/\s+/).filter(Boolean);
  const firstName = parts[0] ?? "לקוחה";
  const lastName = parts.slice(1).join(" ");

  const tier = GROUP_TIER[data.ProdGroupID ?? ""] ?? "basic";
  const tempPassword = generateTempPassword();

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  // יצירת משתמש חדש
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: userEmail,
    password: tempPassword,
    email_confirm: true,
  });

  if (authError) {
    if (
      authError.message.toLowerCase().includes("already") ||
      (authError as { code?: string }).code === "email_exists"
    ) {
      // משתמש קיים — עדכן tier בלבד
      console.log("[cardcom] user exists, updating tier:", userEmail);
      await supabaseAdmin
        .from("profiles")
        .update({ subscription_tier: tier })
        .eq("email", userEmail);
      return new Response("OK", { status: 200 });
    }
    console.error("[cardcom] createUser error:", authError.message);
    return new Response("OK", { status: 200 });
  }

  const userId = authData.user.id;

  // צור/עדכן פרופיל
  await supabaseAdmin.from("profiles").upsert({
    id: userId,
    email: userEmail,
    first_name: firstName,
    last_name: lastName,
    role: "user",
    subscription_tier: tier,
  });

  // שלח מייל ברוכה הבאה
  const emailHtml = buildEmailHtml(firstName, userEmail, tempPassword);
  const smRes = await fetch(
    "https://gconvertrest.sendmsg.co.il/api/Sendmsg/AddUsersAndSendEmail",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: process.env.SENDMSG_API_KEY!,
      },
      body: JSON.stringify({
        users: [
          {
            EmailAddress: userEmail,
            FirstName: firstName,
            LastName: lastName,
            Cellphone: data.CardOwnerPhone ?? "",
          },
        ],
        Message: {
          MessageContent: emailHtml,
          MessageSubject: "פרטי התחברות לבית של המאפרים",
          SenderEmailAddress: "office@natalieartsi.com",
          SenderName: "נטלי ארצי",
          MessageBackColor: "#080608",
          MessageDirection: 1,
          MessageInnerName: `welcome-${userId}`,
          AddFacebook: false,
          AddForward: false,
          AddShowMessage: false,
        },
      }),
    }
  );

  const smResult = await smRes.json().catch(() => ({}));
  console.log("[cardcom] sendmsg result:", JSON.stringify(smResult));
  console.log("[cardcom] ✅ done — email:", userEmail, "tier:", tier);

  return new Response("OK", { status: 200 });
}
