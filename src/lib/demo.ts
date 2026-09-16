/**
 * 데모 모드 — Supabase 환경변수가 없을 때 쓰는 샘플 데이터.
 *
 * 화면과 레이아웃을 먼저 눈으로 확인하려고 만든 임시 장치다.
 * Supabase를 연결하면 자동으로 꺼지고, 연결이 끝나면 이 파일과
 * 각 페이지의 `IS_DEMO` 분기를 지워도 된다.
 *
 * 결과물 내용은 실제 서비스(중고시세 / 고양이 통역)의 공개된 화면을 보고 정리했다.
 * 다만 `ai_tools`, `build_hours`, `team_name`, 그리고 평가 점수·코멘트는
 * 화면에서 알 수 없는 값이라 **임의로 채운 자리표시자**다. 실제 값으로 바꿔야 한다.
 */

import { isSupabaseConfigured } from "@/lib/supabase/config";
import type {
  EventRow,
  ProjectRow,
  ProjectScores,
  RatingWithProfile,
} from "@/lib/types";

export const IS_DEMO = !isSupabaseConfigured;

const EVENT_ID = "demo-event-1";

export const DEMO_EVENTS: EventRow[] = [
  {
    id: EVENT_ID,
    slug: "vibecoding-demoday-1",
    title: "잡담회 바이브코딩 데모데이",
    description:
      "AI와 함께 만든 결과물을 공유하고 서로 피드백하는 자리입니다.",
    starts_at: null,
    ends_at: null,
    is_active: true,
    created_at: "2026-09-10T10:00:00Z",
  },
];

function project(
  id: string,
  fields: Omit<
    ProjectRow,
    "id" | "event_id" | "owner_id" | "is_hidden" | "updated_at"
  >,
): ProjectRow {
  return {
    id,
    event_id: EVENT_ID,
    owner_id: `demo-owner-${id}`,
    is_hidden: false,
    updated_at: fields.created_at,
    ...fields,
  };
}

export const DEMO_PROJECTS: ProjectRow[] = [
  project("demo-1", {
    title: "중고시세",
    one_liner: "당근과 번개장터 매물을 한 번에 모아 지금의 적정 시세를 알려줘요",
    problem:
      "중고로 사거나 팔 때 얼마가 적당한지 기준이 없습니다. 당근과 번개장터를 따로 열어 매물을 눈으로 훑어야 하고, 그마저도 광고 글이나 다른 물건이 섞여 있어 결국 감으로 가격을 정하게 됩니다.",
    target_customer:
      "중고 거래를 자주 하지만 가격 협상에서 늘 손해 보는 것 같은 사람. 특히 모델과 용량에 따라 값이 크게 갈리는 전자기기를 거래하는 사람.",
    solution:
      "상품 검색어를 넣으면 두 마켓에서 매물을 최대 100개씩 모으고, 광고·무관 상품·중복을 걸러낸 뒤 정제평균과 가격 분포로 보여줍니다. 당근은 선택한 지역 기준, 번개장터는 전국 기준으로 비교할 수 있습니다.",
    service_url: "https://temp-price.vercel.app",
    demo_video_url: null,
    thumbnail_url: null,
    // ↓ 자리표시자
    ai_tools: ["Claude Code", "Cursor"],
    build_hours: 6,
    team_name: null,
    created_at: "2026-09-14T09:00:00Z",
  }),
  project("demo-2", {
    title: "고양이 통역",
    one_liner: "사진과 울음소리로 고양이가 지금 무슨 상태인지 읽어줘요",
    problem:
      "고양이가 우는데 배가 고픈 건지, 아픈 건지, 그냥 부르는 건지 알기 어렵습니다. 검색해도 '우리 애는 이랬어요' 같은 경험담만 나와서 내 고양이에게 맞는 답인지 확신이 서지 않습니다.",
    target_customer:
      "고양이와 함께 살면서 작은 변화에도 걱정이 많은 집사. 그리고 동네 길고양이의 상태가 괜찮은지 궁금한 사람.",
    solution:
      "사진과 울음소리에서 측정 가능한 신호를 뽑아내고, 공개된 행동학 자료를 근거로 해석합니다. 나이·성격·스트레스 요인을 프로필로 등록하면 그 개체에 맞춰 해석이 조정됩니다. 프로필은 브라우저에만 저장되고 사진의 EXIF는 업로드 전에 제거되며, 진단 도구가 아니라는 점을 화면에서 분명히 알립니다.",
    service_url: "https://jdhmvp.vercel.app",
    demo_video_url: null,
    thumbnail_url: null,
    // ↓ 자리표시자
    ai_tools: ["Claude Code"],
    build_hours: 5,
    team_name: null,
    created_at: "2026-09-15T08:10:00Z",
  }),
];

export const DEMO_SCORES: ProjectScores[] = [
  {
    project_id: "demo-1",
    rating_count: 11,
    avg_fun: 3.6,
    avg_completeness: 4.5,
    avg_problem_value: 4.8,
    avg_overall: 4.3,
  },
  {
    project_id: "demo-2",
    rating_count: 8,
    avg_fun: 4.9,
    avg_completeness: 4.1,
    avg_problem_value: 3.9,
    avg_overall: 4.3,
  },
];

export const DEMO_RATINGS: Record<string, RatingWithProfile[]> = {
  "demo-1": [
    {
      id: "demo-r1",
      project_id: "demo-1",
      rater_id: "demo-u1",
      fun: 3,
      completeness: 5,
      problem_value: 5,
      comment:
        "광고 글을 걸러주는 게 핵심이네요. 그냥 평균이 아니라 정제평균이라는 점에서 신뢰가 갔어요.",
      created_at: "2026-09-15T10:00:00Z",
      updated_at: "2026-09-15T10:00:00Z",
      profiles: { display_name: "이하늘", avatar_url: null },
    },
    {
      id: "demo-r2",
      project_id: "demo-1",
      rater_id: "demo-u2",
      fun: 4,
      completeness: 4,
      problem_value: 5,
      comment:
        "당근은 지역, 번개장터는 전국이라 기준이 다른 점만 화면에서 더 크게 알려주면 좋겠어요. 그것 빼면 바로 쓰겠던데요?",
      created_at: "2026-09-15T12:20:00Z",
      updated_at: "2026-09-15T12:20:00Z",
      profiles: { display_name: "박지우", avatar_url: null },
    },
  ],
  "demo-2": [
    {
      id: "demo-r3",
      project_id: "demo-2",
      rater_id: "demo-u3",
      fun: 5,
      completeness: 4,
      problem_value: 4,
      comment:
        "진단 도구가 아니라고 먼저 말해주는 게 오히려 믿음이 갔어요. EXIF 제거까지 챙긴 건 진짜 세심하네요.",
      created_at: "2026-09-15T09:00:00Z",
      updated_at: "2026-09-15T09:00:00Z",
      profiles: { display_name: "최민서", avatar_url: null },
    },
    {
      id: "demo-r4",
      project_id: "demo-2",
      rater_id: "demo-u4",
      fun: 5,
      completeness: 4,
      problem_value: 4,
      comment: "길고양이 모드가 있는 걸 늦게 봤어요. 첫 화면에서 더 눈에 띄면 좋겠어요.",
      created_at: "2026-09-15T20:00:00Z",
      updated_at: "2026-09-15T20:00:00Z",
      profiles: { display_name: "정우진", avatar_url: null },
    },
  ],
};

export function demoEventBySlug(slug: string): EventRow | undefined {
  return DEMO_EVENTS.find((e) => e.slug === slug);
}

export function demoProjectsByEvent(eventId: string): ProjectRow[] {
  return DEMO_PROJECTS.filter((p) => p.event_id === eventId);
}

export function demoScoreMap(): Map<string, ProjectScores> {
  return new Map(DEMO_SCORES.map((s) => [s.project_id, s]));
}
