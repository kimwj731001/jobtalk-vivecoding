"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

/** 로그인이 필요한 자리에 끼워 넣는 안내 + 로그인 버튼. */
export function LoginGate({
  title = "로그인하고 참여해주세요",
  description = "누가 남겼는지 알 수 있어야 서로 피드백을 주고받을 수 있어요.",
}: {
  title?: string;
  description?: string;
}) {
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

  return (
    <div className="card p-8 text-center">
      <p className="type-h3">{title}</p>
      <p className="type-body-m text-ink-2 mt-2">{description}</p>
      <button
        className="btn btn-primary mt-6"
        onClick={signIn}
        disabled={busy}
      >
        {busy ? "여는 중…" : "Google로 계속하기"}
      </button>
    </div>
  );
}
