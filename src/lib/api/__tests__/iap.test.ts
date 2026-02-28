/**
 * iap.test.ts — IAP 래퍼 테스트 (verifyAndGrant, recoverPendingOrders, B2B 확장)
 * Parity: IAP-001, B2B-001
 */

const mockInvoke = jest.fn();
const mockFrom = jest.fn();

jest.mock('lib/api/supabase', () => ({
  supabase: {
    functions: { invoke: (...args: unknown[]) => mockInvoke(...args) },
    from: (...args: unknown[]) => mockFrom(...args),
  },
}));

import { verifyAndGrant, recoverPendingOrders, createOneTimePurchaseOrder } from '../iap';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('verifyAndGrant', () => {
  const receipt = { orderId: 'ord_1', productId: 'pro_monthly', transactionId: 'tx_1' };

  it('성공 시 true 반환', async () => {
    mockInvoke.mockResolvedValue({ data: { ok: true }, error: null });
    const result = await verifyAndGrant(receipt);
    expect(result).toBe(true);
  });

  it('Edge Function 에러 시 false 반환', async () => {
    mockInvoke.mockResolvedValue({ data: null, error: new Error('fail') });
    const result = await verifyAndGrant(receipt);
    expect(result).toBe(false);
  });

  it('grant_status=granted 시 true 반환', async () => {
    mockInvoke.mockResolvedValue({ data: { grant_status: 'granted' }, error: null });
    const result = await verifyAndGrant(receipt);
    expect(result).toBe(true);
  });

  it('B2B context 포함 시 body에 orgId/trainerUserId 전달', async () => {
    mockInvoke.mockResolvedValue({ data: { ok: true }, error: null });
    await verifyAndGrant(receipt, { orgId: 'org-1', trainerUserId: 'trainer-1' });

    expect(mockInvoke).toHaveBeenCalledWith('verify-iap-order', {
      body: expect.objectContaining({
        orgId: 'org-1',
        trainerUserId: 'trainer-1',
      }),
    });
  });

  it('B2B context 없이 호출 시 orgId 키 미포함', async () => {
    mockInvoke.mockResolvedValue({ data: { ok: true }, error: null });
    await verifyAndGrant(receipt);

    const body = mockInvoke.mock.calls[0]?.[1]?.body;
    expect(body).not.toHaveProperty('orgId');
    expect(body).not.toHaveProperty('trainerUserId');
  });
});

describe('recoverPendingOrders', () => {
  it('부분 복구: 3건 중 2건 성공 시 2 반환', async () => {
    const chainMock = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({
        data: [
          { toss_order_id: 'ord_a', product_id: 'pro_monthly', id: 'id_a' },
          { toss_order_id: 'ord_b', product_id: 'ai_token_10', id: 'id_b' },
          { toss_order_id: 'ord_c', product_id: 'ai_token_30', id: 'id_c' },
        ],
        error: null,
      }),
    };
    mockFrom.mockReturnValue(chainMock);

    // 1번째, 3번째 성공 / 2번째 실패
    mockInvoke
      .mockResolvedValueOnce({ data: { ok: true }, error: null })
      .mockResolvedValueOnce({ data: null, error: new Error('fail') })
      .mockResolvedValueOnce({ data: { ok: true }, error: null });

    const recovered = await recoverPendingOrders('user-1');
    expect(recovered).toBe(2);
  });

  it('빈 목록 시 0 반환', async () => {
    const chainMock = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({ data: [], error: null }),
    };
    mockFrom.mockReturnValue(chainMock);

    const recovered = await recoverPendingOrders('user-1');
    expect(recovered).toBe(0);
    expect(mockInvoke).not.toHaveBeenCalled();
  });
});

describe('createOneTimePurchaseOrder', () => {
  it('cleanup 호출 시 이후 onEvent 미호출', async () => {
    const onEvent = jest.fn();
    const processProductGrant = jest.fn().mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(true), 100)),
    );

    jest.useFakeTimers();
    const cleanup = createOneTimePurchaseOrder({
      options: { sku: 'pro_monthly' },
      processProductGrant,
      onEvent,
    });

    // PURCHASE_STARTED는 즉시 발생
    await Promise.resolve();
    expect(onEvent).toHaveBeenCalledWith('PURCHASE_STARTED');

    // cleanup 호출 → 이후 이벤트 차단
    cleanup();
    jest.advanceTimersByTime(200);
    await Promise.resolve();
    await Promise.resolve();

    // GRANT_COMPLETED는 발생하지 않아야 함
    expect(onEvent).not.toHaveBeenCalledWith('GRANT_COMPLETED');
    jest.useRealTimers();
  });
});
