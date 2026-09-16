import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { updateProject } from "@/app/actions";
import { ProjectForm } from "@/components/project-form";
import { IS_DEMO } from "@/lib/demo";
import { createClient } from "@/lib/supabase/server";
import type { ProjectRow } from "@/lib/types";

export default async function EditProjectPage({
  params,
}: PageProps<"/projects/[id]/edit">) {
  const { id } = await params;

  // 데모 모드에는 소유자 개념이 없어서 수정 화면을 열지 않는다.
  if (IS_DEMO) redirect(`/projects/${id}`);

  const supabase = await createClient();

  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .maybeSingle<ProjectRow>();

  if (!project) notFound();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 본인 것이 아니면 상세로 돌려보낸다. DB의 RLS가 최종 방어선이다.
  if (!user || user.id !== project.owner_id) {
    redirect(`/projects/${project.id}`);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 md:px-8 py-10">
      <Link
        href={`/projects/${project.id}`}
        className="type-caption text-ink-2 hover:text-indigo"
      >
        ← {project.title}
      </Link>

      <h1 className="type-h1 mt-3">결과물 수정하기</h1>

      <div className="mt-8">
        <ProjectForm
          action={updateProject}
          hiddenFields={{ project_id: project.id }}
          userId={user.id}
          initial={project}
          submitLabel="수정 저장하기"
        />
      </div>
    </div>
  );
}
