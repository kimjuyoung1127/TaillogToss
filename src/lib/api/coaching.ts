/**
 * AI 코칭 API — 코칭 결과 조회/생성
 * Parity: AI-001
 */
import { supabase } from './supabase';
import type { CoachingResult } from 'types/coaching';

/** 코칭 결과 목록 */
export async function getCoachings(dogId: string): Promise<CoachingResult[]> {
  const { data, error } = await supabase
    .from('coaching_results')
    .select('*')
    .eq('dog_id', dogId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as CoachingResult[];
}

/** 최신 코칭 결과 */
export async function getLatestCoaching(dogId: string): Promise<CoachingResult | null> {
  const { data, error } = await supabase
    .from('coaching_results')
    .select('*')
    .eq('dog_id', dogId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data as CoachingResult | null;
}

/** 코칭 피드백 제출 */
export async function submitCoachingFeedback(
  coachingId: string,
  score: 1 | 2 | 3 | 4 | 5
): Promise<void> {
  const { error } = await supabase
    .from('coaching_results')
    .update({ feedback_score: score })
    .eq('id', coachingId);
  if (error) throw error;
}
