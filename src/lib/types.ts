export type EventRow = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  starts_at: string | null;
  ends_at: string | null;
  is_active: boolean;
  created_at: string;
};

export type ProjectRow = {
  id: string;
  event_id: string;
  owner_id: string;
  title: string;
  one_liner: string;
  problem: string;
  target_customer: string;
  solution: string;
  service_url: string | null;
  demo_video_url: string | null;
  thumbnail_url: string | null;
  ai_tools: string[];
  build_hours: number | null;
  team_name: string | null;
  is_hidden: boolean;
  created_at: string;
  updated_at: string;
};

export type ProjectScores = {
  project_id: string;
  rating_count: number;
  avg_fun: number | null;
  avg_completeness: number | null;
  avg_problem_value: number | null;
  avg_overall: number | null;
};

export type RatingRow = {
  id: string;
  project_id: string;
  rater_id: string;
  fun: number;
  completeness: number;
  problem_value: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
};

export type ProfileRow = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  is_admin: boolean;
  created_at: string;
};

/** 목록/상세에서 조인해서 쓰는 형태. */
export type ProjectWithScores = ProjectRow & {
  project_scores: ProjectScores | null;
};

export type RatingWithProfile = RatingRow & {
  profiles: Pick<ProfileRow, "display_name" | "avatar_url"> | null;
};
