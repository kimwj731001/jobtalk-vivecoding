import Link from "next/link";
import { AuthMenu } from "./auth-menu";
import { BrandMark } from "./brand-mark";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export async function SiteHeader() {
  let isLoggedIn = false;
  let displayName: string | null = null;
  let avatarUrl: string | null = null;

  if (isSupabaseConfigured) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      isLoggedIn = true;
      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name, avatar_url")
        .eq("id", user.id)
        .maybeSingle();

      displayName = profile?.display_name ?? user.email ?? null;
      avatarUrl = profile?.avatar_url ?? null;
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-lg border-b border-line">
      <div className="mx-auto max-w-6xl px-4 md:px-8 h-14 flex items-center gap-4">
        <Link
          href="/"
          className="flex items-center gap-2 font-display font-bold text-indigo text-[15px] tracking-tight shrink-0"
        >
          <BrandMark />
          <span>잡담회</span>
        </Link>

        <span className="type-caption text-ink-3 hidden md:inline">
          바이브코딩 데모데이
        </span>

        <div className="ml-auto">
          {isSupabaseConfigured ? (
            <AuthMenu
              isLoggedIn={isLoggedIn}
              displayName={displayName}
              avatarUrl={avatarUrl}
            />
          ) : (
            <span className="badge badge-orange">설정 필요</span>
          )}
        </div>
      </div>
    </header>
  );
}
