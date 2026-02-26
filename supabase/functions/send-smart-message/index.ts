/**
 * send-smart-message — 관리자 권한/쿨다운 정책을 검증해 Smart Message를 발송한다.
 * Parity: MSG-001
 */

import { type EdgeContext, fail, ok, type EdgeResult } from '../_shared/contracts';
import { createMTLSClient, type MTLSClient } from '../_shared/mTLSClient';
import {
  edgeIdempotencyStore,
  type BeginIdempotencyResult,
  type InMemoryIdempotencyStore,
} from '../_shared/idempotency';
import {
  evaluateCooldown,
  type CooldownRecord,
} from '../_shared/cooldownPolicy';

export interface SendSmartMessageRequest {
  userId: string;
  templateCode: string;
  variables: Record<string, string>;
  idempotencyKey: string;
}

export interface SendSmartMessageResponse {
  sent: boolean;
  message_id: string;
  sent_at: string;
  noti_history: {
    user_id: string;
    template_set_code: string;
    sent_at: string;
  };
}

interface SendSmartMessageDeps {
  mTLSClient: MTLSClient;
  idempotency: InMemoryIdempotencyStore;
  getNow: () => Date;
  history: CooldownRecord[];
}

const historyStore: CooldownRecord[] = [];

function defaultDeps(): SendSmartMessageDeps {
  return {
    mTLSClient: createMTLSClient('mock'),
    idempotency: edgeIdempotencyStore,
    getNow: () => new Date(),
    history: historyStore,
  };
}

function resolveIdempotentResponse(
  begin: BeginIdempotencyResult<SendSmartMessageResponse>
): EdgeResult<SendSmartMessageResponse> | null {
  if (begin.kind === 'new') return null;

  const record = begin.record;
  if (record.status === 'completed' && record.response) {
    return ok(record.response);
  }

  return fail('IDEMPOTENCY_IN_PROGRESS', 'Request is already being processed', 409, {
    retryable: true,
  });
}

function isAdminRole(role: EdgeContext['role']): boolean {
  return role === 'trainer' || role === 'org_owner' || role === 'org_staff';
}

export function createSendSmartMessageHandler(overrides?: Partial<SendSmartMessageDeps>) {
  const deps = { ...defaultDeps(), ...(overrides ?? {}) };

  return async (
    request: SendSmartMessageRequest,
    context: EdgeContext
  ): Promise<EdgeResult<SendSmartMessageResponse>> => {
    if (!isAdminRole(context.role)) {
      return fail('AUTH_FORBIDDEN', 'Only staff roles can send smart messages', 403);
    }

    if (!request.userId || !request.templateCode || !request.idempotencyKey) {
      return fail('VALIDATION_ERROR', 'userId/templateCode/idempotencyKey are required', 400);
    }

    const begin = deps.idempotency.begin<SendSmartMessageResponse>(
      'send-smart-message',
      request.idempotencyKey
    );
    const replay = resolveIdempotentResponse(begin);
    if (replay) return replay;

    const now = deps.getNow();
    const cooldown = evaluateCooldown(deps.history, request.userId, now.getTime());
    if (!cooldown.allowed) {
      deps.idempotency.fail('send-smart-message', request.idempotencyKey);
      return fail('RATE_LIMITED', `Smart message blocked: ${cooldown.reason ?? 'UNKNOWN'}`, 429, {
        retryable: true,
        details: { retryAfterSeconds: cooldown.retryAfterSeconds ?? 0 },
      });
    }

    try {
      const sent = await deps.mTLSClient.sendSmartMessage({
        userId: request.userId,
        templateCode: request.templateCode,
        variables: request.variables,
      });

      deps.history.push({
        userId: request.userId,
        sentAt: now.getTime(),
      });

      const response: SendSmartMessageResponse = {
        sent: true,
        message_id: sent.messageId,
        sent_at: sent.sentAt,
        noti_history: {
          user_id: request.userId,
          template_set_code: request.templateCode,
          sent_at: sent.sentAt,
        },
      };

      deps.idempotency.complete('send-smart-message', request.idempotencyKey, response);
      return ok(response);
    } catch {
      deps.idempotency.fail('send-smart-message', request.idempotencyKey);
      return fail('SERVER_ERROR', 'Failed to send smart message', 502, { retryable: true });
    }
  };
}

export const handleSendSmartMessage = createSendSmartMessageHandler();
