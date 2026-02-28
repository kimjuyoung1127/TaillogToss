/**
 * 훈련 API — 진행 상태 CRUD
 * Parity: UI-001
 */
import { supabase } from './supabase';
import { requestBackend, withBackendFallback } from './backend';
import { getCurriculumById } from 'lib/data/curriculum';
import type { TrainingProgress, CurriculumId, PlanVariant } from 'types/training';

interface BackendTrainingStatusRow {
  id: string;
  user_id: string;
  dog_id: string;
  curriculum_id: string;
  stage_id: string;
  step_number: number;
  status: string;
  current_variant?: string;
  memo?: string | null;
  created_at: string;
}

const MISSING_RELATION_CODES = new Set(['42P01', 'PGRST205']);

function isMissingRelationError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const code = 'code' in error ? String((error as { code?: unknown }).code ?? '') : '';
  return MISSING_RELATION_CODES.has(code);
}

function normalizeVariant(value: string | undefined): PlanVariant {
  if (value === 'B' || value === 'C') return value;
  return 'A';
}

function parseDayNumber(stageId: string): number {
  const match = stageId.match(/(\d+)/);
  if (!match) return 1;
  const parsed = Number(match[1]);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

function parseStepIdentifier(stepId: string): { curriculumId: CurriculumId; day: number; stepNumber: number } | null {
  const match = stepId.match(/^(.*)_d(\d+)_s(\d+)$/);
  if (!match) return null;

  const curriculumId = match[1] as CurriculumId;
  const day = Number(match[2]);
  const stepNumber = Number(match[3]);
  if (!Number.isFinite(day) || !Number.isFinite(stepNumber)) return null;

  return { curriculumId, day, stepNumber };
}

function toStepId(curriculumId: string, day: number, stepNumber: number): string {
  const curriculum = getCurriculumById(curriculumId as CurriculumId);
  if (!curriculum) return `${curriculumId}_d${day}_s${stepNumber}`;

  const dayData = curriculum.days.find((d) => d.day_number === day);
  if (!dayData) return `${curriculumId}_d${day}_s${stepNumber}`;

  const matched = dayData.steps.find((s) => s.order === stepNumber) ?? dayData.steps[stepNumber - 1];
  return matched?.id ?? `${curriculumId}_d${day}_s${stepNumber}`;
}

function summarizeBackendRows(rows: BackendTrainingStatusRow[]): TrainingProgress[] {
  const grouped = new Map<string, BackendTrainingStatusRow[]>();
  for (const row of rows) {
    const list = grouped.get(row.curriculum_id) ?? [];
    list.push(row);
    grouped.set(row.curriculum_id, list);
  }

  const result: TrainingProgress[] = [];

  for (const [curriculumId, statusRows] of grouped.entries()) {
    const sortedRows = [...statusRows].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    );
    const latest = sortedRows[sortedRows.length - 1];
    if (!latest) continue;

    const completedStepIds = new Set<string>();
    for (const row of sortedRows) {
      if (row.status !== 'COMPLETED') continue;
      const day = parseDayNumber(row.stage_id);
      completedStepIds.add(toStepId(curriculumId, day, row.step_number));
    }

    const curriculum = getCurriculumById(curriculumId as CurriculumId);
    const totalSteps = curriculum
      ? curriculum.days.reduce((sum, day) => sum + day.steps.length, 0)
      : completedStepIds.size;

    let currentDay = parseDayNumber(latest.stage_id);
    if (curriculum) {
      currentDay = curriculum.total_days;
      for (const day of curriculum.days) {
        const allCompleted = day.steps.every((step) => completedStepIds.has(step.id));
        if (!allCompleted) {
          currentDay = day.day_number;
          break;
        }
      }
    }

    const status = totalSteps > 0 && completedStepIds.size >= totalSteps ? 'completed' : 'in_progress';
    const startedAt = sortedRows[0]?.created_at ?? latest.created_at;

    result.push({
      id: latest.id,
      dog_id: latest.dog_id,
      curriculum_id: curriculumId as CurriculumId,
      current_day: currentDay,
      current_variant: normalizeVariant(latest.current_variant),
      status,
      completed_steps: [...completedStepIds],
      memo: latest.memo ?? null,
      started_at: startedAt,
      updated_at: latest.created_at,
    });
  }

  return result;
}

async function getTrainingProgressFromSupabase(dogId: string): Promise<TrainingProgress[]> {
  const { data, error } = await supabase
    .from('training_progress')
    .select('*')
    .eq('dog_id', dogId)
    .order('started_at', { ascending: false });
  if (error) {
    if (isMissingRelationError(error)) return [];
    throw error;
  }
  return data as TrainingProgress[];
}

async function getTrainingProgressFromBackend(dogId: string): Promise<TrainingProgress[]> {
  const rows = await requestBackend<BackendTrainingStatusRow[]>(`/api/v1/training/${dogId}`);
  if (!Array.isArray(rows)) return [];
  return summarizeBackendRows(rows);
}

/** 전체 훈련 진행 상태 */
export async function getTrainingProgress(dogId: string): Promise<TrainingProgress[]> {
  return withBackendFallback(
    () => getTrainingProgressFromBackend(dogId),
    () => getTrainingProgressFromSupabase(dogId),
  );
}

/** 특정 커리큘럼 진행 상태 */
export async function getCurriculumProgress(
  dogId: string,
  curriculumId: CurriculumId
): Promise<TrainingProgress | null> {
  const progressList = await getTrainingProgress(dogId);
  return progressList.find((item) => item.curriculum_id === curriculumId) ?? null;
}

/** 훈련 시작 */
export async function startTraining(
  dogId: string,
  curriculumId: CurriculumId,
  variant: PlanVariant = 'A'
): Promise<TrainingProgress> {
  return withBackendFallback<TrainingProgress>(
    async () => {
      const created = await requestBackend<
        BackendTrainingStatusRow,
        {
          dog_id: string;
          curriculum_id: string;
          stage_id: string;
          step_number: number;
          status: string;
          current_variant: string;
          memo: string | null;
        }
      >('/api/v1/training/status', {
        method: 'POST',
        body: {
          dog_id: dogId,
          curriculum_id: curriculumId,
          stage_id: 'day_1',
          step_number: 0,
          status: 'HIDDEN_BY_AI',
          current_variant: variant,
          memo: null,
        },
      });
      return {
        id: created.id,
        dog_id: created.dog_id,
        curriculum_id: curriculumId,
        current_day: 1,
        current_variant: normalizeVariant(created.current_variant),
        status: 'in_progress',
        completed_steps: [],
        memo: created.memo ?? null,
        started_at: created.created_at,
        updated_at: created.created_at,
      };
    },
    async () => {
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
    },
  );
}

/** 스텝 완료 처리 */
export async function completeStep(
  progressId: string,
  stepId: string,
  currentSteps: string[],
  dogId: string,
): Promise<void> {
  return withBackendFallback(
    async () => {
      const parsed = parseStepIdentifier(stepId);
      if (!parsed) {
        throw new Error('TRAINING_STEP_ID_INVALID');
      }
      await requestBackend('/api/v1/training/status', {
        method: 'POST',
        body: {
          dog_id: dogId,
          curriculum_id: parsed.curriculumId,
          stage_id: `day_${parsed.day}`,
          step_number: parsed.stepNumber,
          status: 'COMPLETED',
          current_variant: 'A',
          memo: null,
        },
      });
    },
    async () => {
      const { error } = await supabase
        .from('training_progress')
        .update({ completed_steps: [...currentSteps, stepId] })
        .eq('id', progressId);
      if (error) {
        if (isMissingRelationError(error)) return;
        throw error;
      }
    },
  );
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
