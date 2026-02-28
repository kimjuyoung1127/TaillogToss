import { createGenerateReportHandler } from '../generate-report/index.ts';

describe('generate-report handler', () => {
  test('rejects non-admin roles', async () => {
    const handler = createGenerateReportHandler();

    const result = await handler(
      {
        report_id: 'report-1',
        dog_id: 'dog-1',
        report_date: '2026-02-28',
      },
      { clientKey: 'client-a', role: 'user' }
    );

    expect(result.ok).toBe(false);
    expect(result.status).toBe(403);
    expect(result.error?.code).toBe('AUTH_FORBIDDEN');
  });

  test('updates report for staff role', async () => {
    const fetchMock = jest.fn(async () => {
      return new Response(JSON.stringify([{ id: 'report-1', generation_status: 'generated' }]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }) as unknown as typeof fetch;

    const handler = createGenerateReportHandler({
      fetchImpl: fetchMock,
      now: () => new Date('2026-02-28T12:00:00.000Z'),
      getEnv: (key: string) => {
        if (key === 'SUPABASE_URL') return 'https://example.supabase.co';
        if (key === 'SUPABASE_SERVICE_ROLE_KEY') return 'service-key';
        return undefined;
      },
    });

    const result = await handler(
      {
        report_id: 'report-1',
        dog_id: 'dog-1',
        report_date: '2026-02-28',
      },
      { clientKey: 'client-a', role: 'trainer' }
    );

    expect(result.ok).toBe(true);
    expect(result.status).toBe(200);
    expect(result.data).toEqual({ id: 'report-1', generation_status: 'generated' });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
