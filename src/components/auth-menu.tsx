"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Props = {
  displayName: string | null;
  avatarUrl: string | null;
  isLoggedIn: boolean;
};

export function AuthMenu({ displayName, avatarUrl, isLoggedIn }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function signIn() {
    setBusy(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(
          window.location.pathname,
        )}`,
      },
    });
    if (error) {
      setBusy(false);
      alert(`로그인을 시작하지 못했어요: ${error.message}`);
    }
  }

  async function signOut() {
    setBusy(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh();
    setBusy(false);
  }

  if (!isLoggedIn) {
    return (
      <button className="btn btn-primary btn-sm" onClick={signIn} disabled={busy}>
        <GoogleIcon />
        {busy ? "여는 중…" : "Google로 시작하기"}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {avatarUrl ? (
        // 외부 아바타는 도메인이 제각각이라 next/image 대신 img를 쓴다.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={avatarUrl}
          alt=""
          className="w-7 h-7 rounded-full border border-line"
        />
      ) : (
        <span className="w-7 h-7 rounded-full bg-surface-2" />
      )}
      <span className="type-caption text-ink-2 hidden sm:inline max-w-24 truncate">
        {displayName ?? "익명"}
      </span>
      <button className="btn btn-ghost btn-sm" onClick={signOut} disabled={busy}>
        로그아웃
      </button>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#fff"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62Z"
      />
      <path
        fill="#fff"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18Z"
        opacity=".85"
      />
      <path
        fill="#fff"
        d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33Z"
        opacity=".7"
      />
      <path
        fill="#fff"
        d="M9 3.58c1.32 0 2.5.46 3.44 1.35l2.58-2.58C13.46.9 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58Z"
        opacity=".9"
      />
    </svg>
  );
}
