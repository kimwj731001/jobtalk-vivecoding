import Link from "next/link";
import { formatScore } from "@/lib/rating";
import type { ProjectScores, ProjectRow } from "@/lib/types";

const PLACEHOLDER_GRADIENTS = [
  "bg-grad-main",
  "bg-grad-warm",
  "bg-grad-cool",
  "bg-grad-full",
];

/** id를 기준으로 항상 같은 그라디언트를 고른다. */
function placeholderGradient(id: string): string {
  let sum = 0;
  for (let i = 0; i < id.length; i += 1) sum += id.charCodeAt(i);
  return PLACEHOLDER_GRADIENTS[sum % PLACEHOLDER_GRADIENTS.length];
}

type Props = {
  project: ProjectRow;
  scores: ProjectScores | undefined;
};

export function ProjectCard({ project, scores }: Props) {
  const count = scores?.rating_count ?? 0;

  return (
    <Link href={`/projects/${project.id}`} className="card card-hover block">
      <div className="aspect-[16/9] bg-surface-2 relative">
        {project.thumbnail_url ? (
          // Supabase Storage 도메인이 프로젝트마다 달라 next/image 설정 대신 img를 쓴다.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={project.thumbnail_url}
            alt=""
            className="w-full h-full object-cover"
          />
        ) : (
          // 썸네일이 없으면 제목 첫 글자를 얹은 그라디언트로 대신한다.
          <div
            className={`w-full h-full ${placeholderGradient(project.id)} flex items-center justify-center`}
          >
            <span className="text-white/70 font-black text-4xl select-none">
              {project.title.trim().charAt(0)}
            </span>
          </div>
        )}
        {project.build_hours !== null && (
          <span className="absolute top-3 left-3 badge bg-white/90 text-indigo">
            ⏱ {project.build_hours}시간
          </span>
        )}
      </div>

      <div className="p-4">
        <h3 className="type-h3 line-clamp-1">{project.title}</h3>
        <p className="type-caption text-ink-2 mt-1 line-clamp-2 min-h-[2.4em]">
          {project.one_liner}
        </p>

        {project.ai_tools.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {project.ai_tools.slice(0, 3).map((tool) => (
              <span key={tool} className="badge badge-gray">
                {tool}
              </span>
            ))}
            {project.ai_tools.length > 3 && (
              <span className="badge badge-gray">
                +{project.ai_tools.length - 3}
              </span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between mt-4 pt-3 border-t border-line">
          <div className="flex items-center gap-1.5">
            <span className="type-h3 text-grad-main">
              {formatScore(scores?.avg_overall)}
            </span>
            <span className="type-caption text-ink-3">
              {count > 0 ? `· ${count}명 평가` : "· 첫 평가를 기다려요"}
            </span>
          </div>
          {project.team_name && (
            <span className="type-caption text-ink-3 truncate max-w-28">
              {project.team_name}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
