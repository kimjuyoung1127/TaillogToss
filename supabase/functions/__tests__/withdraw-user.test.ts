import { handleWithdraw, extractSubFromJwt, type WithdrawDeps } from '../withdraw-user/index.ts';

// 유효한 JWT 형식 생성 (서명 검증 없이 sub만 추출)
function makeJwt(sub: string): string {
  const header = btoa(JSON.stringify({ alg: 'ES256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({ sub, exp: 9999999999 }));
  return `Bearer ${header}.${payload}.fakesig`;
}

/**
 * verifyJwtOwner는 Admin API fetch를 내부에서 호출하므로,
 * fetchFn mock이 첫 번째 호출에서 user 정보를 반환하도록 설정한다.
 */
function makeDeps(userId: string, overrides?: Partial<WithdrawDeps>): WithdrawDeps {
  const mockFetch = jest.fn()
    // 첫 호출: verifyJwtOwner — GET /auth/v1/user → { id: userId }
    .mockResolvedValueOnce(new Response(JSON.stringify({ id: userId }), { status: 200 }))
    // 이후 호출: DELETE public.users
    .mockResolvedValueOnce(new Response(null, { status: 200 }))
    // 이후 호출: DELETE auth.users
    .mockResolvedValueOnce(new Response(null, { status: 200 }));

  return {
    getEnv: (key) => ({ SUPABASE_URL: 'https://test.supabase.co', SUPABASE_SERVICE_ROLE_KEY: 'srk_test' }[key]),
    fetchFn: mockFetch,
    ...overrides,
  };
}

describe('extractSubFromJwt', () => {
  it('유효한 Bearer JWT에서 sub 추출', () => {
    const jwt = makeJwt('user-abc');
    expect(extractSubFromJwt(jwt)).toBe('user-abc');
  });

  it('null 입력 → null', () => {
    expect(extractSubFromJwt(null)).toBeNull();
  });

  it('Bearer 없으면 → null', () => {
    expect(extractSubFromJwt('token.only')).toBeNull();
  });

  it('잘못된 JWT 파트 수 → null', () => {
    expect(extractSubFromJwt('Bearer onlyone')).toBeNull();
  });
});

describe('handleWithdraw', () => {
  it('환경변수 누락 → CONFIG_MISSING 500', async () => {
    const deps: WithdrawDeps = {
      getEnv: () => undefined,
      fetchFn: jest.fn(),
    };
    const result = await handleWithdraw(makeJwt('u1'), { userId: 'u1' }, deps);
    expect(result.ok).toBe(false);
    expect(result.error?.code).toBe('CONFIG_MISSING');
    expect(result.status).toBe(500);
  });

  it('JWT 없음 → UNAUTHORIZED 401', async () => {
    const deps: WithdrawDeps = {
      getEnv: (key) => ({ SUPABASE_URL: 'https://test.supabase.co', SUPABASE_SERVICE_ROLE_KEY: 'srk' }[key]),
      fetchFn: jest.fn().mockResolvedValue(new Response('{}', { status: 401 })),
    };
    const result = await handleWithdraw(null, { userId: 'u1' }, deps);
    expect(result.ok).toBe(false);
    expect(result.error?.code).toBe('UNAUTHORIZED');
    expect(result.status).toBe(401);
  });

  it('Admin API 검증 실패 → UNAUTHORIZED 401', async () => {
    const deps: WithdrawDeps = {
      getEnv: (key) => ({ SUPABASE_URL: 'https://test.supabase.co', SUPABASE_SERVICE_ROLE_KEY: 'srk' }[key]),
      fetchFn: jest.fn().mockResolvedValue(new Response('{}', { status: 401 })),
    };
    const result = await handleWithdraw(makeJwt('u1'), { userId: 'u1' }, deps);
    expect(result.ok).toBe(false);
    expect(result.error?.code).toBe('UNAUTHORIZED');
  });

  it('userId 누락 → INVALID_PARAMS 400', async () => {
    const deps = makeDeps('u1');
    const result = await handleWithdraw(makeJwt('u1'), {}, deps);
    expect(result.ok).toBe(false);
    expect(result.error?.code).toBe('INVALID_PARAMS');
    expect(result.status).toBe(400);
  });

  it('JWT sub !== body.userId → FORBIDDEN 403', async () => {
    const deps = makeDeps('user-A');
    const result = await handleWithdraw(makeJwt('user-A'), { userId: 'user-B' }, deps);
    expect(result.ok).toBe(false);
    expect(result.error?.code).toBe('FORBIDDEN');
    expect(result.status).toBe(403);
  });

  it('DB 삭제 실패 → DB_DELETE_FAILED 500', async () => {
    const mockFetch = jest.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ id: 'u1' }), { status: 200 })) // verifyJwtOwner
      .mockResolvedValueOnce(new Response('error', { status: 500 }));                      // DELETE public.users
    const deps: WithdrawDeps = {
      getEnv: (key) => ({ SUPABASE_URL: 'https://test.supabase.co', SUPABASE_SERVICE_ROLE_KEY: 'srk' }[key]),
      fetchFn: mockFetch,
    };
    const result = await handleWithdraw(makeJwt('u1'), { userId: 'u1' }, deps);
    expect(result.ok).toBe(false);
    expect(result.error?.code).toBe('DB_DELETE_FAILED');
  });

  it('auth 삭제 실패 → AUTH_DELETE_FAILED 500', async () => {
    const mockFetch = jest.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ id: 'u1' }), { status: 200 })) // verifyJwtOwner
      .mockResolvedValueOnce(new Response(null, { status: 200 }))                          // DELETE public.users OK
      .mockResolvedValueOnce(new Response('auth error', { status: 422 }));                 // DELETE auth.users FAIL
    const deps: WithdrawDeps = {
      getEnv: (key) => ({ SUPABASE_URL: 'https://test.supabase.co', SUPABASE_SERVICE_ROLE_KEY: 'srk' }[key]),
      fetchFn: mockFetch,
    };
    const result = await handleWithdraw(makeJwt('u1'), { userId: 'u1' }, deps);
    expect(result.ok).toBe(false);
    expect(result.error?.code).toBe('AUTH_DELETE_FAILED');
  });

  it('정상 탈퇴 → withdrawn: true 200', async () => {
    const deps = makeDeps('u1');
    const result = await handleWithdraw(makeJwt('u1'), { userId: 'u1' }, deps);
    expect(result.ok).toBe(true);
    expect(result.data?.withdrawn).toBe(true);
    expect(result.status).toBe(200);
    // fetch 3번: verifyJwtOwner + DELETE public + DELETE auth
    expect((deps.fetchFn as jest.Mock)).toHaveBeenCalledTimes(3);
  });

  it('404도 성공으로 처리 (이미 삭제된 경우)', async () => {
    const mockFetch = jest.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ id: 'u1' }), { status: 200 }))
      .mockResolvedValueOnce(new Response(null, { status: 404 }))
      .mockResolvedValueOnce(new Response(null, { status: 404 }));
    const deps: WithdrawDeps = {
      getEnv: (key) => ({ SUPABASE_URL: 'https://test.supabase.co', SUPABASE_SERVICE_ROLE_KEY: 'srk' }[key]),
      fetchFn: mockFetch,
    };
    const result = await handleWithdraw(makeJwt('u1'), { userId: 'u1' }, deps);
    expect(result.ok).toBe(true);
  });

  it('verifyJwtOwner 및 DELETE URL 패턴 확인', async () => {
    const deps = makeDeps('test-uuid');
    await handleWithdraw(makeJwt('test-uuid'), { userId: 'test-uuid' }, deps);

    const calls = (deps.fetchFn as jest.Mock).mock.calls;
    // 1st: verifyJwtOwner
    expect(calls[0][0]).toContain('/auth/v1/user');
    // 2nd: DELETE public.users
    expect(calls[1][0]).toContain('/rest/v1/users?id=eq.test-uuid');
    expect(calls[1][1].method).toBe('DELETE');
    // 3rd: DELETE auth.users
    expect(calls[2][0]).toContain('/auth/v1/admin/users/test-uuid');
    expect(calls[2][1].method).toBe('DELETE');
  });
});
