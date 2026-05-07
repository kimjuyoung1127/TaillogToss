import React from 'react';
import { SettingsNavRow } from './SettingsNavRow';
import { SettingsSectionCard } from './SettingsSectionCard';
import { SettingsDivider } from './SettingsDivider';

interface ServiceSettingsSectionProps {
  onOpenSubscription: () => void;
  onOpenDogSwitcher: () => void;
}

export function ServiceSettingsSection({
  onOpenSubscription,
  onOpenDogSwitcher,
}: ServiceSettingsSectionProps) {
  return (
    <SettingsSectionCard title="서비스">
      <SettingsNavRow label="구독 관리" onPress={onOpenSubscription} />
      <SettingsDivider />
      <SettingsNavRow label="내 반려견" onPress={onOpenDogSwitcher} />
    </SettingsSectionCard>
  );
}
