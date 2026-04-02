# 앱인토스 퍼블리싱 레디니스 레퍼런스

> 조사일: 2026-04-02 | 출처: 앱인토스 공식 문서 + 개발자 커뮤니티

## 1. mTLS 인증서

### 1-1. 발급 절차

```
앱인토스 콘솔 → 앱 선택 → mTLS 인증서 탭 → [+ 발급받기]
```

- 다운로드: `client.crt` + `client.key`
- 유효기간: **390일**
- 다중 인증서 동시 등록 지원 (무중단 교체)

### 1-2. 적용 대상 (전체 S2S API)

| API | mTLS 필수 |
|-----|----------|
| Toss Login | Y |
| Toss Pay | Y |
| IAP 주문 검증 | Y |
| Smart Message | Y |
| 토스 포인트 | Y |

### 1-3. 서버 코드 통합

```javascript
// Node.js 예시
const agent = new https.Agent({
  cert: fs.readFileSync('client.crt'),
  key: fs.readFileSync('client.key'),
});
fetch('https://apps-in-toss-api.toss.im/...', { agent });

// Deno (Supabase Edge) 예시
const httpClient = Deno.createHttpClient({
  cert: atob(Deno.env.get('TOSS_CLIENT_CERT_BASE64')),
  key: atob(Deno.env.get('TOSS_CLIENT_KEY_BASE64')),
});
```

### 1-4. 흔한 오류

- `.crt` 파일 PEM 포맷 불일치 → 파일 포맷 확인
- `ERR_NETWORK` → mTLS 설정 자체 누락
- 만료 후 무교체 → 서비스 전면 중단

## 2. 콘솔 앱 등록

### 2-1. 필수 정보

| 항목 | 스펙 |
|------|------|
| 앱 로고 | 600x600px PNG, 불투명 배경, 각진 정사각형 |
| 앱 이름 | 최대 15자, 명사형 |
| appName 식별자 | 등록 후 변경 불가 |
| 썸네일 이미지 | 1000x1000px 또는 1932x828px PNG |
| 고객 지원 정보 | 이메일, 전화, 채팅 주소 |
| 스크린샷 | 앱스토어 수준 |

### 2-2. 사업자 등록 (수익화 필수)

개인 사업자: 사업자등록증
법인: + 등기부등본 (3개월 이내)
대리인: + 인감증명서 + 위임장 + 대표자 신분증 사본
심사: **1-2 영업일**

## 3. 4단계 심사 프로세스

총 소요: **영업일 최대 3일** (통상 2-3일)

### 3-1. 운영 심사

- 앱 이름/설명/스크린샷 정확성
- 사업자 정보 등록 완료
- 업종-서비스 유형 일치
- 고객 지원 채널 동작
- 개인정보처리방침 URL 유효
- **반려 사유**: 서류 미제출, 설명-기능 불일치, 고객 지원 미응답

### 3-2. 기능 심사

- SDK 2.x 필수 (1.x 업로드 차단)
- 번들 크기 **100MB 미만** (비압축 기준)
- mTLS 설정 후 API 정상 응답
- 크래시/ANR 없음
- 외부 결제/앱 다운로드 링크 금지
- **반려 사유**: SDK 1.x, 100MB 초과, mTLS 미설정, 외부 결제

### 3-3. 디자인 심사

- 로고 600x600px 각진 정사각형
- 탭 바 2-5개, 토스 제공 플로팅 형식만
- 색상 대비 기준 충족
- 토스 메인 UI 모방 금지
- TDS 컴포넌트 사용 필수
- **반려 사유**: 탭 바 자체 구현, 둥근 로고, 브랜드 노출 누락

### 3-4. 보안 심사

- 서버 개인정보 암호화 필수
- 개인정보처리방침 (수집 항목, 보유 기간, 위탁 업체)
- 최소 수집 원칙
- 계정 탈퇴 시 데이터 처리 명시
- **AI 서비스 추가 요건**: AI 생성물임을 사용자에게 명시
- **반려 사유**: 위탁 업체 미명시, 수집-처리 불일치, 암호화 미적용

## 4. 금지 서비스 유형 (즉시 반려)

NFT/디지털 자산 거래, 도박, 대출/보험/증권, 투자 조언, 현금 전환, 불법 콘텐츠, 유사 앱 복수 출시

## 5. TaillogToss 퍼블리싱 체크리스트

- [x] 사업자등록 완료
- [x] 앱 배포 완료 (2026-02-27)
- [ ] SDK 2.x 적용
- [ ] mTLS 인증서 발급 + 서버 통합
- [ ] 번들 크기 100MB 미만 확인
- [ ] 앱 로고 600x600 각진 정사각형 준비
- [ ] 탭 바 토스 플로팅 컴포넌트 사용 확인
- [ ] 개인정보처리방침 업데이트 (위탁 업체: Supabase, OpenAI)
- [ ] AI 코칭 결과 "AI 생성물" 명시 확인
- [ ] QR 테스트 최소 1회 완료
- [ ] 인증서 만료일 캘린더 등록 (390일)

## Sources

- [서비스 오픈 프로세스](https://developers-apps-in-toss.toss.im/intro/onboarding-process.html)
- [API 사용하기](https://developers-apps-in-toss.toss.im/development/integration-process.html)
- [콘솔에서 앱 등록하기](https://developers-apps-in-toss.toss.im/prepare/console-workspace.html)
- [사업자 등록하기](https://developers-apps-in-toss.toss.im/prepare/register-business.html)
- [서비스별 주의사항](https://developers-apps-in-toss.toss.im/intro/caution.html)
- [미니앱 브랜딩 가이드](https://developers-apps-in-toss.toss.im/design/miniapp-branding-guide.html)
- [배포하기](https://developers-apps-in-toss.toss.im/development/deploy.html)
