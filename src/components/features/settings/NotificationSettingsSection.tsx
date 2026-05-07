import React from 'react';
import type { NotificationPref } from 'types/settings';
import { SettingsSectionCard } from './SettingsSectionCard';
import { SettingsStatusRow } from './SettingsStatusRow';
import { SettingsToggleRow } from './SettingsToggleRow';
import { SettingsStepperRow } from './SettingsStepperRow';
import { SettingsDivider } from './SettingsDivider';

type StatusTone = 'neutral' | 'success' | 'danger';

interface NotificationSettingsSectionProps {
  notifPref: NotificationPref;
  syncStatus: { text: string; tone: StatusTone };
  onToggleChannel: (key: 'push' | 'smart_message') => void;
  onToggleType: (key: keyof NotificationPref['types']) => void;
  onToggleQuietHours: () => void;
  onShiftQuietHour: (key: 'start_hour' | 'end_hour', delta: 1 | -1) => void;
}

export function NotificationSettingsSection({
  notifPref,
  syncStatus,
  onToggleChannel,
  onToggleType,
  onToggleQuietHours,
  onShiftQuietHour,
}: NotificationSettingsSectionProps) {
  return (
    <SettingsSectionCard title="알림 설정">
      <SettingsStatusRow statusText={syncStatus.text} tone={syncStatus.tone} />
      <SettingsDivider />
      <SettingsToggleRow
        label="푸시 알림"
        value={notifPref.channels.push}
        onToggle={() => onToggleChannel('push')}
      />
      <SettingsDivider />
      <SettingsToggleRow
        label="스마트 메시지"
        value={notifPref.channels.smart_message}
        onToggle={() => onToggleChannel('smart_message')}
      />
      <SettingsDivider />
      <SettingsToggleRow
        label="기록 리마인더"
        value={notifPref.types.log_reminder}
        onToggle={() => onToggleType('log_reminder')}
      />
      <SettingsDivider />
      <SettingsToggleRow
        label="행동 급증 알림"
        description="평소보다 문제 행동 기록이 늘면 알려드려요."
        value={notifPref.types.surge_alert}
        onToggle={() => onToggleType('surge_alert')}
      />
      <SettingsDivider />
      <SettingsToggleRow
        label="코칭 완료 알림"
        value={notifPref.types.coaching_ready}
        onToggle={() => onToggleType('coaching_ready')}
      />
      <SettingsDivider />
      <SettingsToggleRow
        label="훈련 리마인더"
        value={notifPref.types.training_reminder}
        onToggle={() => onToggleType('training_reminder')}
      />
      <SettingsDivider />
      <SettingsToggleRow
        label="프로모션 알림"
        value={notifPref.types.promo}
        onToggle={() => onToggleType('promo')}
      />
      <SettingsDivider />
      <SettingsToggleRow
        label="방해 금지 시간"
        value={notifPref.quiet_hours.enabled}
        onToggle={onToggleQuietHours}
      />
      <SettingsDivider />
      <SettingsStepperRow
        label="시작 시간"
        value={notifPref.quiet_hours.start_hour}
        onDecrease={() => onShiftQuietHour('start_hour', -1)}
        onIncrease={() => onShiftQuietHour('start_hour', 1)}
        disabled={!notifPref.quiet_hours.enabled}
      />
      <SettingsDivider />
      <SettingsStepperRow
        label="종료 시간"
        value={notifPref.quiet_hours.end_hour}
        onDecrease={() => onShiftQuietHour('end_hour', -1)}
        onIncrease={() => onShiftQuietHour('end_hour', 1)}
        disabled={!notifPref.quiet_hours.enabled}
      />
    </SettingsSectionCard>
  );
}
