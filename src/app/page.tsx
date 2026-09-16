import Link from "next/link";
import { DemoBanner } from "@/components/demo-banner";
import { SetupNotice } from "@/components/setup-notice";
import { DEMO_EVENTS, DEMO_PROJECTS, IS_DEMO } from "@/lib/demo";
import { createClient } from "@/lib/supabase/server";
import type { EventRow } from "@/lib/types";

export default async function HomePage() {
  let eventList: EventRow[] = [];
  const countByEvent = new Map<string, number>();

  if (IS_DEMO) {
    eventList = DEMO_EVENTS;
    for (const project of DEMO_PROJECTS) {
      countByEvent.set(
        project.event_id,
        (countByEvent.get(project.event_id) ?? 0) + 1,
      );
    }
  } else {
    const supabase = await createClient();
    const [{ data: events }, { data: projectRefs }] = await Promise.all([
      supabase
        .from("events")
        .select("*")
        .order("is_active", { ascending: false })
        .order("created_at", { ascending: false }),
      supabase.from("projects").select("event_id"),
    ]);

    eventList = (events ?? []) as EventRow[];
    for (const row of projectRefs ?? []) {
      countByEvent.set(row.event_id, (countByEvent.get(row.event_id) ?? 0) + 1);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 md:px-8">
      {IS_DEMO && (
        <div className="pt-6">
          <DemoBanner />
        </div>
      )}

      {/* ── Hero ── */}
      <section className="py-14 md:py-20">
        <span className="type-label text-pink-dark">Vibe Coding Demoday</span>
        <h1 className="type-display mt-3 max-w-3xl">
          만든 걸 꺼내놓고,
          <br />
          <span className="text-grad-main">서로 한마디씩</span> 남기는 곳
        </h1>
        <p className="type-body-l text-ink-2 mt-5 max-w-xl">
          잡담회 바이브코딩 데모데이에서 만든 결과물을 올리고, 재미 · 완성도 ·
          문제해결 가치로 가볍게 평가해보세요.
        </p>

        {eventList[0] && (
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={`/events/${eventList[0].slug}`}
              className="btn btn-primary btn-lg"
            >
              결과물 둘러보기
            </Link>
            <Link
              href={`/events/${eventList[0].slug}/submit`}
              className="btn btn-outline btn-lg"
            >
              내 결과물 올리기
            </Link>
          </div>
        )}
      </section>

      {/* ── 회차 목록 ── */}
      <section className="pb-8">
        <h2 className="type-h2">회차</h2>
        {eventList.length === 0 ? (
          <p className="type-body-m text-ink-2 mt-4">
            아직 등록된 회차가 없어요. 관리자 페이지에서 먼저 회차를
            만들어주세요.
          </p>
        ) : (
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {eventList.map((event) => (
              <Link
                key={event.id}
                href={`/events/${event.slug}`}
                className="card card-hover p-5 block"
              >
                <div className="flex items-center gap-2">
                  {event.is_active ? (
                    <span className="badge badge-green badge-dot">진행 중</span>
                  ) : (
                    <span className="badge badge-gray">마감</span>
                  )}
                  <span className="badge badge-indigo">
                    결과물 {countByEvent.get(event.id) ?? 0}개
                  </span>
                </div>
                <h3 className="type-h3 mt-3">{event.title}</h3>
                {event.description && (
                  <p className="type-caption text-ink-2 mt-2 line-clamp-2">
                    {event.description}
                  </p>
                )}
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* 데모 모드에서는 설정 방법을 아래에 같이 보여준다. */}
      {IS_DEMO && <SetupNotice />}
    </div>
  );
}
