import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { LockedBlock, RiskSignalsView, UnlockedBlock } from '../LockedBlock';

describe('LockedBlock previewItems (Phase 5)', () => {
  // meta.label은 blockLabel + lockTitle 두 곳에 렌더되므로 unique한 previewItems로만 검증
  it('renders next_7_days preview category + 1줄 힌트 항목', () => {
    const { getByText, getByTestId } = render(<LockedBlock blockKey="next_7_days" />);
    expect(getByText('이 블록에서 확인할 수 있어요')).toBeTruthy();
    expect(getByTestId('locked-block-preview')).toBeTruthy();
    expect(getByText('날짜별 초점·목표')).toBeTruthy();
    expect(getByText('구체적 연습 (시간·빈도)')).toBeTruthy();
    expect(getByText('장소·준비물')).toBeTruthy();
    expect(getByText('성공 기준·다음 단계')).toBeTruthy();
  });

  it('renders risk_signals preview items', () => {
    const { getByText } = render(<LockedBlock blockKey="risk_signals" />);
    expect(getByText('경고 신호 식별')).toBeTruthy();
    expect(getByText('심각도 평가')).toBeTruthy();
    expect(getByText('즉시 대응법')).toBeTruthy();
    expect(getByText('전문가 상담 기준')).toBeTruthy();
  });

  it('renders consultation_questions preview items', () => {
    const { getByText } = render(<LockedBlock blockKey="consultation_questions" />);
    expect(getByText('기질·성향 확인')).toBeTruthy();
    expect(getByText('건강상 원인')).toBeTruthy();
    expect(getByText('실전 기법·장비')).toBeTruthy();
  });

  it('shows PRO 전용 콘텐츠 lock badge alongside preview', () => {
    const { getByText } = render(<LockedBlock blockKey="next_7_days" />);
    expect(getByText('PRO 전용 콘텐츠')).toBeTruthy();
  });
});

describe('UnlockedBlock', () => {
  it('keeps risk content collapsed until the drawer is opened', () => {
    const { getAllByText, getByText, queryByText } = render(
      <UnlockedBlock blockKey="risk_signals" defaultCollapsed>
        <RiskSignalsView
          data={{
            overall_risk: 'medium',
            signals: [
              {
                type: 'threshold management',
                description: 'Trigger stacking can make barking worse.',
                severity: 'medium',
                recommendation: 'Avoid forced exposure.',
              },
            ],
          }}
        />
      </UnlockedBlock>,
    );

    expect(getByText('위험 신호 분석')).toBeTruthy();
    expect(queryByText('전체 위험도')).toBeNull();

    fireEvent.press(getByText('열기'));

    expect(getByText('전체 위험도')).toBeTruthy();
    expect(getByText('감당 가능한 선 지키기')).toBeTruthy();
    expect(getAllByText('맞춤 안내').length).toBeGreaterThan(0);
  });
});
