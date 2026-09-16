/** 데모 모드일 때 페이지 상단에 띄우는 안내. */
export function DemoBanner() {
  return (
    <div className="bg-grad-warm text-white rounded-[14px] px-4 py-3 flex flex-wrap items-center gap-x-3 gap-y-1">
      <span className="type-label">Demo</span>
      <span className="type-caption">
        지금은 샘플 데이터로 화면만 보는 중이에요. 로그인과 저장은 동작하지
        않습니다.
      </span>
    </div>
  );
}
