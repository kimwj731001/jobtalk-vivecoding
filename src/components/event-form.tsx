"use client";

import { useActionState, useState } from "react";
import { createEvent } from "@/app/actions";

export function EventForm({ demo = false }: { demo?: boolean }) {
  const [state, formAction, pending] = useActionState(createEvent, null);
  const [demoNotice, setDemoNotice] = useState(false);

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
      className="card p-5 md:p-6 space-y-4"
    >
      <h2 className="type-h2">회차 만들기</h2>

      <label className="block">
        <span className="input-label">제목</span>
        <input
          name="title"
          className="input mt-2"
          required
          placeholder="잡담회 바이브코딩 데모데이 2회차"
        />
      </label>

      <label className="block">
        <span className="input-label">주소 (slug)</span>
        <span className="input-hint block mt-0.5">
          영문 소문자, 숫자, 하이픈만 · /events/여기에-들어갑니다
        </span>
        <input
          name="slug"
          className="input mt-2"
          required
          pattern="[a-z0-9\-]+"
          placeholder="vibecoding-demoday-2"
        />
      </label>

      <label className="block">
        <span className="input-label">설명</span>
        <textarea name="description" className="input min-h-20 mt-2" />
      </label>

      <label className="flex items-center gap-2">
        <input type="checkbox" name="is_active" defaultChecked />
        <span className="type-body-m">지금 진행 중인 회차예요</span>
      </label>

      {state?.error && <p className="input-hint-error">{state.error}</p>}
      {state?.ok && <p className="type-caption text-success">만들었어요.</p>}
      {demoNotice && (
        <p className="type-caption text-orange-dark">
          데모 모드라 저장되지 않아요.
        </p>
      )}

      <button type="submit" className="btn btn-primary" disabled={pending}>
        {pending ? "만드는 중…" : "회차 만들기"}
      </button>
    </form>
  );
}
