import React from 'react';
import { PhotoPicker } from 'components/shared/PhotoPicker';
import { ICONS } from 'lib/data/iconSources';

interface Props {
  uri?: string;
  onSelect: (uri: string) => void;
}

const DEV_FALLBACK_PHOTO_URI = ICONS['ic-dog'] ?? '';

export function DogPhotoPicker({ uri, onSelect }: Props) {
  return (
    <PhotoPicker
      uri={uri}
      onSelect={onSelect}
      hint="반려견 사진을 등록해주세요"
      loadingHint="사진을 불러오고 있어요"
      fallbackUri={DEV_FALLBACK_PHOTO_URI}
      placeholderUri={ICONS['ic-dog']}
    />
  );
}
