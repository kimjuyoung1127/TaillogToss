/**
 * 리포트 API — 일일 리포트 생성/조회/발송
 * Parity: B2B-001
 */
import { getTossShareLink, share } from '@apps-in-toss/framework';
import { supabase } from './supabase';
import { requestBackend, requestBackendPublic, withBackendFallback } from './backend';
import type { DailyReport, ParentInteraction, ReportTemplateType } from 'types/b2b';

interface EdgeResult<T> {
  ok: boolean;
  status: number;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

const REPORT_APP_DEEP_LINK_BASE = 'intoss://taillog-app';

export function buildReportDeepLink(shareToken: string): string {
  return `${REPORT_APP_DEEP_LINK_BASE}/parent/reports?token=${encodeURIComponent(shareToken)}`;
}

function buildReportShareMessage(tossShareUrl: string): string {
  return `테일로그 일일 리포트가 도착했어요.\n${tossShareUrl}`;
}

async function persistReportShareUrl(reportId: string, tossShareUrl: string): Promise<DailyReport> {
  const { data, error } = await supabase
    .from('daily_reports')
    .update({ toss_share_url: tossShareUrl })
    .eq('id', reportId)
    .select()
    .single();
  if (error) throw error;
  return data as DailyReport;
}

/** 리포트 목록 (조직 기준, 날짜 필터) */
export async function getOrgReports(orgId: string, date?: string): Promise<DailyReport[]> {
  return withBackendFallback(
    () => {
      const qs = date ? `?date=${encodeURIComponent(date)}` : '';
      return requestBackend<DailyReport[]>(`/api/v1/report/org/${orgId}${qs}`);
    },
    async () => {
      let query = supabase
        .from('daily_reports')
        .select('*')
        .eq('created_by_org_id', orgId)
        .order('report_date', { ascending: false });
      if (date) {
        query = query.eq('report_date', date);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data as DailyReport[];
    },
  );
}

/** 리포트 목록 (강아지 기준) */
export async function getDogReports(dogId: string): Promise<DailyReport[]> {
  return withBackendFallback(
    () => requestBackend<DailyReport[]>(`/api/v1/report/dog/${dogId}`),
    async () => {
      const { data, error } = await supabase
        .from('daily_reports')
        .select('*')
        .eq('dog_id', dogId)
        .order('report_date', { ascending: false });
      if (error) throw error;
      return data as DailyReport[];
    },
  );
}

/** 리포트 상세 조회 */
export async function getReport(reportId: string): Promise<DailyReport> {
  return withBackendFallback(
    () => requestBackend<DailyReport>(`/api/v1/report/${reportId}`),
    async () => {
      const { data, error } = await supabase
        .from('daily_reports')
        .select('*')
        .eq('id', reportId)
        .single();
      if (error) throw error;
      return data as DailyReport;
    },
  );
}

/** 공유 토큰으로 리포트 조회 (비인증 보호자) */
export async function getReportByShareToken(token: string): Promise<DailyReport> {
  return withBackendFallback(
    () => requestBackendPublic<DailyReport>(`/api/v1/report/share/${encodeURIComponent(token)}`),
    async () => {
      const { data, error } = await supabase
        .from('daily_reports')
        .select('*')
        .eq('share_token', token)
        .single();
      if (error) throw error;
      return data as DailyReport;
    },
  );
}

export async function verifyParentPhoneLast4(input: {
  share_token: string;
  last4: string;
}): Promise<boolean> {
  const last4 = input.last4.replace(/[^0-9]/g, '').slice(0, 4);
  if (last4.length !== 4) return false;

  return withBackendFallback(
    async () => {
      const result = await requestBackendPublic<{ verified: boolean }, { share_token: string; last4: string }>(
        '/api/v1/report/share/verify-parent-phone',
        {
          method: 'POST',
          body: {
            share_token: input.share_token,
            last4,
          },
        },
      );
      return result.verified;
    },
    async () => {
      const { data, error } = await supabase.rpc('verify_parent_phone_last4', {
        p_share_token: input.share_token,
        p_last_four: last4,
      });
      if (error) throw error;
      return data === true;
    },
  );
}

async function createPendingReport(input: {
  dog_id: string;
  report_date: string;
  template_type: ReportTemplateType;
  created_by_org_id?: string;
  created_by_trainer_id?: string;
}): Promise<DailyReport> {
  return withBackendFallback(
    () =>
      requestBackend<DailyReport, typeof input>('/api/v1/report/', {
        method: 'POST',
        body: input,
      }),
    async () => {
      const { data, error } = await supabase
        .from('daily_reports')
        .insert({
          dog_id: input.dog_id,
          report_date: input.report_date,
          template_type: input.template_type,
          created_by_org_id: input.created_by_org_id ?? null,
          created_by_trainer_id: input.created_by_trainer_id ?? null,
          generation_status: 'pending',
          highlight_photo_urls: [],
        })
        .select()
        .single();
      if (error) throw error;
      return data as DailyReport;
    },
  );
}

async function generateReportViaEdge(report: DailyReport): Promise<DailyReport> {
  const { data, error } = await supabase.functions.invoke<EdgeResult<DailyReport>>(
    'generate-report',
    {
      body: {
        report_id: report.id,
        dog_id: report.dog_id,
        report_date: report.report_date,
      },
    },
  );

  if (error) {
    throw new Error(error.message);
  }

  if (!data?.ok) {
    throw new Error(data?.error?.message ?? '리포트 AI 생성에 실패했어요.');
  }

  return data.data ?? getReport(report.id);
}

/** 리포트 생성 요청 (FastAPI pending row 생성 후 Edge Function 호출) */
export async function generateReport(input: {
  dog_id: string;
  report_date: string;
  template_type: ReportTemplateType;
  created_by_org_id?: string;
  created_by_trainer_id?: string;
}): Promise<DailyReport> {
  const pendingReport = await createPendingReport(input);
  return generateReportViaEdge(pendingReport);
}

async function finalizeReportShare(report: DailyReport): Promise<DailyReport> {
  const shareToken = report.share_token;
  if (!shareToken) {
    throw new Error('공유 토큰이 없어 리포트 링크를 만들 수 없어요.');
  }

  const tossShareUrl = report.toss_share_url ?? await getTossShareLink(buildReportDeepLink(shareToken));
  const updatedReport = report.toss_share_url === tossShareUrl
    ? report
    : await persistReportShareUrl(report.id, tossShareUrl);

  await share({ message: buildReportShareMessage(tossShareUrl) });
  return updatedReport;
}

/** 리포트 발송 (share_token 생성 + toss_share_url 저장 + 공유시트 호출) */
export async function sendReport(reportId: string): Promise<DailyReport> {
  const report = await withBackendFallback(
    () => requestBackend<DailyReport>(`/api/v1/report/${reportId}/send`, { method: 'PATCH' }),
    async () => {
      const shareToken = crypto.randomUUID();
      const { data, error } = await supabase
        .from('daily_reports')
        .update({
          share_token: shareToken,
          generation_status: 'sent',
          sent_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30일
        })
        .eq('id', reportId)
        .select()
        .single();
      if (error) throw error;
      return data as DailyReport;
    },
  );
  return finalizeReportShare(report);
}

/** 리포트 업데이트 (편집) */
export async function updateReport(
  reportId: string,
  updates: Partial<Pick<DailyReport, 'behavior_summary' | 'condition_notes' | 'ai_coaching_oneliner'>>
): Promise<DailyReport> {
  return withBackendFallback(
    () =>
      requestBackend<DailyReport, typeof updates>(`/api/v1/report/${reportId}`, {
        method: 'PATCH',
        body: updates,
      }),
    async () => {
      const { data, error } = await supabase
        .from('daily_reports')
        .update(updates)
        .eq('id', reportId)
        .select()
        .single();
      if (error) throw error;
      return data as DailyReport;
    },
  );
}

/** 보호자 인터랙션 생성 */
export async function createInteraction(input: {
  report_id: string;
  parent_user_id?: string;
  parent_identifier?: string;
  interaction_type: ParentInteraction['interaction_type'];
  content?: string;
}): Promise<ParentInteraction> {
  return withBackendFallback(
    () =>
      requestBackendPublic<ParentInteraction, typeof input>('/api/v1/report/interactions', {
        method: 'POST',
        body: input,
      }),
    async () => {
      const { data, error } = await supabase
        .from('parent_interactions')
        .insert({
          report_id: input.report_id,
          parent_user_id: input.parent_user_id ?? null,
          parent_identifier: input.parent_identifier ?? null,
          interaction_type: input.interaction_type,
          content: input.content ?? null,
        })
        .select()
        .single();
      if (error) throw error;
      return data as ParentInteraction;
    },
  );
}

/** 리포트 인터랙션 목록 조회 */
export async function getReportInteractions(reportId: string): Promise<ParentInteraction[]> {
  return withBackendFallback(
    () => requestBackend<ParentInteraction[]>(`/api/v1/report/${reportId}/interactions`),
    async () => {
      const { data, error } = await supabase
        .from('parent_interactions')
        .select('*')
        .eq('report_id', reportId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data as ParentInteraction[];
    },
  );
}
