/**
 * Dev tool gate for private/review AIT builds.
 * EXPO_PUBLIC_SHOW_DEV_MENU=true is required even when __DEV__ is true.
 * Parity: APP-001
 */
export function isDevToolsEnabled(): boolean {
  return __DEV__ && process.env.EXPO_PUBLIC_SHOW_DEV_MENU === 'true';
}
