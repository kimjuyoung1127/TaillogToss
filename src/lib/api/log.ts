/**
 * 행동 기록(ABC 로그) API — 빠른 기록 + 상세 기록
 * Parity: LOG-001
 */
import { supabase } from './supabase';
import type { BehaviorLog, QuickLogInput, DetailedLogInput } from 'types/log';

/** 기록 목록 조회 */
export async function getLogs(dogId: string, limit = 50): Promise<BehaviorLog[]> {
  const { data, error } = await supabase
    .from('behavior_logs')
    .select('*')
    .eq('dog_id', dogId)
    .order('occurred_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data as BehaviorLog[];
}

/** 일별 기록 조회 */
export async function getDailyLogs(dogId: string, date: string): Promise<BehaviorLog[]> {
  const start = `${date}T00:00:00`;
  const end = `${date}T23:59:59`;
  const { data, error } = await supabase
    .from('behavior_logs')
    .select('*')
    .eq('dog_id', dogId)
    .gte('occurred_at', start)
    .lte('occurred_at', end)
    .order('occurred_at', { ascending: false });
  if (error) throw error;
  return data as BehaviorLog[];
}

/** 빠른 기록 생성 */
export async function createQuickLog(input: QuickLogInput): Promise<BehaviorLog> {
  const { data, error } = await supabase
    .from('behavior_logs')
    .insert({
      dog_id: input.dog_id,
      is_quick_log: true,
      quick_category: input.category,
      intensity: input.intensity,
      occurred_at: input.occurred_at,
      memo: input.memo ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  return data as BehaviorLog;
}

/** 상세 ABC 기록 생성 */
export async function createDetailedLog(input: DetailedLogInput): Promise<BehaviorLog> {
  const { data, error } = await supabase
    .from('behavior_logs')
    .insert({
      dog_id: input.dog_id,
      is_quick_log: false,
      type_id: input.type_id,
      antecedent: input.antecedent,
      behavior: input.behavior,
      consequence: input.consequence,
      intensity: input.intensity,
      duration_minutes: input.duration_minutes ?? null,
      location: input.location ?? null,
      memo: input.memo ?? null,
      occurred_at: input.occurred_at,
    })
    .select()
    .single();
  if (error) throw error;
  return data as BehaviorLog;
}

/** 기록 삭제 */
export async function deleteLog(logId: string): Promise<void> {
  const { error } = await supabase.from('behavior_logs').delete().eq('id', logId);
  if (error) throw error;
}
