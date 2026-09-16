import Link from "next/link";
import { notFound } from "next/navigation";
import { DemoBanner } from "@/components/demo-banner";
import { ProjectCard } from "@/components/project-card";
import {
  IS_DEMO,
  demoEventBySlug,
  demoProjectsByEvent,
  demoScoreMap,
} from "@/lib/demo";
import { createClient } from "@/lib/supabase/server";
import type { EventRow, ProjectRow, ProjectScores } from "@/lib/types";

const SORTS = [
  { key: "new", label: "최신순" },
  { key: "score", label: "평점순" },
  { key: "few", label: "평가 적은 순" },
] as const;

type SortKey = (typeof SORTS)[number]["key"];

export default async function EventPage({
  params,
  searchParams,
}: PageProps<"/events/[slug]">) {
  const { slug } = await params;
  const { sort } = await searchParams;
  const activeSort: SortKey = SORTS.some((s) => s.key === sort)
    ? (sort as SortKey)
    : "new";

  let event: EventRow | null | undefined;
  let projects: ProjectRow[] = [];
  let scoreMap = new Map<string, ProjectScores>();

  if (IS_DEMO) {
    event = demoEventBySlug(slug);
    if (!event) notFound();
    projects = demoProjectsByEvent(event.id);
    scoreMap = demoScoreMap();
  } else {
    const supabase = await createClient();

    const { data } = await supabase
      .from("events")
      .select("*")
      .eq("slug", slug)
      .maybeSingle<EventRow>();

    event = data;
    if (!event) notFound();

    const { data: projectRows } = await supabase
      .from("projects")
      .select("*")
      .eq("event_id", event.id)
      .eq("is_hidden", false);

    projects = (projectRows ?? []) as ProjectRow[];

    // project_scores는 뷰라 PostgREST가 관계를 추론하지 못한다. 따로 가져와 합친다.
    if (projects.length > 0) {
      const { data: scoreRows } = await supabase
        .from("project_scores")
        .select("*")
        .in(
          "project_id",
          projects.map((p) => p.id),
        );
      scoreMap = new Map(
        ((scoreRows ?? []) as ProjectScores[]).map((s) => [s.project_id, s]),
      );
    }
  }

  const sorted = [...projects].sort((a, b) => {
    const sa = scoreMap.get(a.id);
    const sb = scoreMap.get(b.id);
    if (activeSort === "score") {
      return (sb?.avg_overall ?? 0) - (sa?.avg_overall ?? 0);
    }
    if (activeSort === "few") {
      return (sa?.rating_count ?? 0) - (sb?.rating_count ?? 0);
    }
    return b.created_at.localeCompare(a.created_at);
  });

  return (
    <div className="mx-auto max-w-6xl px-4 md:px-8 py-10">
      {IS_DEMO && (
        <div className="mb-6">
          <DemoBanner />
        </div>
      )}

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          {event.is_active ? (
            <span className="badge badge-green badge-dot">진행 중</span>
          ) : (
            <span className="badge badge-gray">마감</span>
          )}
          <h1 className="type-h1 mt-3">{event.title}</h1>
          {event.description && (
            <p className="type-body-m text-ink-2 mt-2 max-w-xl">
              {event.description}
            </p>
          )}
        </div>
        <Link href={`/events/${event.slug}/submit`} className="btn btn-primary">
          내 결과물 올리기
        </Link>
      </div>

      {/* ── 정렬 ── */}
      <div className="flex flex-wrap gap-2 mt-8">
        {SORTS.map((s) => (
          <Link
            key={s.key}
            href={`/events/${event.slug}?sort=${s.key}`}
            className={
              s.key === activeSort ? "btn btn-secondary btn-sm" : "btn btn-ghost btn-sm"
            }
          >
            {s.label}
          </Link>
        ))}
        <span className="type-caption text-ink-3 self-center ml-auto">
          총 {projects.length}개
        </span>
      </div>

      {/* ── 결과물 목록 ── */}
      {sorted.length === 0 ? (
        <div className="card p-10 text-center mt-6">
          <p className="type-h3">아직 올라온 결과물이 없어요</p>
          <p className="type-body-m text-ink-2 mt-2">
            첫 번째로 만든 걸 꺼내놓아 보세요.
          </p>
          <Link
            href={`/events/${event.slug}/submit`}
            className="btn btn-primary mt-6"
          >
            내 결과물 올리기
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              scores={scoreMap.get(project.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
