/**
 * Pepper Rotation — 듀얼 pepper(V1/V2)를 사용해 결정적 비밀번호를 생성한다.
 * Parity: AUTH-001
 */

export interface PepperConfig {
  version: number;
  pepper: string;
}

function stableHash(input: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

export function resolvePeppersFromEnv(env: Record<string, string | undefined>): PepperConfig[] {
  const v1 = env.SUPER_SECRET_PEPPER_V1 ?? env.SUPER_SECRET_PEPPER;
  const v2 = env.SUPER_SECRET_PEPPER_V2;

  const peppers: PepperConfig[] = [];
  if (v1) peppers.push({ version: 1, pepper: v1 });
  if (v2) peppers.push({ version: 2, pepper: v2 });

  if (peppers.length === 0) {
    peppers.push({ version: 1, pepper: 'local-dev-pepper' });
  }

  return peppers.sort((a, b) => a.version - b.version);
}

export function derivePassword(tossUserKey: string, pepper: string, iterations = 12_000): string {
  const rounds = Math.max(1, Math.floor(iterations / 1000));
  let derived = `${tossUserKey}:${pepper}`;
  for (let i = 0; i < rounds; i += 1) {
    derived = stableHash(`${derived}:${i}`);
  }
  return `pbkdf2_mock_${derived}`;
}

export function deriveWithLatestPepper(
  tossUserKey: string,
  peppers: PepperConfig[]
): { password: string; pepperVersion: number } {
  const latest = peppers[peppers.length - 1] ?? { version: 1, pepper: 'local-dev-pepper' };
  return {
    password: derivePassword(tossUserKey, latest.pepper),
    pepperVersion: latest.version,
  };
}
