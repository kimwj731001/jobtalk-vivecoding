"use client";

import { useActionState, useState } from "react";
import type { FormState } from "@/app/actions";
import { createClient } from "@/lib/supabase/client";
import type { ProjectRow } from "@/lib/types";

const MAX_THUMB_BYTES = 5 * 1024 * 1024;

type Props = {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  /** event_id(등록) 또는 project_id(수정) */
  hiddenFields: Record<string, string>;
  userId: string;
  initial?: ProjectRow;
  submitLabel: string;
  /** 데모 모드에서는 폼을 채워볼 수만 있고 저장되지 않는다. */
  demo?: boolean;
};

export function ProjectForm({
  action,
  hiddenFields,
  userId,
  initial,
  submitLabel,
  demo = false,
}: Props) {
  const [state, formAction, pending] = useActionState(action, null);
  const [demoNotice, setDemoNotice] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState(initial?.thumbnail_url ?? "");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function handleThumbnail(file: File) {
    setUploadError(null);

    if (demo) {
      setUploadError("데모 모드에서는 이미지를 올릴 수 없어요.");
      return;
    }

    if (file.size > MAX_THUMB_BYTES) {
      setUploadError("이미지는 5MB까지 올릴 수 있어요.");
      return;
    }

    setUploading(true);
    const supabase = createClient();
    const ext = file.name.split(".").pop() ?? "png";
    // Storage 정책이 `<user_id>/…` 경로만 허용한다.
    const path = `${userId}/${Date.now()}.${ext}`;

    const { error } = await supabase.storage
      .from("thumbnails")
      .upload(path, file, { upsert: false });

    if (error) {
      setUploadError(`업로드하지 못했어요: ${error.message}`);
    } else {
      const { data } = supabase.storage.from("thumbnails").getPublicUrl(path);
      setThumbnailUrl(data.publicUrl);
    }
    setUploading(false);
  }

  return (
    <form
      action={demo ? undefined : formAction}
      onSubmit={
        demo
          ? (e) => {
              e.preventDefault();
              setDemoNotice(true);
            }
          : undefined
      }
      className="space-y-7"
    >
      {Object.entries(hiddenFields).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
      <input type="hidden" name="thumbnail_url" value={thumbnailUrl} />

      {/* ── 무엇을 만들었나요 ── */}
      <Section title="무엇을 만들었나요?">
        <Field label="제목" hint="결과물 이름을 적어주세요">
          <input
            name="title"
            className="input"
            required
            maxLength={80}
            defaultValue={initial?.title}
            placeholder="예: 회의록 요약 봇"
          />
        </Field>

        <Field label="한 줄 요약" hint="목록 카드에 보이는 문장이에요">
          <input
            name="one_liner"
            className="input"
            required
            maxLength={120}
            defaultValue={initial?.one_liner}
            placeholder="예: 녹음만 올리면 할 일까지 뽑아주는 회의록 도구"
          />
        </Field>
      </Section>

      {/* ── 어떤 문제를 푸나요 ── */}
      <Section title="어떤 문제를, 누구를 위해 푸나요?">
        <Field label="문제" hint="무엇이 불편했는지 구체적으로 적을수록 좋아요">
          <textarea
            name="problem"
            className="input min-h-28"
            required
            maxLength={600}
            defaultValue={initial?.problem}
            placeholder="예: 회의가 끝나도 할 일이 정리되지 않아 매번 다시 듣게 돼요."
          />
        </Field>

        <Field label="타겟 고객" hint="이걸 가장 반가워할 사람은 누구인가요?">
          <textarea
            name="target_customer"
            className="input min-h-20"
            required
            maxLength={400}
            defaultValue={initial?.target_customer}
            placeholder="예: 회의가 잦은 5~20인 규모 팀의 실무자"
          />
        </Field>

        <Field label="해결 방식" hint="어떻게 푸는지 간단히 설명해주세요">
          <textarea
            name="solution"
            className="input min-h-28"
            required
            maxLength={600}
            defaultValue={initial?.solution}
            placeholder="예: 녹음 파일을 올리면 화자별로 정리하고 할 일을 체크리스트로 만들어줍니다."
          />
        </Field>
      </Section>

      {/* ── 보여주기 ── */}
      <Section title="직접 볼 수 있게 해주세요">
        <Field label="서비스 링크" hint="선택 · 배포된 주소가 있다면">
          <input
            name="service_url"
            className="input"
            type="url"
            defaultValue={initial?.service_url ?? ""}
            placeholder="https://..."
          />
        </Field>

        <Field
          label="데모 영상 링크"
          hint="선택 · 링크가 죽거나 로그인이 필요할 때를 대비한 백업이에요"
        >
          <input
            name="demo_video_url"
            className="input"
            type="url"
            defaultValue={initial?.demo_video_url ?? ""}
            placeholder="https://youtu.be/..."
          />
        </Field>

        <Field label="썸네일" hint="선택 · 5MB 이하 이미지. 목록에서 가장 먼저 보여요">
          <div className="flex items-center gap-3 flex-wrap">
            {thumbnailUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={thumbnailUrl}
                alt="썸네일 미리보기"
                className="w-28 h-16 object-cover rounded-[8px] border border-line"
              />
            )}
            <input
              type="file"
              accept="image/*"
              className="type-caption"
              disabled={uploading}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleThumbnail(file);
              }}
            />
            {uploading && (
              <span className="type-caption text-ink-3">올리는 중…</span>
            )}
            {thumbnailUrl && !uploading && (
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setThumbnailUrl("")}
              >
                지우기
              </button>
            )}
          </div>
          {uploadError && <p className="input-hint-error mt-2">{uploadError}</p>}
        </Field>
      </Section>

      {/* ── 만든 과정 ── */}
      <Section title="어떻게 만들었나요?">
        <Field label="사용한 AI 툴" hint="선택 · 쉼표로 구분해주세요">
          <input
            name="ai_tools"
            className="input"
            defaultValue={initial?.ai_tools.join(", ") ?? ""}
            placeholder="Claude Code, Cursor, v0"
          />
        </Field>

        <Field label="제작 소요 시간" hint="선택 · 시간 단위 숫자">
          <input
            name="build_hours"
            className="input"
            type="number"
            min={0}
            step={0.5}
            defaultValue={initial?.build_hours ?? ""}
            placeholder="4"
          />
        </Field>

        <Field label="팀 / 만든 사람" hint="선택">
          <input
            name="team_name"
            className="input"
            maxLength={60}
            defaultValue={initial?.team_name ?? ""}
            placeholder="예: 김땡땡 · 잡담팀"
          />
        </Field>
      </Section>

      {state?.error && (
        <p className="input-hint-error type-body-m">{state.error}</p>
      )}
      {demoNotice && (
        <p className="type-body-m text-orange-dark">
          데모 모드라 저장되지 않아요. Supabase를 연결하면 실제로 등록됩니다.
        </p>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          className="btn btn-primary btn-lg"
          disabled={pending || uploading}
        >
          {pending ? "저장 중…" : submitLabel}
        </button>
      </div>
    </form>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  // fieldset/legend는 legend가 카드 테두리를 끊어 보여서 쓰지 않는다.
  return (
    <section className="card p-5 md:p-6 space-y-5">
      <h2 className="type-label text-pink-dark">{title}</h2>
      {children}
    </section>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="input-label">{label}</span>
      {hint && <span className="input-hint block mt-0.5">{hint}</span>}
      <div className="mt-2">{children}</div>
    </label>
  );
}
