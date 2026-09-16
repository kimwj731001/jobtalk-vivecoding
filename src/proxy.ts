import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

/**
 * Next 16부터 Middleware는 Proxy로 이름이 바뀌었다.
 * 여기서는 만료 직전의 Supabase 세션 토큰을 갱신하는 역할만 한다.
 * 실제 권한 판단은 각 페이지와 DB의 RLS 정책에서 처리한다.
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  // 환경변수 설정 전에는 아무것도 하지 않는다. (안내 화면이 뜨도록)
  if (!isSupabaseConfigured) return response;

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // 이 호출이 세션 갱신을 트리거한다. 제거하면 로그인이 임의로 풀린다.
  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: [
    /*
     * 정적 파일과 이미지 최적화 요청을 제외한 모든 경로에서 실행한다.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
