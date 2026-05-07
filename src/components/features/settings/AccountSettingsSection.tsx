import React from 'react';
import { SettingsNavRow } from './SettingsNavRow';
import { SettingsSectionCard } from './SettingsSectionCard';
import { SettingsDivider } from './SettingsDivider';

interface AccountSettingsSectionProps {
  onOpenProfile: () => void;
  onOpenTerms: () => void;
  onOpenPrivacy: () => void;
}

export function AccountSettingsSection({
  onOpenProfile,
  onOpenTerms,
  onOpenPrivacy,
}: AccountSettingsSectionProps) {
  return (
    <SettingsSectionCard title="계정">
      <SettingsNavRow label="프로필 편집" onPress={onOpenProfile} />
      <SettingsDivider />
      <SettingsNavRow label="이용약관" onPress={onOpenTerms} />
      <SettingsDivider />
      <SettingsNavRow label="개인정보 처리방침" onPress={onOpenPrivacy} />
    </SettingsSectionCard>
  );
}
