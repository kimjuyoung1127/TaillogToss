/**
 * 행동 카테고리 → 아이콘 URI 매핑
 * Parity: UI-001
 */
import { ICONS } from './iconSources';

const BEHAVIOR_ICON_MAP: Record<string, string | undefined> = {
  barking:       ICONS['ic-cat-barking'],
  anxiety:       ICONS['ic-cat-anxiety'],
  aggression:    ICONS['ic-cat-aggression'],
  destructive:   ICONS['ic-cat-destructive'],
  jumping:       ICONS['ic-cat-excitement'],
  pulling:       ICONS['ic-cat-toilet'],
  biting:        ICONS['ic-cat-mounting'],
  other_behavior: ICONS['ic-cat-fear'],
  walk:          ICONS['ic-cat-walk'],
  meal:          ICONS['ic-cat-meal'],
  play:          ICONS['ic-cat-play'],
  rest:          ICONS['ic-cat-rest'],
  grooming:      ICONS['ic-cat-grooming'],
};

export function getBehaviorIcon(category: string): string | undefined {
  return BEHAVIOR_ICON_MAP[category];
}

export const BACK_ICON: string = ICONS['ic-back'] as string;
