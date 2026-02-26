/**
 * 설정 API — 알림 선호도, AI 페르소나
 * Parity: APP-001
 */
import { supabase } from './supabase';
import type { UserSettings } from 'types/settings';
import { DEFAULT_NOTIFICATION_PREF, DEFAULT_AI_PERSONA } from 'types/settings';

/** 설정 조회 */
export async function getSettings(userId: string): Promise<UserSettings> {
  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', userId)
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  if (!data) {
    return {
      notification_pref: DEFAULT_NOTIFICATION_PREF,
      ai_persona: DEFAULT_AI_PERSONA,
      language: 'ko',
    };
  }
  return data as UserSettings;
}

/** 설정 업데이트 */
export async function updateSettings(
  userId: string,
  updates: Partial<UserSettings>
): Promise<UserSettings> {
  const { data, error } = await supabase
    .from('user_settings')
    .upsert({ user_id: userId, ...updates })
    .select()
    .single();
  if (error) throw error;
  return data as UserSettings;
}
