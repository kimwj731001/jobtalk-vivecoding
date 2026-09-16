import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** Google OAuth 리디렉트를 받아 세션으로 교환한다. */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  // 배포 환경에서는 프록시 뒤라 origin이 내부 주소일 수 있다.
  const forwardedHost = request.headers.get("x-forwarded-host");
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (forwardedHost ? `https://${forwardedHost}` : origin);

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${baseUrl}${next}`);
    }
  }

  return NextResponse.redirect(`${baseUrl}/?auth_error=1`);
}
