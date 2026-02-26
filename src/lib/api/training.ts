/**
 * 훈련 API — 진행 상태 CRUD
 * Parity: UI-001
 */
import { supabase } from './supabase';
import type { TrainingProgress, CurriculumId, PlanVariant } from 'types/training';

/** 전체 훈련 진행 상태 */
export async function getTrainingProgress(dogId: string): Promise<TrainingProgress[]> {
  const { data, error } = await supabase
    .from('training_progress')
    .select('*')
    .eq('dog_id', dogId)
    .order('started_at', { ascending: false });
  if (error) throw error;
  return data as TrainingProgress[];
}

/** 특정 커리큘럼 진행 상태 */
export async function getCurriculumProgress(
  dogId: string,
  curriculumId: CurriculumId
): Promise<TrainingProgress | null> {
  const { data, error } = await supabase
    .from('training_progress')
    .select('*')
    .eq('dog_id', dogId)
    .eq('curriculum_id', curriculumId)
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data as TrainingProgress | null;
}

/** 훈련 시작 */
export async function startTraining(
  dogId: string,
  curriculumId: CurriculumId,
  variant: PlanVariant = 'A'
): Promise<TrainingProgress> {
  const { data, error } = await supabase
    .from('training_progress')
    .insert({
      dog_id: dogId,
      curriculum_id: curriculumId,
      current_day: 1,
      current_variant: variant,
      status: 'in_progress',
      completed_steps: [],
    })
    .select()
    .single();
  if (error) throw error;
  return data as TrainingProgress;
}

/** 스텝 완료 처리 */
export async function completeStep(
  progressId: string,
  stepId: string,
  currentSteps: string[]
): Promise<void> {
  const { error } = await supabase
    .from('training_progress')
    .update({ completed_steps: [...currentSteps, stepId] })
    .eq('id', progressId);
  if (error) throw error;
}

/** Plan Variant 변경 */
export async function changeVariant(
  progressId: string,
  variant: PlanVariant
): Promise<void> {
  const { error } = await supabase
    .from('training_progress')
    .update({ current_variant: variant })
    .eq('id', progressId);
  if (error) throw error;
}
