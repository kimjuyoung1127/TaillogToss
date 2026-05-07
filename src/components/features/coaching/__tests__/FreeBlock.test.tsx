import React from 'react';
import { act, render } from '@testing-library/react-native';
import { DogVoiceBlockView } from '../FreeBlock';

describe('DogVoiceBlockView', () => {
  const advanceTyping = (message: string) => {
    act(() => {
      jest.advanceTimersByTime(message.length * 30 + 30);
    });
  };

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders dog voice title and typed message', () => {
    const message = '나도 천천히 배워볼게요.';
    const { getByText } = render(
      <DogVoiceBlockView
        dogName="메이"
        data={{ message, emotion: 'hopeful' }}
      />,
    );

    advanceTyping(message);

    expect(getByText('메이의 마음')).toBeTruthy();
    expect(getByText(message)).toBeTruthy();
  });

  it('keeps the dog voice block visible when backend message is empty', () => {
    const fallbackMessage = '지금 제 마음을 천천히 읽어보고 있어요.';
    const { getByText } = render(
      <DogVoiceBlockView
        dogName="메이"
        data={{ message: '', emotion: 'hopeful' }}
      />,
    );

    advanceTyping(fallbackMessage);

    expect(getByText('메이의 마음')).toBeTruthy();
    expect(getByText(fallbackMessage)).toBeTruthy();
  });
});
