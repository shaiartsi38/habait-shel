import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const contentType = req.headers.get("content-type") ?? "";
  const rawBody = await req.text();

  let parsed: Record<string, unknown> = {};
  if (contentType.includes("application/json")) {
    try { parsed = JSON.parse(rawBody); } catch { /* not valid json */ }
  } else {
    // form-encoded (application/x-www-form-urlencoded)
    try {
      parsed = Object.fromEntries(new URLSearchParams(rawBody).entries());
    } catch { /* ignore */ }
  }

  console.log("[cardcom-webhook] content-type:", contentType);
  console.log("[cardcom-webhook] raw body:", rawBody);
  console.log("[cardcom-webhook] parsed:", JSON.stringify(parsed, null, 2));

  return new Response("OK", { status: 200 });
}
