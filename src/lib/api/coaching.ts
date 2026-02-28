/**
 * AI 코칭 API — 코칭 결과 조회/생성
 * Parity: AI-001
 */
import { supabase } from './supabase';
import { requestBackend, withBackendFallback } from './backend';
import type { CoachingResult } from 'types/coaching';

async function getCoachingsFromSupabase(dogId: string): Promise<CoachingResult[]> {
  const { data, error } = await supabase
    .from('ai_coaching')
    .select('*')
    .eq('dog_id', dogId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as CoachingResult[];
}

/** 코칭 결과 목록 */
export async function getCoachings(dogId: string): Promise<CoachingResult[]> {
  return withBackendFallback(
    () => requestBackend<CoachingResult[]>(`/api/v1/coaching/${dogId}`),
    () => getCoachingsFromSupabase(dogId),
  );
}

async function getLatestCoachingFromSupabase(dogId: string): Promise<CoachingResult | null> {
  const { data, error } = await supabase
    .from('ai_coaching')
    .select('*')
    .eq('dog_id', dogId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data as CoachingResult | null;
}

/** 최신 코칭 결과 */
export async function getLatestCoaching(dogId: string): Promise<CoachingResult | null> {
  return withBackendFallback(
    () => requestBackend<CoachingResult | null>(`/api/v1/coaching/${dogId}/latest`),
    () => getLatestCoachingFromSupabase(dogId),
  );
}

async function submitCoachingFeedbackToSupabase(
  coachingId: string,
  score: 1 | 2 | 3 | 4 | 5,
): Promise<void> {
  const { error } = await supabase
    .from('ai_coaching')
    .update({ feedback_score: score })
    .eq('id', coachingId);
  if (error) throw error;
}

/** 코칭 피드백 제출 */
export async function submitCoachingFeedback(
  coachingId: string,
  score: 1 | 2 | 3 | 4 | 5
): Promise<void> {
  return withBackendFallback(
    () => requestBackend<void, { score: number }>(`/api/v1/coaching/${coachingId}/feedback`, {
      method: 'PATCH',
      body: { score },
    }),
    () => submitCoachingFeedbackToSupabase(coachingId, score),
  );
}
