# types/ — 도메인별 타입 (BE 미러 구조)

순수 TypeScript 타입/인터페이스만 포함. 런타임 코드 최소화 (상수 export만 허용).

## BE ↔ FE 미러 매핑

```
types/{domain}.ts  ↔  Backend/app/models/{domain}.py
```

## 파일 목록 (12 + index)

| 파일 | 도메인 | DogCoach 원본 | 주요 변경 |
|------|--------|-------------|----------|
| `auth.ts` | 인증/사용자 | `user.py` + `types.ts` | `kakao_sync_id` → `toss_user_key`, Role 4종 |
| `dog.ts` | 반려견 | `dog.py` | SurveyData 7단계, BehaviorType 10종 |
| `log.ts` | 행동 기록 | `log.py` | QuickLogCategory 8종, DailyActivity 6종 |
| `coaching.ts` | AI 코칭 | `coaching.py` | 6블록 구조 (무료3 + PRO3) |
| `training.ts` | 훈련 | 신규 | 커리큘럼 7종, PlanVariant A/B/C |
| `subscription.ts` | 구독/결제 | `payment.py` | Toss IAP, 2축 상태 (toss×grant) |
| `notification.ts` | 알림 | 신규 | SmartMessage, 쿨다운 정책 |
| `settings.ts` | 설정 | `types.ts` | NotificationPref, AiPersona |
| `chart.ts` | 차트 | 신규 | Radar 5축, Heatmap 7×24 |
| `api.ts` | API 공통 | 신규 | ApiResponse\<T\>, ErrorCode |
| `ads.ts` | 광고 | 신규 | AdPlacement R1/R2/R3, 무광고 폴백 |
| `b2b.ts` | B2B 확장 | SCHEMA-B2B.md | v1 숨김, 빈 인터페이스 10개 |
| `index.ts` | barrel export | — | 전체 re-export |

## 비즈니스 규칙 상수

- `IAP_PRODUCTS`: PRO ₩4,900 / 토큰10 ₩1,900 / 토큰30 ₩4,900
- `DOG_LIMITS`: 무료 1마리, PRO 5마리
- `DEFAULT_COOLDOWN`: 10분 간격, 하루 3회, 22~08시 금지
- `DEFAULT_AD_FALLBACK`: 무광고 폴백 활성, 5초 타임아웃
