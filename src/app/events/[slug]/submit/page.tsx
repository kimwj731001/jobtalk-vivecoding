import Link from "next/link";
import { notFound } from "next/navigation";
import { submitProject } from "@/app/actions";
import { DemoBanner } from "@/components/demo-banner";
import { LoginGate } from "@/components/login-gate";
import { ProjectForm } from "@/components/project-form";
import { IS_DEMO, demoEventBySlug } from "@/lib/demo";
import { createClient } from "@/lib/supabase/server";
import type { EventRow } from "@/lib/types";

export default async function SubmitPage({
  params,
}: PageProps<"/events/[slug]/submit">) {
  const { slug } = await params;

  let event: EventRow | null | undefined;
  let userId: string | undefined;

  if (IS_DEMO) {
    event = demoEventBySlug(slug);
    if (!event) notFound();
  } else {
    const supabase = await createClient();

    const { data } = await supabase
      .from("events")
      .select("*")
      .eq("slug", slug)
      .maybeSingle<EventRow>();

    event = data;
    if (!event) notFound();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    userId = user?.id;
  }

  return (
    <div className="mx-auto max-w-2xl px-4 md:px-8 py-10">
      {IS_DEMO && (
        <div className="mb-6">
          <DemoBanner />
        </div>
      )}

      <Link
        href={`/events/${event.slug}`}
        className="type-caption text-ink-2 hover:text-indigo"
      >
        ← {event.title}
      </Link>

      <h1 className="type-h1 mt-3">결과물 올리기</h1>
      <p className="type-body-m text-ink-2 mt-2">
        길게 안 써도 괜찮아요. 무엇을 왜 만들었는지만 분명하면 충분합니다.
      </p>

      <div className="mt-8">
        {IS_DEMO || userId ? (
          <ProjectForm
            action={submitProject}
            hiddenFields={{ event_id: event.id }}
            userId={userId ?? "demo"}
            submitLabel="올리기"
            demo={IS_DEMO}
          />
        ) : (
          <LoginGate description="결과물을 올리려면 로그인이 필요해요." />
        )}
      </div>
    </div>
  );
}
