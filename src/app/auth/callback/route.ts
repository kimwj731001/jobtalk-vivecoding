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

  // Google이 거절한 경우 그 사유가 여기로 온다.
  const oauthError = searchParams.get("error_description") ?? searchParams.get("error");
  if (oauthError) {
    console.error("[auth/callback] OAuth 제공자 오류:", oauthError);
    return NextResponse.redirect(
      `${baseUrl}/?auth_error=${encodeURIComponent(oauthError)}`,
    );
  }

  if (!code) {
    console.error(
      "[auth/callback] code 파라미터가 없습니다. query:",
      searchParams.toString(),
    );
    return NextResponse.redirect(`${baseUrl}/?auth_error=no_code`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("[auth/callback] 세션 교환 실패:", error.status, error.message);
    return NextResponse.redirect(
      `${baseUrl}/?auth_error=${encodeURIComponent(error.message)}`,
    );
  }

  return NextResponse.redirect(`${baseUrl}${next}`);
}
