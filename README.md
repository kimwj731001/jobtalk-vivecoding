# 잡담회 바이브코딩 데모데이

데모데이에서 만든 결과물을 구조화된 양식으로 올리고, **재미 · 완성도 · 문제해결 가치** 3가지 축으로 서로 평가하는 웹서비스입니다.

## 무엇을 할 수 있나요

- **결과물 등록** — 어떤 문제를, 누구를 위해, 어떻게 푸는지를 정해진 양식으로 작성합니다. 서비스 링크·데모 영상·썸네일·사용한 AI 툴·제작 소요 시간도 함께 남깁니다.
- **평가** — Google 로그인 후 3축 5점 척도로 평가합니다. 각 점수마다 앵커 문구가 있어 기준이 흔들리지 않습니다. 한 줄 코멘트를 함께 남길 수 있습니다.
- **점수 공개** — 평균 점수와 평가 인원이 실시간으로 보입니다. 목록은 최신순 / 평점순 / **평가 적은 순**으로 정렬할 수 있습니다.
- **여러 회차** — 회차(이벤트) 단위로 결과물을 나눠 관리합니다.

## 기술 스택

Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · Supabase (Postgres + Auth + Storage) · Vercel

디자인은 **잡담회 Brand Design System**을 `src/app/globals.css`에 토큰으로 이식해 사용합니다.

## 로컬에서 실행하기

### 1. Supabase 프로젝트 만들기

[supabase.com](https://supabase.com)에서 새 프로젝트를 만듭니다.

### 2. 스키마 실행

Supabase 대시보드 → **SQL Editor**에서 [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql) 전체를 붙여넣고 실행합니다.

테이블, RLS 정책, 썸네일 스토리지 버킷, 첫 회차 시드가 한 번에 만들어집니다.

### 3. Google 로그인 켜기

1. [Google Cloud Console](https://console.cloud.google.com/apis/credentials)에서 **OAuth 2.0 클라이언트 ID**를 만듭니다 (유형: 웹 애플리케이션).
2. 승인된 리디렉션 URI에 Supabase가 알려주는 콜백 주소를 넣습니다.
   `https://<프로젝트-ref>.supabase.co/auth/v1/callback`
3. Supabase → **Authentication → Providers → Google**에 Client ID / Secret을 넣고 켭니다.
4. Supabase → **Authentication → URL Configuration**의 Redirect URLs에 아래를 추가합니다.
   - `http://localhost:3000/auth/callback`
   - 배포 후에는 `https://<배포-도메인>/auth/callback`

### 4. 환경변수

`.env.local.example`을 복사해 `.env.local`을 만들고 Supabase → **Settings → API**의 값을 채웁니다.

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
```

> `service_role` 키는 쓰지 않습니다. 권한은 전부 DB의 RLS 정책이 처리합니다.

### 5. 실행

```bash
npm install
npm run dev
```

http://localhost:3000 에서 확인합니다.

## 관리자 지정

한 번 로그인한 뒤, Supabase → **Table Editor → profiles**에서 본인 행의 `is_admin`을 `true`로 바꾸면 `/admin`에 들어갈 수 있습니다. 관리자는 회차를 만들고 부적절한 결과물을 숨길 수 있습니다.

## 배포

Vercel에 GitHub 저장소를 연결하고 위 환경변수 **2개**를 등록합니다. 돌아올 주소는 요청 헤더에서 읽으므로 도메인을 환경변수로 넣을 필요가 없습니다.

배포 후 [Supabase URL Configuration](https://supabase.com/dashboard/project/_/auth/url-configuration)에서 Site URL을 배포 도메인으로 바꾸고, Redirect URLs에 `https://<배포-도메인>/**`를 추가해야 로그인이 동작합니다. 로컬 개발을 계속한다면 `http://localhost:3000/**`도 함께 남겨둡니다.

## 구조

```
src/
  app/
    actions.ts              서버 액션 (등록·수정·평가·관리자)
    page.tsx                홈 + 회차 목록
    events/[slug]/          회차별 결과물 목록
    events/[slug]/submit/   결과물 등록
    projects/[id]/          결과물 상세 + 평가
    projects/[id]/edit/     결과물 수정
    admin/                  관리자
    auth/callback/          OAuth 콜백
  components/               UI 컴포넌트
  lib/
    rating.ts               평가 3축 정의와 앵커 문구
    supabase/               클라이언트 (browser / server)
    types.ts
  proxy.ts                  세션 갱신 (Next 16의 middleware)
supabase/migrations/        DB 스키마
```

## 평가 설계에 대해

MVP라 점수 보정 로직은 단순 평균을 씁니다. 다만 표본 수 차이로 순위가 왜곡될 수 있어 **평가 인원을 항상 함께 노출**하고, 목록에 **평가 적은 순** 정렬을 두어 노출이 한쪽으로 쏠리지 않게 했습니다.

Google 로그인에 따라오는 최소한의 장치로 **1인 1표**(DB 유니크 제약)와 **본인 결과물 평가 차단**(RLS 정책)만 걸어두었습니다.
