/**
 * 알림 API — Smart Message 발송 (Edge Function)
 * Parity: MSG-001
 */
import { supabase } from './supabase';
import type { SmartMessageRequest, NotificationHistory } from 'types/notification';

/** Smart Message 발송 (Edge Function) */
export async function sendSmartMessage(request: SmartMessageRequest): Promise<void> {
  const { error } = await supabase.functions.invoke('send-smart-message', {
    body: request,
  });
  if (error) throw error;
}

/** 발송 이력 조회 */
export async function getNotificationHistory(userId: string): Promise<NotificationHistory[]> {
  const { data, error } = await supabase
    .from('noti_history')
    .select('*')
    .eq('user_id', userId)
    .order('sent_at', { ascending: false })
    .limit(50);
  if (error) throw error;
  return data as NotificationHistory[];
}
