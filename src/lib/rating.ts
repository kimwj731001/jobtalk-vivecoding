/**
 * 평가 3축 정의.
 * 사람마다 "5점"의 기준이 달라지지 않도록 각 점수에 앵커 문구를 붙인다.
 */

export type CriterionKey = "fun" | "completeness" | "problem_value";

export type Criterion = {
  key: CriterionKey;
  label: string;
  hint: string;
  emoji: string;
  /** index 0 = 1점 ... index 4 = 5점 */
  anchors: [string, string, string, string, string];
};

export const CRITERIA: Criterion[] = [
  {
    key: "fun",
    label: "재미",
    hint: "보고 있으면 즐거운가요?",
    emoji: "🎉",
    anchors: [
      "무난해요",
      "조금 흥미로워요",
      "재밌게 봤어요",
      "꽤 신선해요",
      "당장 친구한테 공유하고 싶어요",
    ],
  },
  {
    key: "completeness",
    label: "완성도",
    hint: "얼마나 매끄럽게 동작하나요?",
    emoji: "✨",
    anchors: [
      "아이디어 단계예요",
      "얼개는 보여요",
      "데모로는 충분해요",
      "거의 다 만들어졌어요",
      "지금 바로 써도 되겠어요",
    ],
  },
  {
    key: "problem_value",
    label: "문제해결 가치",
    hint: "진짜 문제를 풀고 있나요?",
    emoji: "🎯",
    anchors: [
      "문제가 잘 안 와닿아요",
      "있으면 좋겠네요",
      "공감돼요",
      "이런 거 찾고 있었어요",
      "이거 진짜 필요했어요",
    ],
  },
];

export const SCORE_VALUES = [1, 2, 3, 4, 5] as const;

/** 점수를 소수 한 자리 문자열로. 평가가 없으면 대시. */
export function formatScore(value: number | null | undefined): string {
  if (value === null || value === undefined) return "–";
  return value.toFixed(1);
}
