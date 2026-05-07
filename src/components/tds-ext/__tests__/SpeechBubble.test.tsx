import React from 'react';
import { render } from '@testing-library/react-native';
import { SpeechBubble } from '../SpeechBubble';

describe('SpeechBubble', () => {
  it('renders message text inside the bubble', () => {
    const { getByText } = render(
      <SpeechBubble message="조금 무서웠지만 다시 해볼게요." emotion="hopeful" />,
    );

    expect(getByText('조금 무서웠지만 다시 해볼게요.')).toBeTruthy();
  });

  it('renders fallback text when message is empty', () => {
    const { getByText } = render(<SpeechBubble message="" emotion="hopeful" />);

    expect(getByText('조금만 기다려 주세요.')).toBeTruthy();
  });
});
