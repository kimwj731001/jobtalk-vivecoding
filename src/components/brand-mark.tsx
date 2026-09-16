/** 잡담회 로고 말풍선. 디자인 시스템의 bubble-icon 규칙을 따른다. */
export function BrandMark({ size = 24 }: { size?: number }) {
  return (
    <span
      className="bubble-icon"
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg
        width={size * 0.55}
        height={size * 0.55}
        viewBox="0 0 12 12"
        fill="none"
      >
        <circle cx="2.5" cy="6" r="1.1" fill="white" />
        <circle cx="6" cy="6" r="1.1" fill="white" />
        <circle cx="9.5" cy="6" r="1.1" fill="white" />
      </svg>
    </span>
  );
}
