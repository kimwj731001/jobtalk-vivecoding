import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** Google OAuth 리디렉트를 받아 세션으로 교환한다. */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  // 돌아갈 주소는 요청 헤더에서 직접 읽는다.
  // 환경변수로 고정하면 배포 도메인이 바뀌거나 값이 틀렸을 때 엉뚱한 곳으로 튕긴다.
  // 로컬에서는 x-forwarded-host가 없어 origin(localhost:3000)이 그대로 쓰인다.
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto") ?? "https";
  const baseUrl = forwardedHost
    ? `${forwardedProto}://${forwardedHost}`
    : origin;

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
