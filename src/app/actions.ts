"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type FormState = { error?: string; ok?: boolean } | null;

/** 빈 문자열을 null로. 폼에서 안 채운 선택 항목 처리용. */
function optional(value: FormDataEntryValue | null): string | null {
  const text = typeof value === "string" ? value.trim() : "";
  return text.length > 0 ? text : null;
}

function required(formData: FormData, key: string): string {
  const value = formData.get(key);
  const text = typeof value === "string" ? value.trim() : "";
  if (!text) throw new Error(`${key} 항목을 채워주세요.`);
  return text;
}

/** "Claude Code, Cursor" → ["Claude Code", "Cursor"] */
function parseTools(value: FormDataEntryValue | null): string[] {
  if (typeof value !== "string") return [];
  return value
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 10);
}

function parseHours(value: FormDataEntryValue | null): number | null {
  const text = optional(value);
  if (text === null) return null;
  const num = Number(text);
  return Number.isFinite(num) && num >= 0 ? num : null;
}

/** http(s) 링크만 허용한다. */
function validateUrl(value: string | null, label: string): string | null {
  if (value === null) return null;
  try {
    const parsed = new URL(value);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      throw new Error();
    }
    return parsed.toString();
  } catch {
    throw new Error(`${label}은(는) http로 시작하는 주소여야 해요.`);
  }
}

function projectFieldsFrom(formData: FormData) {
  return {
    title: required(formData, "title"),
    one_liner: required(formData, "one_liner"),
    problem: required(formData, "problem"),
    target_customer: required(formData, "target_customer"),
    solution: required(formData, "solution"),
    service_url: validateUrl(optional(formData.get("service_url")), "서비스 링크"),
    demo_video_url: validateUrl(
      optional(formData.get("demo_video_url")),
      "데모 영상 링크",
    ),
    thumbnail_url: optional(formData.get("thumbnail_url")),
    ai_tools: parseTools(formData.get("ai_tools")),
    build_hours: parseHours(formData.get("build_hours")),
    team_name: optional(formData.get("team_name")),
  };
}

// ── 결과물 등록 ────────────────────────────────────────────
export async function submitProject(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "로그인이 필요해요." };

  const eventId = formData.get("event_id");
  if (typeof eventId !== "string" || !eventId) {
    return { error: "회차 정보가 없어요." };
  }

  let fields;
  try {
    fields = projectFieldsFrom(formData);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "입력값을 확인해주세요." };
  }

  const { data, error } = await supabase
    .from("projects")
    .insert({ ...fields, event_id: eventId, owner_id: user.id })
    .select("id")
    .single();

  if (error) return { error: `저장하지 못했어요: ${error.message}` };

  revalidatePath("/");
  redirect(`/projects/${data.id}`);
}

// ── 결과물 수정 ────────────────────────────────────────────
export async function updateProject(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "로그인이 필요해요." };

  const projectId = formData.get("project_id");
  if (typeof projectId !== "string" || !projectId) {
    return { error: "결과물 정보가 없어요." };
  }

  let fields;
  try {
    fields = projectFieldsFrom(formData);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "입력값을 확인해주세요." };
  }

  const { error } = await supabase
    .from("projects")
    .update(fields)
    .eq("id", projectId);

  if (error) return { error: `수정하지 못했어요: ${error.message}` };

  revalidatePath(`/projects/${projectId}`);
  redirect(`/projects/${projectId}`);
}

// ── 평가 저장 (있으면 덮어쓰기) ────────────────────────────
export async function saveRating(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "로그인이 필요해요." };

  const projectId = formData.get("project_id");
  if (typeof projectId !== "string" || !projectId) {
    return { error: "결과물 정보가 없어요." };
  }

  const scores = (["fun", "completeness", "problem_value"] as const).map((key) => {
    const raw = Number(formData.get(key));
    return Number.isInteger(raw) && raw >= 1 && raw <= 5 ? raw : null;
  });

  if (scores.some((s) => s === null)) {
    return { error: "세 항목 모두 점수를 골라주세요." };
  }

  const { error } = await supabase.from("ratings").upsert(
    {
      project_id: projectId,
      rater_id: user.id,
      fun: scores[0]!,
      completeness: scores[1]!,
      problem_value: scores[2]!,
      comment: optional(formData.get("comment")),
    },
    { onConflict: "project_id,rater_id" },
  );

  if (error) {
    // RLS가 본인 프로젝트 평가를 막으면 여기로 온다.
    return {
      error: error.message.includes("row-level security")
        ? "본인이 올린 결과물은 평가할 수 없어요."
        : `평가를 저장하지 못했어요: ${error.message}`,
    };
  }

  revalidatePath(`/projects/${projectId}`);
  return { ok: true };
}

// ── 관리자: 회차 생성 ──────────────────────────────────────
export async function createEvent(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const supabase = await createClient();

  let slug: string;
  let title: string;
  try {
    slug = required(formData, "slug");
    title = required(formData, "title");
  } catch (e) {
    return { error: e instanceof Error ? e.message : "입력값을 확인해주세요." };
  }

  if (!/^[a-z0-9-]+$/.test(slug)) {
    return { error: "주소(slug)는 영문 소문자, 숫자, 하이픈만 쓸 수 있어요." };
  }

  const { error } = await supabase.from("events").insert({
    slug,
    title,
    description: optional(formData.get("description")),
    is_active: formData.get("is_active") === "on",
  });

  if (error) return { error: `회차를 만들지 못했어요: ${error.message}` };

  revalidatePath("/");
  revalidatePath("/admin");
  return { ok: true };
}

// ── 관리자: 결과물 숨기기 토글 ─────────────────────────────
export async function toggleProjectHidden(formData: FormData) {
  const projectId = formData.get("project_id");
  const hide = formData.get("hide") === "1";
  if (typeof projectId !== "string" || !projectId) return;

  const supabase = await createClient();
  await supabase.from("projects").update({ is_hidden: hide }).eq("id", projectId);

  revalidatePath("/admin");
  revalidatePath(`/projects/${projectId}`);
}
