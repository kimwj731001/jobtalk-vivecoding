import Link from "next/link";
import { notFound } from "next/navigation";
import { DemoBanner } from "@/components/demo-banner";
import { LoginGate } from "@/components/login-gate";
import { RatingWidget } from "@/components/rating-widget";
import { DEMO_EVENTS, DEMO_PROJECTS, DEMO_RATINGS, DEMO_SCORES, IS_DEMO } from "@/lib/demo";
import { CRITERIA, formatScore } from "@/lib/rating";
import { createClient } from "@/lib/supabase/server";
import type {
  EventRow,
  ProjectRow,
  ProjectScores,
  RatingRow,
  RatingWithProfile,
} from "@/lib/types";

export default async function ProjectPage({
  params,
}: PageProps<"/projects/[id]">) {
  const { id } = await params;

  let project: ProjectRow | null | undefined;
  let event: EventRow | null | undefined;
  let scores: ProjectScores | null | undefined;
  let ratings: RatingWithProfile[] = [];
  let userId: string | undefined;

  if (IS_DEMO) {
    project = DEMO_PROJECTS.find((p) => p.id === id);
    if (!project) notFound();
    event = DEMO_EVENTS.find((e) => e.id === project!.event_id);
    scores = DEMO_SCORES.find((s) => s.project_id === id);
    ratings = DEMO_RATINGS[id] ?? [];
  } else {
    const supabase = await createClient();

    const { data } = await supabase
      .from("projects")
      .select("*")
      .eq("id", id)
      .maybeSingle<ProjectRow>();

    project = data;
    if (!project) notFound();

    const [
      { data: eventData },
      { data: scoreData },
      { data: ratingRows },
      {
        data: { user },
      },
    ] = await Promise.all([
      supabase
        .from("events")
        .select("*")
        .eq("id", project.event_id)
        .maybeSingle<EventRow>(),
      supabase
        .from("project_scores")
        .select("*")
        .eq("project_id", project.id)
        .maybeSingle<ProjectScores>(),
      supabase
        .from("ratings")
        .select("*, profiles(display_name, avatar_url)")
        .eq("project_id", project.id)
        .order("created_at", { ascending: false }),
      supabase.auth.getUser(),
    ]);

    event = eventData;
    scores = scoreData;
    ratings = (ratingRows ?? []) as RatingWithProfile[];
    userId = user?.id;
  }

  const isOwner = !IS_DEMO && userId === project.owner_id;
  const myRating: RatingRow | null =
    ratings.find((r) => r.rater_id === userId) ?? null;
  const comments = ratings.filter((r) => r.comment && r.comment.trim());

  return (
    <div className="mx-auto max-w-5xl px-4 md:px-8 py-10">
      {IS_DEMO && (
        <div className="mb-6">
          <DemoBanner />
        </div>
      )}

      {event && (
        <Link
          href={`/events/${event.slug}`}
          className="type-caption text-ink-2 hover:text-indigo"
        >
          ← {event.title}
        </Link>
      )}

      {/* ── 헤더 ── */}
      <div className="flex flex-wrap items-start justify-between gap-4 mt-3">
        <div className="min-w-0">
          <h1 className="type-h1">{project.title}</h1>
          <p className="type-body-l text-ink-2 mt-2">{project.one_liner}</p>
        </div>
        {isOwner && (
          <Link href={`/projects/${project.id}/edit`} className="btn btn-ghost">
            수정하기
          </Link>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mt-4">
        {project.team_name && (
          <span className="badge badge-indigo">{project.team_name}</span>
        )}
        {project.build_hours !== null && (
          <span className="badge badge-orange">
            ⏱ {project.build_hours}시간 제작
          </span>
        )}
        {project.ai_tools.map((tool) => (
          <span key={tool} className="badge badge-gray">
            {tool}
          </span>
        ))}
      </div>

      <div className="grid lg:grid-cols-[1.5fr_1fr] gap-8 mt-8 items-start">
        {/* ── 본문 ── */}
        <div className="space-y-6 min-w-0">
          {project.thumbnail_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={project.thumbnail_url}
              alt=""
              className="w-full rounded-[24px] border border-line"
            />
          )}

          {(project.service_url || project.demo_video_url) && (
            <div className="flex flex-wrap gap-3">
              {project.service_url && (
                <a
                  href={project.service_url}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="btn btn-primary"
                >
                  서비스 열어보기 ↗
                </a>
              )}
              {project.demo_video_url && (
                <a
                  href={project.demo_video_url}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="btn btn-outline"
                >
                  데모 영상 보기 ↗
                </a>
              )}
            </div>
          )}

          <Block title="어떤 문제를 푸나요" body={project.problem} />
          <Block title="누구를 위한 건가요" body={project.target_customer} />
          <Block title="어떻게 푸나요" body={project.solution} />

          {/* ── 남겨진 한마디 ── */}
          <section className="card p-5 md:p-6">
            <h2 className="type-h2">
              남겨진 한마디{" "}
              <span className="type-caption text-ink-3">
                ({comments.length})
              </span>
            </h2>
            {comments.length === 0 ? (
              <p className="type-body-m text-ink-2 mt-3">
                아직 남겨진 한마디가 없어요. 첫 피드백을 남겨주세요.
              </p>
            ) : (
              <ul className="mt-4 space-y-4">
                {comments.map((rating) => (
                  <li key={rating.id} className="flex gap-3">
                    {rating.profiles?.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={rating.profiles.avatar_url}
                        alt=""
                        className="w-8 h-8 rounded-full border border-line shrink-0"
                      />
                    ) : (
                      <span className="w-8 h-8 rounded-full bg-surface-2 shrink-0" />
                    )}
                    <div className="min-w-0">
                      <p className="type-caption font-bold">
                        {rating.profiles?.display_name ?? "익명"}
                      </p>
                      <p className="type-body-m text-ink-2 mt-0.5 whitespace-pre-wrap break-words">
                        {rating.comment}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {/* ── 사이드: 점수 + 평가 ── */}
        <div className="space-y-6 lg:sticky lg:top-20">
          <section className="card p-5 md:p-6">
            <div className="flex items-end gap-2">
              <span className="type-display text-grad-main leading-none">
                {formatScore(scores?.avg_overall)}
              </span>
              <span className="type-caption text-ink-3 pb-2">/ 5.0</span>
            </div>
            <p className="type-caption text-ink-2 mt-1">
              {scores?.rating_count
                ? `${scores.rating_count}명이 평가했어요`
                : "아직 평가가 없어요"}
            </p>

            <div className="mt-5 space-y-3">
              {CRITERIA.map((criterion) => {
                const value =
                  criterion.key === "fun"
                    ? scores?.avg_fun
                    : criterion.key === "completeness"
                      ? scores?.avg_completeness
                      : scores?.avg_problem_value;
                return (
                  <div key={criterion.key}>
                    <div className="flex justify-between type-caption">
                      <span className="text-ink-2">
                        {criterion.emoji} {criterion.label}
                      </span>
                      <span className="font-bold">{formatScore(value)}</span>
                    </div>
                    <div className="h-1.5 bg-surface-2 rounded-full mt-1.5 overflow-hidden">
                      <div
                        className="h-full bg-grad-main rounded-full transition-all"
                        style={{ width: `${((value ?? 0) / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {isOwner ? (
            <div className="card p-6 text-center">
              <p className="type-h3">내가 올린 결과물이에요</p>
              <p className="type-body-m text-ink-2 mt-2">
                본인 결과물에는 평가를 남길 수 없어요.
              </p>
            </div>
          ) : IS_DEMO || userId ? (
            <RatingWidget
              projectId={project.id}
              initial={myRating}
              demo={IS_DEMO}
            />
          ) : (
            <LoginGate description="평가를 남기려면 로그인이 필요해요." />
          )}
        </div>
      </div>
    </div>
  );
}

function Block({ title, body }: { title: string; body: string }) {
  return (
    <section className="card p-5 md:p-6">
      <h2 className="type-label text-pink-dark">{title}</h2>
      <p className="type-body-l mt-3 whitespace-pre-wrap break-words">{body}</p>
    </section>
  );
}
