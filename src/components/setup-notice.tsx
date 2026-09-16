/** Supabase 환경변수가 없을 때 보여주는 안내. 개발 초기에만 노출된다. */
export function SetupNotice() {
  return (
    <div className="mx-auto max-w-2xl px-4 md:px-8 py-16">
      <div className="card p-6 md:p-8">
        <span className="badge badge-orange badge-dot">설정이 필요해요</span>
        <h1 className="type-h2 mt-4">Supabase를 먼저 연결해주세요</h1>
        <p className="type-body-m text-ink-2 mt-2">
          프로젝트 루트에 <code className="font-display">.env.local</code> 파일을
          만들고 아래 값을 채우면 바로 동작합니다.
        </p>

        <ol className="mt-6 space-y-4">
          <Step n={1} title="Supabase 프로젝트 만들기">
            supabase.com에서 새 프로젝트를 만듭니다.
          </Step>
          <Step n={2} title="스키마 실행하기">
            SQL Editor에서{" "}
            <code className="font-display">supabase/migrations/0001_init.sql</code>{" "}
            전체를 붙여넣고 실행합니다.
          </Step>
          <Step n={3} title="Google 로그인 켜기">
            Authentication → Providers → Google에 OAuth Client ID/Secret을
            넣습니다.
          </Step>
          <Step n={4} title="환경변수 채우기">
            Settings → API의 Project URL과 anon key를{" "}
            <code className="font-display">.env.local</code>에 넣고 개발 서버를
            다시 실행합니다.
          </Step>
        </ol>

        <pre className="mt-6 bg-surface-2 rounded-[14px] p-4 type-caption overflow-x-auto font-display text-ink-2">
          {`NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...`}
        </pre>
      </div>
    </div>
  );
}

function Step({
  n,
  title,
  children,
}: {
  n: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <li className="flex gap-3">
      <span className="shrink-0 w-6 h-6 rounded-full bg-grad-main text-white type-caption font-bold flex items-center justify-center">
        {n}
      </span>
      <div>
        <p className="type-body-m font-bold">{title}</p>
        <p className="type-caption text-ink-2 mt-0.5">{children}</p>
      </div>
    </li>
  );
}
