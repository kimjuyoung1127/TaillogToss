/**
 * generate-report — AI 리포트 생성 Edge Function (mock AI, staff only)
 * 실 AI 연동은 사업자등록 후 교체. 현재는 규칙 기반 요약 생성 + 권한 가드 적용.
 * Parity: B2B-001
 */

import { type EdgeContext, fail, ok, type EdgeResult } from '../_shared/contracts.ts';
import {
  buildEdgeContext,
  methodNotAllowed,
  parseRequestJson,
  toJsonResponse,
} from '../_shared/httpAdapter.ts';

export interface GenerateReportRequest {
  report_id: string;
  dog_id: string;
  report_date: string;
}

type EnvGetter = (key: string) => string | undefined;

interface GenerateReportDeps {
  fetchImpl: typeof fetch;
  now: () => Date;
  getEnv: EnvGetter;
}

function defaultDeps(): GenerateReportDeps {
  return {
    fetchImpl: fetch,
    now: () => new Date(),
    getEnv: (key: string) => {
      const denoWithEnv = globalThis as { Deno?: { env?: { get: (name: string) => string | undefined } } };
      return denoWithEnv.Deno?.env?.get(key);
    },
  };
}

function isAdminRole(role: EdgeContext['role']): boolean {
  return role === 'trainer' || role === 'org_owner' || role === 'org_staff' || role === 'service_role';
}

export function createGenerateReportHandler(overrides?: Partial<GenerateReportDeps>) {
  const deps = { ...defaultDeps(), ...(overrides ?? {}) };

  return async (
    request: GenerateReportRequest,
    context: EdgeContext
  ): Promise<EdgeResult<unknown>> => {
    if (!isAdminRole(context.role)) {
      return fail('AUTH_FORBIDDEN', 'Only staff roles can generate reports', 403);
    }

    const { report_id, dog_id, report_date } = request;
    if (!report_id || !dog_id || !report_date) {
      return fail('INVALID_PARAMS', 'report_id, dog_id, report_date 필수', 400);
    }

    const supabaseUrl = deps.getEnv('SUPABASE_URL') ?? '';
    const serviceKey = deps.getEnv('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    if (!supabaseUrl || !serviceKey) {
      return fail('CONFIG_MISSING', 'SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing', 500);
    }

    try {
      // Mock AI: 규칙 기반 요약 생성
      const mockSummary =
        `${report_date} 하루 동안의 행동 기록을 분석한 결과, 전반적으로 양호한 상태를 유지했습니다.`;
      const mockNotes = '특이사항 없음. 식사와 산책 모두 정상적으로 진행되었습니다.';
      const mockCoaching =
        '꾸준한 산책과 긍정적 강화를 유지하면 더욱 안정적인 행동 패턴을 기대할 수 있습니다.';

      const updateRes = await deps.fetchImpl(`${supabaseUrl}/rest/v1/daily_reports?id=eq.${report_id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': serviceKey,
          'Authorization': `Bearer ${serviceKey}`,
          'Prefer': 'return=representation',
        },
        body: JSON.stringify({
          behavior_summary: mockSummary,
          condition_notes: mockNotes,
          ai_coaching_oneliner: mockCoaching,
          generation_status: 'generated',
          ai_model: 'mock_rule_v1',
          ai_cost_usd: 0,
          generated_at: deps.now().toISOString(),
        }),
      });

      if (!updateRes.ok) {
        const errText = await updateRes.text();
        return fail('UPDATE_FAILED', errText, 500);
      }

      const updated = (await updateRes.json()) as unknown;
      return ok(Array.isArray(updated) ? (updated[0] ?? updated) : updated);
    } catch (err) {
      return fail('INTERNAL', String(err), 500);
    }
  };
}

export const handleGenerateReport = createGenerateReportHandler();

const edgeRuntime = (globalThis as {
  Deno?: { serve: (handler: (request: Request) => Promise<Response> | Response) => void };
}).Deno;

if (edgeRuntime?.serve) {
  edgeRuntime.serve(async (request: Request) => {
    if (request.method !== 'POST') {
      return methodNotAllowed(request.method);
    }

    const body = await parseRequestJson<GenerateReportRequest>(request);
    if (!body) {
      return toJsonResponse(fail('INVALID_PARAMS', 'Invalid JSON body', 400));
    }

    const context = buildEdgeContext(request);
    const result = await handleGenerateReport(body, context);
    return toJsonResponse(result);
  });
}
