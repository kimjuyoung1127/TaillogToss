/**
 * mTLS Client — Toss S2S 호출을 감싸는 mock 전용 구현체.
 * Parity: AUTH-001, IAP-001, MSG-001
 */

interface StatusError extends Error {
  status?: number;
  code?: string;
}

export interface TossLoginProfile {
  userKey: string;
  email?: string | null;
  name?: string | null;
  isNewUser?: boolean;
}

export interface TossOrderVerification {
  tossStatus:
    | 'PURCHASED'
    | 'PAYMENT_COMPLETED'
    | 'FAILED'
    | 'REFUNDED'
    | 'ORDER_IN_PROGRESS'
    | 'NOT_FOUND';
  amount: number;
  tossOrderId: string;
  errorCode?: string;
}

export interface SmartMessageResult {
  messageId: string;
  sentAt: string;
}

export interface PointsKeyResult {
  grantKey: string;
  expiresAt: string;
}

export interface PointsGrantResult {
  status: 'SUCCESS' | 'FAILED';
  transactionId: string;
  errorCode?: '4100' | '4109' | '4110' | '4112' | '4113';
}

export interface MTLSClient {
  exchangeAuthorizationCode(authorizationCode: string): Promise<{ accessToken: string }>;
  fetchLoginProfile(accessToken: string): Promise<TossLoginProfile>;
  verifyIapOrder(request: {
    orderId: string;
    productId: string;
    transactionId: string;
  }): Promise<TossOrderVerification>;
  sendSmartMessage(request: {
    userId: string;
    templateCode: string;
    variables: Record<string, string>;
  }): Promise<SmartMessageResult>;
  getPointsGrantKey(): Promise<PointsKeyResult>;
  executePointsGrant(request: {
    grantKey: string;
    userId: string;
    points: number;
    reasonCode: string;
  }): Promise<{ executionId: string }>;
  getPointsGrantResult(executionId: string): Promise<PointsGrantResult>;
}

class MockMTLSClient implements MTLSClient {
  private readonly retryCounter = new Map<string, number>();

  async exchangeAuthorizationCode(authorizationCode: string): Promise<{ accessToken: string }> {
    if (!authorizationCode.trim()) {
      const error = new Error('Invalid authorization code') as StatusError;
      error.status = 400;
      throw error;
    }

    return { accessToken: `mock_access_${authorizationCode}` };
  }

  async fetchLoginProfile(accessToken: string): Promise<TossLoginProfile> {
    const userKey = accessToken.replace('mock_access_', '').trim() || 'unknown';
    return {
      userKey: `toss_${userKey}`,
      email: null,
      name: null,
      isNewUser: !userKey.startsWith('existing_'),
    };
  }

  async verifyIapOrder(request: {
    orderId: string;
    productId: string;
    transactionId: string;
  }): Promise<TossOrderVerification> {
    const key = `${request.orderId}:${request.transactionId}`;
    const currentAttempts = this.retryCounter.get(key) ?? 0;

    if (request.orderId.includes('retry-500') && currentAttempts === 0) {
      this.retryCounter.set(key, currentAttempts + 1);
      const transient = new Error('Temporary Toss upstream issue') as StatusError;
      transient.status = 503;
      throw transient;
    }

    if (request.orderId.includes('not-found')) {
      return {
        tossStatus: 'NOT_FOUND',
        amount: 0,
        tossOrderId: request.orderId,
      };
    }

    if (request.orderId.includes('refund')) {
      return {
        tossStatus: 'REFUNDED',
        amount: 4900,
        tossOrderId: request.orderId,
      };
    }

    if (request.orderId.includes('fail')) {
      return {
        tossStatus: 'FAILED',
        amount: 0,
        tossOrderId: request.orderId,
        errorCode: 'IAP_VERIFY_FAILED',
      };
    }

    return {
      tossStatus: 'PAYMENT_COMPLETED',
      amount: request.productId.includes('token') ? 1900 : 4900,
      tossOrderId: request.orderId,
    };
  }

  async sendSmartMessage(request: {
    userId: string;
    templateCode: string;
    variables: Record<string, string>;
  }): Promise<SmartMessageResult> {
    const keys = Object.keys(request.variables).join('-');
    const messageId = `msg_${request.userId}_${request.templateCode}_${keys || 'none'}`;
    return {
      messageId,
      sentAt: new Date().toISOString(),
    };
  }

  async getPointsGrantKey(): Promise<PointsKeyResult> {
    return {
      grantKey: `grant_${Date.now().toString(36)}`,
      expiresAt: new Date(Date.now() + 60_000).toISOString(),
    };
  }

  async executePointsGrant(request: {
    grantKey: string;
    userId: string;
    points: number;
    reasonCode: string;
  }): Promise<{ executionId: string }> {
    const executionId = `exec_${request.userId}_${request.points}_${request.reasonCode}_${request.grantKey}`;
    return { executionId };
  }

  async getPointsGrantResult(executionId: string): Promise<PointsGrantResult> {
    if (executionId.includes('error-4109')) {
      return {
        status: 'FAILED',
        transactionId: executionId,
        errorCode: '4109',
      };
    }

    return {
      status: 'SUCCESS',
      transactionId: executionId,
    };
  }
}

export function createMTLSClient(mode: 'mock' | 'real' = 'mock'): MTLSClient {
  if (mode === 'real') {
    const error = new Error('Real mTLS mode is unavailable before business registration') as StatusError;
    error.status = 501;
    throw error;
  }

  return new MockMTLSClient();
}
