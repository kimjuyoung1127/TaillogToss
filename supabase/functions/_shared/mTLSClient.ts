/**
 * mTLS Client — Toss S2S 호출을 감싸는 mock/real 구현체.
 * Real: Deno.createHttpClient + Base64 cert/key → Toss API Partner.
 * Mock: 개발/테스트용 더미 응답.
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

const TOSS_API_BASE = 'https://api-partner.toss.im';
const TOSS_APP_PATH = '/api-partner/v1/apps-in-toss';

class RealMTLSClient implements MTLSClient {
  private httpClient: Deno.HttpClient;

  constructor() {
    const certChain = Deno.env.get('TOSS_CLIENT_CERT_BASE64');
    const privateKey = Deno.env.get('TOSS_CLIENT_KEY_BASE64');
    if (!certChain || !privateKey) {
      throw new Error('TOSS_CLIENT_CERT_BASE64 and TOSS_CLIENT_KEY_BASE64 must be set');
    }
    this.httpClient = Deno.createHttpClient({
      certChain: atob(certChain),
      privateKey: atob(privateKey),
    });
  }

  private async request<T>(
    method: string,
    path: string,
    options?: { body?: unknown; headers?: Record<string, string> },
  ): Promise<T> {
    const url = `${TOSS_API_BASE}${path}`;
    const res = await fetch(url, {
      method,
      client: this.httpClient,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      body: options?.body ? JSON.stringify(options.body) : undefined,
    } as RequestInit & { client: Deno.HttpClient });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      const error = new Error(`Toss API ${method} ${path} failed: ${res.status} ${text}`) as StatusError;
      error.status = res.status;
      throw error;
    }
    return res.json();
  }

  async exchangeAuthorizationCode(authorizationCode: string): Promise<{ accessToken: string }> {
    const appKey = Deno.env.get('TOSS_APP_KEY')!;
    const result = await this.request<{ accessToken: string }>(
      'POST',
      `${TOSS_APP_PATH}/user/oauth2/generate-token`,
      { body: { appKey, authorizationCode } },
    );
    return { accessToken: result.accessToken };
  }

  async fetchLoginProfile(accessToken: string): Promise<TossLoginProfile> {
    return this.request<TossLoginProfile>(
      'GET',
      `${TOSS_APP_PATH}/user/oauth2/login-me`,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );
  }

  async verifyIapOrder(request: {
    orderId: string;
    productId: string;
    transactionId: string;
  }): Promise<TossOrderVerification> {
    return this.request<TossOrderVerification>(
      'POST',
      `${TOSS_APP_PATH}/iap/verify-order`,
      { body: request },
    );
  }

  async sendSmartMessage(request: {
    userId: string;
    templateCode: string;
    variables: Record<string, string>;
  }): Promise<SmartMessageResult> {
    return this.request<SmartMessageResult>(
      'POST',
      `${TOSS_APP_PATH}/smart-message/send`,
      { body: request },
    );
  }

  async getPointsGrantKey(): Promise<PointsKeyResult> {
    return this.request<PointsKeyResult>(
      'POST',
      `${TOSS_APP_PATH}/points/grant-key`,
    );
  }

  async executePointsGrant(request: {
    grantKey: string;
    userId: string;
    points: number;
    reasonCode: string;
  }): Promise<{ executionId: string }> {
    return this.request<{ executionId: string }>(
      'POST',
      `${TOSS_APP_PATH}/points/grant`,
      { body: request },
    );
  }

  async getPointsGrantResult(executionId: string): Promise<PointsGrantResult> {
    return this.request<PointsGrantResult>(
      'GET',
      `${TOSS_APP_PATH}/points/grant-result/${executionId}`,
    );
  }
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
    return new RealMTLSClient();
  }
  return new MockMTLSClient();
}
