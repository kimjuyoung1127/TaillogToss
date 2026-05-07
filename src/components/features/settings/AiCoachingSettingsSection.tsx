import React from 'react';
import type { AiPersona } from 'types/settings';
import { SettingsNavRow } from './SettingsNavRow';
import { SettingsSectionCard } from './SettingsSectionCard';
import { SettingsDivider } from './SettingsDivider';

interface AiCoachingSettingsSectionProps {
  aiPersona: AiPersona;
  onToggleTone: () => void;
  onTogglePerspective: () => void;
}

export function AiCoachingSettingsSection({
  aiPersona,
  onToggleTone,
  onTogglePerspective,
}: AiCoachingSettingsSectionProps) {
  return (
    <SettingsSectionCard title="AI 코칭">
      <SettingsNavRow
        label="코칭 톤"
        rightLabel={aiPersona.tone === 'empathetic' ? '공감형' : '솔루션형'}
        onPress={onToggleTone}
      />
      <SettingsDivider />
      <SettingsNavRow
        label="코칭 관점"
        rightLabel={aiPersona.perspective === 'coach' ? '코치 관점' : '강아지 관점'}
        onPress={onTogglePerspective}
      />
    </SettingsSectionCard>
  );
}
