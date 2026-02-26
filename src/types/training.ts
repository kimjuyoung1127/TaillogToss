/**
 * 훈련 아카데미 도메인 타입 — 커리큘럼 7종, Plan Variant A/B/C
 * Parity: UI-001
 */

/** 커리큘럼 ID (7종) */
export type CurriculumId =
  | 'basic_obedience'
  | 'leash_manners'
  | 'separation_anxiety'
  | 'reactivity_management'
  | 'impulse_control'
  | 'socialization'
  | 'fear_desensitization';

/** 커리큘럼 접근 상태 */
export type CurriculumAccess = 'free' | 'pro' | 'locked';

/** 커리큘럼 진행 상태 */
export type CurriculumStatus = 'not_started' | 'in_progress' | 'completed';

/** Plan Variant — 난이도/방법 분기 */
export type PlanVariant = 'A' | 'B' | 'C';

/** 커리큘럼 (정적 데이터) */
export interface Curriculum {
  id: CurriculumId;
  title: string;
  description: string;
  access: CurriculumAccess;
  total_days: number; // 5~6일
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  recommended_for: string[]; // BehaviorType 매핑
  days: TrainingDay[];
}

/** 훈련 Day */
export interface TrainingDay {
  day_number: number; // 1~6
  title: string;
  description: string;
  steps: TrainingStep[];
  variant_notes: Record<PlanVariant, string>;
}

/** 훈련 Step (체크리스트 항목) */
export interface TrainingStep {
  id: string;
  order: number;
  instruction: string;
  duration_minutes: number;
  tips: string[];
  variants: Record<PlanVariant, StepVariant>;
}

/** Plan Variant별 Step 조정 */
export interface StepVariant {
  instruction_override: string | null;
  duration_override: number | null;
  difficulty_note: string;
}

/** 사용자의 훈련 진행 상태 */
export interface TrainingProgress {
  id: string;
  dog_id: string;
  curriculum_id: CurriculumId;
  current_day: number;
  current_variant: PlanVariant;
  status: CurriculumStatus;
  completed_steps: string[]; // step IDs
  memo: string | null;
  started_at: string;
  updated_at: string;
}
