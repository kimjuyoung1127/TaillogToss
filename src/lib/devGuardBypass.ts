/**
 * devGuardBypass — __DEV__ 전용 가드 우회 플래그
 * DevMenu에서 토글, evaluatePageGuard에서 체크.
 * 프로덕션 빌드에서는 참조 자체가 tree-shaking 제거됨.
 */

let _bypass = false;

export function isDevGuardBypassed(): boolean {
  return __DEV__ && _bypass;
}

export function setDevGuardBypass(val: boolean): void {
  _bypass = val;
}
