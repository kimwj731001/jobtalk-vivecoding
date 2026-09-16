/**
 * Supabase 환경변수가 채워졌는지 확인한다.
 * 아직 설정 전이어도 앱이 죽지 않고 안내 화면을 보여주기 위한 장치다.
 */
export const isSupabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);
