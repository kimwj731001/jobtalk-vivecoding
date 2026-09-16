import Link from "next/link";
import { toggleProjectHidden } from "@/app/actions";
import { DemoBanner } from "@/components/demo-banner";
import { EventForm } from "@/components/event-form";
import { LoginGate } from "@/components/login-gate";
import { DEMO_EVENTS, DEMO_PROJECTS, IS_DEMO } from "@/lib/demo";
import { createClient } from "@/lib/supabase/server";
import type { EventRow, ProjectRow } from "@/lib/types";

export default async function AdminPage() {
  if (IS_DEMO) {
    return <AdminView events={DEMO_EVENTS} projects={DEMO_PROJECTS} demo />;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl px-4 md:px-8 py-16">
        <LoginGate description="관리자 페이지는 로그인 후에 볼 수 있어요." />
      </div>
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.is_admin) {
    return (
      <div className="mx-auto max-w-2xl px-4 md:px-8 py-16">
        <div className="card p-8 text-center">
          <p className="type-h3">관리자만 볼 수 있는 페이지예요</p>
          <p className="type-body-m text-ink-2 mt-2">
            Supabase의 <code className="font-display">profiles</code> 테이블에서
            본인 계정의 <code className="font-display">is_admin</code>을 true로
            바꾸면 들어올 수 있어요.
          </p>
        </div>
      </div>
    );
  }

  const [{ data: events }, { data: projects }] = await Promise.all([
    supabase.from("events").select("*").order("created_at", { ascending: false }),
    supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false }),
  ]);

  return (
    <AdminView
      events={(events ?? []) as EventRow[]}
      projects={(projects ?? []) as ProjectRow[]}
    />
  );
}

function AdminView({
  events,
  projects,
  demo = false,
}: {
  events: EventRow[];
  projects: ProjectRow[];
  demo?: boolean;
}) {
  const eventTitle = new Map(events.map((e) => [e.id, e.title]));

  return (
    <div className="mx-auto max-w-4xl px-4 md:px-8 py-10 space-y-8">
      {demo && <DemoBanner />}

      <h1 className="type-h1">관리자</h1>

      <EventForm demo={demo} />

      <section className="card p-5 md:p-6">
        <h2 className="type-h2">
          회차 <span className="type-caption text-ink-3">({events.length})</span>
        </h2>
        <ul className="mt-4 divide-y divide-line">
          {events.map((event) => (
            <li key={event.id} className="py-3 flex items-center gap-3">
              <div className="min-w-0">
                <Link
                  href={`/events/${event.slug}`}
                  className="type-body-m font-bold hover:text-indigo"
                >
                  {event.title}
                </Link>
                <p className="type-caption text-ink-3 font-display">
                  /events/{event.slug}
                </p>
              </div>
              <span
                className={
                  event.is_active
                    ? "badge badge-green badge-dot ml-auto"
                    : "badge badge-gray ml-auto"
                }
              >
                {event.is_active ? "진행 중" : "마감"}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="card p-5 md:p-6">
        <h2 className="type-h2">
          결과물{" "}
          <span className="type-caption text-ink-3">({projects.length})</span>
        </h2>
        <p className="type-caption text-ink-2 mt-1">
          부적절한 결과물은 숨길 수 있어요. 숨기면 목록과 상세에서 사라집니다.
        </p>
        <ul className="mt-4 divide-y divide-line">
          {projects.map((project) => (
            <li key={project.id} className="py-3 flex items-center gap-3">
              <div className="min-w-0">
                <Link
                  href={`/projects/${project.id}`}
                  className="type-body-m font-bold hover:text-indigo line-clamp-1"
                >
                  {project.title}
                </Link>
                <p className="type-caption text-ink-3 line-clamp-1">
                  {eventTitle.get(project.event_id) ?? "–"} · {project.one_liner}
                </p>
              </div>
              <form action={toggleProjectHidden} className="ml-auto shrink-0">
                <input type="hidden" name="project_id" value={project.id} />
                <input
                  type="hidden"
                  name="hide"
                  value={project.is_hidden ? "0" : "1"}
                />
                <button
                  type="submit"
                  disabled={demo}
                  className={
                    project.is_hidden
                      ? "btn btn-secondary btn-sm"
                      : "btn btn-ghost btn-sm"
                  }
                >
                  {project.is_hidden ? "다시 보이기" : "숨기기"}
                </button>
              </form>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
