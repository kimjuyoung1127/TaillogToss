/**
 * 빠른 ABC 행동 기록 화면 — SegmentedControl 2탭 (빠른/상세)
 * [빠른] 탭: QuickLogForm (Chip 원탭 + 강도 + 시간)
 * [상세] 탭: ABCForm (선행-행동-결과 Accordion)
 * 저장 성공 → 대시보드 캐시 invalidate + 뒤로가기
 * Parity: UI-001, LOG-001
 */
import { createRoute, useNavigation } from '@granite-js/react-native';
import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useActiveDog } from 'stores/ActiveDogContext';
import { useCreateQuickLog, useCreateDetailedLog } from 'lib/hooks/useLogs';
import { usePageGuard } from 'lib/hooks/usePageGuard';
import { tracker } from 'lib/analytics/tracker';
import { QuickLogForm } from 'components/features/log/QuickLogForm';
import { ABCForm } from 'components/features/log/ABCForm';
import type { QuickLogInput, DetailedLogInput } from 'types/log';

export const Route = createRoute('/dashboard/quick-log', {
  component: QuickLogPage,
});

type TabKey = 'quick' | 'detailed';

function QuickLogPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('quick');
  const { activeDog } = useActiveDog();
  const navigation = useNavigation();
  const { isReady } = usePageGuard({ currentPath: '/dashboard/quick-log' });

  const quickLogMutation = useCreateQuickLog();
  const detailedLogMutation = useCreateDetailedLog();

  const handleQuickSubmit = useCallback((input: QuickLogInput) => {
    quickLogMutation.mutate(input, {
      onSuccess: () => {
        tracker.behaviorLogCreated('quick');
        navigation.goBack();
      },
    });
  }, [quickLogMutation, navigation]);

  const handleDetailedSubmit = useCallback((input: DetailedLogInput) => {
    detailedLogMutation.mutate(input, {
      onSuccess: () => {
        tracker.behaviorLogCreated('detailed');
        navigation.goBack();
      },
    });
  }, [detailedLogMutation, navigation]);

  const dogId = activeDog?.id ?? '';

  if (!isReady) return null;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Text style={styles.back}>{'\u2190'}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>빠른 기록</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.segmented}>
        <TouchableOpacity
          style={[styles.segment, activeTab === 'quick' && styles.segmentActive]}
          onPress={() => setActiveTab('quick')}
        >
          <Text style={[styles.segmentText, activeTab === 'quick' && styles.segmentTextActive]}>빠른</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.segment, activeTab === 'detailed' && styles.segmentActive]}
          onPress={() => setActiveTab('detailed')}
        >
          <Text style={[styles.segmentText, activeTab === 'detailed' && styles.segmentTextActive]}>상세</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {activeTab === 'quick' ? (
          <QuickLogForm
            dogId={dogId}
            onSubmit={handleQuickSubmit}
            isLoading={quickLogMutation.isPending}
          />
        ) : (
          <ABCForm
            dogId={dogId}
            onSubmit={handleDetailedSubmit}
            isLoading={detailedLogMutation.isPending}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  back: {
    fontSize: 22,
    color: '#202632',
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: '#202632',
  },
  placeholder: {
    width: 22,
  },
  segmented: {
    flexDirection: 'row',
    marginHorizontal: 20,
    backgroundColor: '#F4F4F5',
    borderRadius: 10,
    padding: 3,
  },
  segment: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  segmentActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  segmentText: {
    fontSize: 14,
    color: '#8B95A1',
    fontWeight: '500',
  },
  segmentTextActive: {
    color: '#202632',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    marginTop: 8,
  },
});
