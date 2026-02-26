import { createSendSmartMessageHandler } from '../send-smart-message';

describe('send-smart-message handler', () => {
  test('rejects non-admin roles', async () => {
    const handler = createSendSmartMessageHandler();

    const result = await handler(
      {
        userId: 'user-1',
        templateCode: 'tpl-1',
        variables: { dogName: 'Choco' },
        idempotencyKey: 'idem-msg-1',
      },
      { clientKey: 'client-a', role: 'user' }
    );

    expect(result.ok).toBe(false);
    expect(result.status).toBe(403);
  });

  test('applies cooldown after first successful send', async () => {
    const fixedNow = new Date('2026-02-26T03:00:00.000Z'); // KST 12:00
    const handler = createSendSmartMessageHandler({ getNow: () => fixedNow, history: [] });

    const requestA = {
      userId: 'user-1',
      templateCode: 'tpl-1',
      variables: { dogName: 'Choco' },
      idempotencyKey: 'idem-msg-2',
    };

    const requestB = {
      ...requestA,
      idempotencyKey: 'idem-msg-3',
    };

    const first = await handler(requestA, { clientKey: 'client-a', role: 'trainer' });
    const second = await handler(requestB, { clientKey: 'client-a', role: 'trainer' });

    expect(first.ok).toBe(true);
    expect(second.ok).toBe(false);
    expect(second.error?.code).toBe('RATE_LIMITED');
  });
});
