"use client";

import { useActionState, useState } from "react";
import { saveRating } from "@/app/actions";
import { CRITERIA, SCORE_VALUES, type CriterionKey } from "@/lib/rating";
import type { RatingRow } from "@/lib/types";

type Props = {
  projectId: string;
  initial: RatingRow | null;
  /** 데모 모드에서는 점수를 골라볼 수만 있고 저장되지 않는다. */
  demo?: boolean;
};

export function RatingWidget({ projectId, initial, demo = false }: Props) {
  const [state, formAction, pending] = useActionState(saveRating, null);
  const [demoNotice, setDemoNotice] = useState(false);
  const [scores, setScores] = useState<Record<CriterionKey, number>>({
    fun: initial?.fun ?? 0,
    completeness: initial?.completeness ?? 0,
    problem_value: initial?.problem_value ?? 0,
  });

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
      className="card p-5 md:p-6"
    >
      <input type="hidden" name="project_id" value={projectId} />

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h2 className="type-h2">평가하기</h2>
        {initial && (
          <span className="badge badge-indigo">이미 평가했어요 · 수정 가능</span>
        )}
      </div>

      <div className="mt-6 space-y-6">
        {CRITERIA.map((criterion) => {
          const value = scores[criterion.key];
          return (
            <div key={criterion.key}>
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="type-h3">
                  {criterion.emoji} {criterion.label}
                </span>
                <span className="type-caption text-ink-3">
                  {criterion.hint}
                </span>
              </div>

              <input type="hidden" name={criterion.key} value={value || ""} />

              <div className="flex gap-2 mt-3">
                {SCORE_VALUES.map((score) => {
                  const selected = value === score;
                  return (
                    <button
                      key={score}
                      type="button"
                      aria-pressed={selected}
                      aria-label={`${criterion.label} ${score}점 — ${
                        criterion.anchors[score - 1]
                      }`}
                      onClick={() =>
                        setScores((prev) => ({ ...prev, [criterion.key]: score }))
                      }
                      className={[
                        "flex-1 h-11 rounded-[14px] border-[1.5px] font-bold transition-all",
                        selected
                          ? "bg-grad-main text-white border-transparent shadow-[0_4px_16px_rgba(231,118,175,0.3)]"
                          : "bg-white border-line text-ink-2 hover:border-indigo hover:text-indigo",
                      ].join(" ")}
                    >
                      {score}
                    </button>
                  );
                })}
              </div>

              <p className="type-caption text-ink-2 mt-2 min-h-[1.5em]">
                {value ? criterion.anchors[value - 1] : "점수를 골라주세요"}
              </p>
            </div>
          );
        })}

        <div>
          <label className="input-label" htmlFor="rating-comment">
            한마디 남기기
          </label>
          <span className="input-hint block mt-0.5">
            선택 · 점수보다 이 한 줄이 만든 사람에게 훨씬 도움이 돼요
          </span>
          <textarea
            id="rating-comment"
            name="comment"
            className="input min-h-20 mt-2"
            maxLength={300}
            defaultValue={initial?.comment ?? ""}
            placeholder="예: 온보딩이 정말 깔끔했어요. 결과 화면에 공유 버튼이 있으면 더 좋겠어요!"
          />
        </div>
      </div>

      {state?.error && <p className="input-hint-error mt-4">{state.error}</p>}
      {state?.ok && (
        <p className="type-caption text-success mt-4">저장했어요. 고마워요!</p>
      )}
      {demoNotice && (
        <p className="type-caption text-orange-dark mt-4">
          데모 모드라 저장되지 않아요. Supabase를 연결하면 실제로 기록됩니다.
        </p>
      )}

      <button
        type="submit"
        className="btn btn-primary btn-lg w-full mt-6"
        disabled={pending}
      >
        {pending ? "저장 중…" : initial ? "평가 수정하기" : "평가 남기기"}
      </button>
    </form>
  );
}
