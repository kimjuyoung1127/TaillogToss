-- ============================================================
-- TaillogToss Coaching Seed Data (3 Scenarios)
-- Usage: psql -f coaching_seed.sql  OR  Supabase MCP execute_sql
-- Cleanup: Run coaching_seed_cleanup.sql before production
-- ============================================================

-- Deterministic UUIDs for referential integrity
-- Scenario 1: New user (3 logs, 0 coaching)
-- Scenario 2: Active user (25 logs, 2 coaching)
-- Scenario 3: Heavy user (80 logs, 5 coaching)

BEGIN;

-- ============================================================
-- USERS
-- ============================================================
INSERT INTO users (id, toss_user_key, role, status, provider, timezone)
VALUES
  ('a0000001-0000-0000-0000-000000000001', 'seed-new-user',    'USER', 'ACTIVE', 'toss', 'Asia/Seoul'),
  ('a0000001-0000-0000-0000-000000000002', 'seed-active-user', 'USER', 'ACTIVE', 'toss', 'Asia/Seoul'),
  ('a0000001-0000-0000-0000-000000000003', 'seed-heavy-user',  'USER', 'ACTIVE', 'toss', 'Asia/Seoul')
ON CONFLICT (toss_user_key) DO NOTHING;

-- ============================================================
-- SUBSCRIPTIONS
-- ============================================================
INSERT INTO subscriptions (id, user_id, plan_type, is_active, ai_tokens_remaining, ai_tokens_total)
VALUES
  ('b0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000001', 'FREE',        false, 0,  0),
  ('b0000001-0000-0000-0000-000000000002', 'a0000001-0000-0000-0000-000000000002', 'FREE',        false, 0,  0),
  ('b0000001-0000-0000-0000-000000000003', 'a0000001-0000-0000-0000-000000000003', 'PRO_MONTHLY', true,  50, 100)
ON CONFLICT DO NOTHING;

-- ============================================================
-- DOGS
-- ============================================================
INSERT INTO dogs (id, user_id, name, breed, birth_date, sex, weight_kg)
VALUES
  ('d0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000001', '초코',   '푸들',       '2024-06-15', 'MALE',            4.5),
  ('d0000001-0000-0000-0000-000000000002', 'a0000001-0000-0000-0000-000000000002', '뽀미',   '포메라니안', '2023-03-20', 'FEMALE_NEUTERED', 3.2),
  ('d0000001-0000-0000-0000-000000000003', 'a0000001-0000-0000-0000-000000000003', '달이',   '비숑프리제', '2022-01-10', 'MALE_NEUTERED',   5.8)
ON CONFLICT DO NOTHING;

-- ============================================================
-- DOG_ENV
-- ============================================================
INSERT INTO dog_env (id, dog_id, chronic_issues, triggers, household_info)
VALUES
  ('e0000001-0000-0000-0000-000000000001', 'd0000001-0000-0000-0000-000000000001',
   '{"top_issues": ["barking"]}',
   '{"ids": ["doorbell"]}',
   '{"members": 2, "has_children": false}'
  ),
  ('e0000001-0000-0000-0000-000000000002', 'd0000001-0000-0000-0000-000000000002',
   '{"top_issues": ["anxiety", "barking"]}',
   '{"ids": ["separation", "stranger"]}',
   '{"members": 1, "has_children": false}'
  ),
  ('e0000001-0000-0000-0000-000000000003', 'd0000001-0000-0000-0000-000000000003',
   '{"top_issues": ["aggression", "anxiety", "destructive"]}',
   '{"ids": ["other_dogs", "loud_noise", "car_ride"]}',
   '{"members": 3, "has_children": true}'
  )
ON CONFLICT DO NOTHING;

-- ============================================================
-- SCENARIO 1: New User — 3 logs, 0 coaching
-- ============================================================
INSERT INTO behavior_logs (id, dog_id, is_quick_log, quick_category, intensity, occurred_at)
VALUES
  ('f1000001-0001-0000-0000-000000000001', 'd0000001-0000-0000-0000-000000000001', true, 'barking',  6, NOW() - INTERVAL '2 days' + INTERVAL '9 hours'),
  ('f1000001-0001-0000-0000-000000000002', 'd0000001-0000-0000-0000-000000000001', true, 'barking',  5, NOW() - INTERVAL '1 day'  + INTERVAL '14 hours'),
  ('f1000001-0001-0000-0000-000000000003', 'd0000001-0000-0000-0000-000000000001', true, 'jumping',  4, NOW() - INTERVAL '3 hours')
ON CONFLICT DO NOTHING;

-- ============================================================
-- SCENARIO 2: Active User — 25 logs (2 weeks), 2 coaching
-- ============================================================

-- Logs: 8 categories distributed across 14 days
INSERT INTO behavior_logs (id, dog_id, is_quick_log, quick_category, intensity, behavior, antecedent, consequence, occurred_at)
VALUES
  -- Week 1
  ('f2000001-0001-0000-0000-000000000001', 'd0000001-0000-0000-0000-000000000002', true,  'anxiety',    7, NULL, NULL, NULL, NOW() - INTERVAL '13 days' + INTERVAL '8 hours'),
  ('f2000001-0001-0000-0000-000000000002', 'd0000001-0000-0000-0000-000000000002', true,  'barking',    6, NULL, NULL, NULL, NOW() - INTERVAL '13 days' + INTERVAL '18 hours'),
  ('f2000001-0001-0000-0000-000000000003', 'd0000001-0000-0000-0000-000000000002', true,  'anxiety',    8, NULL, NULL, NULL, NOW() - INTERVAL '12 days' + INTERVAL '9 hours'),
  ('f2000001-0001-0000-0000-000000000004', 'd0000001-0000-0000-0000-000000000002', false, 'anxiety',    7, '소파 뜯기', '외출 준비', '진정 후 보상', NOW() - INTERVAL '11 days' + INTERVAL '10 hours'),
  ('f2000001-0001-0000-0000-000000000005', 'd0000001-0000-0000-0000-000000000002', true,  'barking',    5, NULL, NULL, NULL, NOW() - INTERVAL '11 days' + INTERVAL '20 hours'),
  ('f2000001-0001-0000-0000-000000000006', 'd0000001-0000-0000-0000-000000000002', true,  'jumping',    4, NULL, NULL, NULL, NOW() - INTERVAL '10 days' + INTERVAL '7 hours'),
  ('f2000001-0001-0000-0000-000000000007', 'd0000001-0000-0000-0000-000000000002', true,  'anxiety',    6, NULL, NULL, NULL, NOW() - INTERVAL '10 days' + INTERVAL '15 hours'),
  ('f2000001-0001-0000-0000-000000000008', 'd0000001-0000-0000-0000-000000000002', true,  'destructive',5, NULL, NULL, NULL, NOW() - INTERVAL '9 days'  + INTERVAL '12 hours'),
  ('f2000001-0001-0000-0000-000000000009', 'd0000001-0000-0000-0000-000000000002', true,  'barking',    4, NULL, NULL, NULL, NOW() - INTERVAL '9 days'  + INTERVAL '22 hours'),
  ('f2000001-0001-0000-0000-000000000010', 'd0000001-0000-0000-0000-000000000002', true,  'anxiety',    5, NULL, NULL, NULL, NOW() - INTERVAL '8 days'  + INTERVAL '8 hours'),
  ('f2000001-0001-0000-0000-000000000011', 'd0000001-0000-0000-0000-000000000002', false, 'barking',    6, '택배 배달 시 짖음', '초인종 소리', '무시 후 진정', NOW() - INTERVAL '8 days' + INTERVAL '14 hours'),
  ('f2000001-0001-0000-0000-000000000012', 'd0000001-0000-0000-0000-000000000002', true,  'biting',     3, NULL, NULL, NULL, NOW() - INTERVAL '7 days'  + INTERVAL '19 hours'),
  -- Week 2 (improving)
  ('f2000001-0001-0000-0000-000000000013', 'd0000001-0000-0000-0000-000000000002', true,  'anxiety',    5, NULL, NULL, NULL, NOW() - INTERVAL '6 days'  + INTERVAL '9 hours'),
  ('f2000001-0001-0000-0000-000000000014', 'd0000001-0000-0000-0000-000000000002', true,  'barking',    4, NULL, NULL, NULL, NOW() - INTERVAL '6 days'  + INTERVAL '17 hours'),
  ('f2000001-0001-0000-0000-000000000015', 'd0000001-0000-0000-0000-000000000002', true,  'anxiety',    4, NULL, NULL, NULL, NOW() - INTERVAL '5 days'  + INTERVAL '10 hours'),
  ('f2000001-0001-0000-0000-000000000016', 'd0000001-0000-0000-0000-000000000002', true,  'jumping',    3, NULL, NULL, NULL, NOW() - INTERVAL '4 days'  + INTERVAL '8 hours'),
  ('f2000001-0001-0000-0000-000000000017', 'd0000001-0000-0000-0000-000000000002', true,  'barking',    3, NULL, NULL, NULL, NOW() - INTERVAL '4 days'  + INTERVAL '20 hours'),
  ('f2000001-0001-0000-0000-000000000018', 'd0000001-0000-0000-0000-000000000002', false, 'anxiety',    4, '혼자 있을 때 낑낑', '외출', '10분 후 진정', NOW() - INTERVAL '3 days' + INTERVAL '11 hours'),
  ('f2000001-0001-0000-0000-000000000019', 'd0000001-0000-0000-0000-000000000002', true,  'barking',    3, NULL, NULL, NULL, NOW() - INTERVAL '3 days'  + INTERVAL '19 hours'),
  ('f2000001-0001-0000-0000-000000000020', 'd0000001-0000-0000-0000-000000000002', true,  'anxiety',    3, NULL, NULL, NULL, NOW() - INTERVAL '2 days'  + INTERVAL '9 hours'),
  ('f2000001-0001-0000-0000-000000000021', 'd0000001-0000-0000-0000-000000000002', true,  'destructive',3, NULL, NULL, NULL, NOW() - INTERVAL '2 days'  + INTERVAL '16 hours'),
  ('f2000001-0001-0000-0000-000000000022', 'd0000001-0000-0000-0000-000000000002', true,  'barking',    2, NULL, NULL, NULL, NOW() - INTERVAL '1 day'   + INTERVAL '8 hours'),
  ('f2000001-0001-0000-0000-000000000023', 'd0000001-0000-0000-0000-000000000002', true,  'anxiety',    3, NULL, NULL, NULL, NOW() - INTERVAL '1 day'   + INTERVAL '15 hours'),
  ('f2000001-0001-0000-0000-000000000024', 'd0000001-0000-0000-0000-000000000002', true,  'barking',    2, NULL, NULL, NULL, NOW() - INTERVAL '4 hours'),
  ('f2000001-0001-0000-0000-000000000025', 'd0000001-0000-0000-0000-000000000002', true,  'anxiety',    2, NULL, NULL, NULL, NOW() - INTERVAL '1 hour')
ON CONFLICT DO NOTHING;

-- Coaching: 2 records (DAILY, trend: stable → improving)
INSERT INTO ai_coaching (id, dog_id, report_type, blocks, feedback_score, ai_tokens_used, created_at)
VALUES
  ('c2000001-0001-0000-0000-000000000001', 'd0000001-0000-0000-0000-000000000002', 'DAILY',
   '{
     "insight": {
       "trend": "stable",
       "title": "분리불안과 짖음이 주요 패턴이에요",
       "key_patterns": ["분리불안", "초인종 반응", "저녁 시간대 집중"],
       "summary": "뽀미는 혼자 있을 때 불안해하고, 초인종에 반응하는 패턴이 뚜렷해요."
     },
     "action_plan": {
       "items": [
         {"id": "ap1", "text": "외출 전 10분 산책으로 에너지 발산", "priority": "high"},
         {"id": "ap2", "text": "초인종 탈감작 훈련 시작 (조용할 때 간식 제공)", "priority": "high"},
         {"id": "ap3", "text": "혼자 있는 시간 점진적 늘리기 (5분→10분→20분)", "priority": "medium"},
         {"id": "ap4", "text": "저녁 시간대 안정적인 루틴 만들기", "priority": "low"}
       ]
     },
     "dog_voice": {
       "message": "나 혼자 있으면 엄마가 안 돌아올까봐 무서워... 조금씩 연습하면 괜찮아질 수 있을까?",
       "emotion": "anxious"
     },
     "next_7_days": [
       {"day": 1, "focus": "분리불안 기초", "tasks": ["5분 혼자두기 연습", "외출 전 산책"]},
       {"day": 2, "focus": "초인종 훈련", "tasks": ["초인종 소리 → 간식 연결", "낮은 볼륨부터 시작"]},
       {"day": 3, "focus": "에너지 관리", "tasks": ["아침 15분 산책", "노즈워크 놀이"]},
       {"day": 4, "focus": "분리불안 확장", "tasks": ["10분 혼자두기", "안정 장소 만들기"]},
       {"day": 5, "focus": "짖음 관리", "tasks": ["무시하기 연습", "조용할 때 보상"]},
       {"day": 6, "focus": "복합 훈련", "tasks": ["초인종 + 혼자두기 복합", "진정 패턴 강화"]},
       {"day": 7, "focus": "리뷰", "tasks": ["이번 주 변화 기록", "다음 주 계획 세우기"]}
     ],
     "risk_signals": {
       "overall_risk": "moderate",
       "signals": [
         {"label": "분리불안 심화 가능성", "severity": "warning", "recommendation": "2주 내 개선 없으면 전문가 상담 권장"},
         {"label": "파괴행동 주의", "severity": "info", "recommendation": "혼자 있을 때 안전한 공간 확보"}
       ]
     },
     "consultation": {
       "recommended_specialist": "행동전문수의사",
       "reason": "분리불안이 2주 이상 지속되고 있어요",
       "questions": ["분리불안 약물치료 필요성", "행동수정 프로그램 추천", "환경 개선 방법"]
     }
   }',
   4, 380, NOW() - INTERVAL '7 days'),

  ('c2000001-0001-0000-0000-000000000002', 'd0000001-0000-0000-0000-000000000002', 'DAILY',
   '{
     "insight": {
       "trend": "improving",
       "title": "불안 강도가 줄어들고 있어요!",
       "key_patterns": ["분리불안 개선", "짖음 빈도 감소", "파괴행동 감소"],
       "summary": "지난주 대비 불안 강도가 30% 낮아졌어요. 꾸준히 잘하고 있어요!"
     },
     "action_plan": {
       "items": [
         {"id": "ap1", "text": "혼자두기 시간 20분으로 확장", "priority": "high"},
         {"id": "ap2", "text": "초인종 훈련 중간 볼륨 단계 진행", "priority": "high"},
         {"id": "ap3", "text": "산책 시간을 20분으로 늘리기", "priority": "medium"},
         {"id": "ap4", "text": "노즈워크 난이도 올리기", "priority": "low"}
       ]
     },
     "dog_voice": {
       "message": "요즘 혼자 있어도 조금 덜 무서워! 엄마가 꼭 돌아온다는 걸 알겠어.",
       "emotion": "hopeful"
     },
     "next_7_days": [
       {"day": 1, "focus": "혼자두기 확장", "tasks": ["20분 혼자두기 도전", "성공 시 큰 보상"]},
       {"day": 2, "focus": "초인종 레벨업", "tasks": ["중간 볼륨 초인종", "문 여는 연습 추가"]},
       {"day": 3, "focus": "산책 강화", "tasks": ["20분 산책", "다양한 경로 탐색"]},
       {"day": 4, "focus": "자립 훈련", "tasks": ["다른 방에서 지내기", "안정 신호 강화"]},
       {"day": 5, "focus": "사회화", "tasks": ["짧은 외부인 접촉", "조용한 인사 연습"]},
       {"day": 6, "focus": "종합 연습", "tasks": ["일상 시뮬레이션", "전체 루틴 점검"]},
       {"day": 7, "focus": "자유의 날", "tasks": ["가벼운 놀이 위주", "스트레스 해소"]}
     ],
     "risk_signals": {
       "overall_risk": "low",
       "signals": [
         {"label": "꾸준한 개선 추세", "severity": "info", "recommendation": "현재 루틴 유지하면서 점진적 확장"}
       ]
     },
     "consultation": {
       "recommended_specialist": "반려견 행동전문가",
       "reason": "현재 개선 추세를 유지하기 위한 주기적 모니터링 권장",
       "questions": ["현재 진행 상황 적절한지", "다음 단계 가이드"]
     }
   }',
   5, 410, NOW() - INTERVAL '1 day');

-- Action tracker for active user coaching #1 (partial completion)
INSERT INTO action_tracker (id, coaching_id, action_item_id, is_completed, completed_at)
VALUES
  ('t2000001-0001-0000-0000-000000000001', 'c2000001-0001-0000-0000-000000000001', 'ap1', true,  NOW() - INTERVAL '6 days'),
  ('t2000001-0001-0000-0000-000000000002', 'c2000001-0001-0000-0000-000000000001', 'ap2', true,  NOW() - INTERVAL '5 days'),
  ('t2000001-0001-0000-0000-000000000003', 'c2000001-0001-0000-0000-000000000001', 'ap3', false, NULL),
  ('t2000001-0001-0000-0000-000000000004', 'c2000001-0001-0000-0000-000000000001', 'ap4', false, NULL)
ON CONFLICT DO NOTHING;

-- ============================================================
-- SCENARIO 3: Heavy User — 80 logs (2 months), 5 coaching
-- ============================================================

-- Generate 80 logs across 60 days, 8 categories distributed
-- Using generate_series for compact notation
INSERT INTO behavior_logs (id, dog_id, is_quick_log, quick_category, intensity, behavior, antecedent, consequence, occurred_at)
SELECT
  ('f3' || lpad(n::text, 6, '0') || '-0001-0000-0000-000000000001')::uuid,
  'd0000001-0000-0000-0000-000000000003',
  CASE WHEN n % 5 = 0 THEN false ELSE true END,
  (ARRAY['aggression','anxiety','barking','destructive','biting','jumping','pulling','other_behavior'])[1 + (n % 8)],
  CASE
    WHEN n <= 30 THEN 5 + (n % 4)   -- early: high intensity (5-8)
    WHEN n <= 55 THEN 3 + (n % 4)   -- mid: medium (3-6)
    ELSE 2 + (n % 3)                 -- recent: lower (2-4)
  END,
  CASE WHEN n % 5 = 0 THEN '상세 행동 기록 #' || n ELSE NULL END,
  CASE WHEN n % 5 = 0 THEN '선행 사건 #' || n ELSE NULL END,
  CASE WHEN n % 5 = 0 THEN '후속 결과 #' || n ELSE NULL END,
  NOW() - ((80 - n) || ' days')::interval + ((7 + (n % 14)) || ' hours')::interval
FROM generate_series(1, 80) AS n
ON CONFLICT DO NOTHING;

-- 5 Coaching records with varying trends and types
INSERT INTO ai_coaching (id, dog_id, report_type, blocks, feedback_score, ai_tokens_used, created_at)
VALUES
  -- Coaching 1: 60 days ago, worsening
  ('c3000001-0001-0000-0000-000000000001', 'd0000001-0000-0000-0000-000000000003', 'DAILY',
   '{
     "insight": {"trend": "worsening", "title": "공격성 빈도가 늘고 있어요", "key_patterns": ["다른 강아지 반응성", "소음 과민", "파괴행동"], "summary": "달이의 공격성과 불안이 동시에 심해지고 있어요."},
     "action_plan": {"items": [{"id": "ap1", "text": "다른 강아지 접촉 최소화", "priority": "high"}, {"id": "ap2", "text": "안전 공간 확보", "priority": "high"}, {"id": "ap3", "text": "소음 탈감작 시작", "priority": "medium"}]},
     "dog_voice": {"message": "무서운 게 너무 많아... 나를 좀 지켜줘.", "emotion": "fearful"},
     "next_7_days": [{"day": 1, "focus": "안전 확보", "tasks": ["안전 공간 설치"]}, {"day": 2, "focus": "회피 연습", "tasks": ["산책 경로 변경"]}],
     "risk_signals": {"overall_risk": "high", "signals": [{"label": "공격성 에스컬레이션", "severity": "critical", "recommendation": "즉시 행동전문수의사 상담 필요"}]},
     "consultation": {"recommended_specialist": "행동전문수의사", "reason": "공격성이 심화되고 있어 전문 개입 필요", "questions": ["약물치료 검토", "행동수정 프로그램"]}
   }',
   3, 350, NOW() - INTERVAL '60 days'),

  -- Coaching 2: 45 days ago, stable
  ('c3000001-0001-0000-0000-000000000002', 'd0000001-0000-0000-0000-000000000003', 'WEEKLY',
   '{
     "insight": {"trend": "stable", "title": "안정화 단계에 접어들었어요", "key_patterns": ["공격성 동일 수준", "불안 소폭 감소", "파괴행동 유지"], "summary": "전문가 상담 후 공격성이 더 심해지지는 않고 있어요."},
     "action_plan": {"items": [{"id": "ap1", "text": "약물 복용 유지", "priority": "high"}, {"id": "ap2", "text": "탈감작 훈련 2주차", "priority": "high"}, {"id": "ap3", "text": "아이와의 안전 거리 유지", "priority": "medium"}]},
     "dog_voice": {"message": "약 먹으니까 조금 나아진 것 같아. 아직 무섭지만.", "emotion": "anxious"},
     "next_7_days": [{"day": 1, "focus": "루틴 유지", "tasks": ["약 복용", "산책"]}, {"day": 2, "focus": "탈감작", "tasks": ["소음 단계 2"]}],
     "risk_signals": {"overall_risk": "moderate", "signals": [{"label": "아이 안전 주의", "severity": "warning", "recommendation": "아이와 단둘이 두지 않기"}]},
     "consultation": {"recommended_specialist": "행동전문수의사", "reason": "약물 효과 모니터링 필요", "questions": ["약물 용량 조절", "부작용 체크"]}
   }',
   4, 420, NOW() - INTERVAL '45 days'),

  -- Coaching 3: 30 days ago, improving
  ('c3000001-0001-0000-0000-000000000003', 'd0000001-0000-0000-0000-000000000003', 'DAILY',
   '{
     "insight": {"trend": "improving", "title": "개선 신호가 보이기 시작했어요!", "key_patterns": ["공격성 빈도 감소", "불안 강도 하락", "파괴행동 감소"], "summary": "꾸준한 훈련과 약물치료로 전반적인 개선이 나타나고 있어요."},
     "action_plan": {"items": [{"id": "ap1", "text": "탈감작 훈련 3주차 (중간 강도)", "priority": "high"}, {"id": "ap2", "text": "짧은 사회화 시도", "priority": "medium"}, {"id": "ap3", "text": "노즈워크로 에너지 관리", "priority": "medium"}, {"id": "ap4", "text": "저녁 진정 루틴 확립", "priority": "low"}]},
     "dog_voice": {"message": "요즘 좀 편해진 것 같아. 산책도 덜 무서워!", "emotion": "hopeful"},
     "next_7_days": [{"day": 1, "focus": "사회화 첫걸음", "tasks": ["먼 거리에서 다른 강아지 관찰"]}, {"day": 2, "focus": "탈감작 레벨업", "tasks": ["중간 강도 소음 노출"]}],
     "risk_signals": {"overall_risk": "moderate", "signals": [{"label": "과도한 자극 주의", "severity": "info", "recommendation": "무리한 사회화는 역효과"}]},
     "consultation": {"recommended_specialist": "반려견 행동전문가", "reason": "개선기에 적절한 속도 유지 중요", "questions": ["사회화 속도 조절", "약물 감량 시기"]}
   }',
   5, 390, NOW() - INTERVAL '30 days'),

  -- Coaching 4: 14 days ago, improving
  ('c3000001-0001-0000-0000-000000000004', 'd0000001-0000-0000-0000-000000000003', 'DAILY',
   '{
     "insight": {"trend": "improving", "title": "긍정적인 변화가 계속되고 있어요", "key_patterns": ["공격성 현저 감소", "불안 관리 가능 수준", "산책 중 사회화 진전"], "summary": "달이의 행동이 2달 전과 확연히 달라졌어요. 대단해요!"},
     "action_plan": {"items": [{"id": "ap1", "text": "5m 거리에서 다른 강아지와 동행 산책", "priority": "high"}, {"id": "ap2", "text": "차량 탈감작 1단계", "priority": "medium"}, {"id": "ap3", "text": "간식 보상 체계 정리", "priority": "low"}]},
     "dog_voice": {"message": "오늘 다른 강아지 봤는데 안 짖었어! 엄마 칭찬해줘!", "emotion": "happy"},
     "next_7_days": [{"day": 1, "focus": "동행 산책", "tasks": ["친한 강아지와 5m 간격 산책"]}, {"day": 2, "focus": "차량 훈련", "tasks": ["정차된 차 옆 지나가기"]}],
     "risk_signals": {"overall_risk": "low", "signals": [{"label": "지속적 개선", "severity": "info", "recommendation": "현재 속도 유지"}]},
     "consultation": {"recommended_specialist": "반려견 트레이너", "reason": "행동수정 전문 트레이너와 고급 사회화 연습 가능", "questions": ["그룹 수업 참여 시기", "약물 감량 가능성"]}
   }',
   5, 405, NOW() - INTERVAL '14 days'),

  -- Coaching 5: 2 days ago, stable (maintaining)
  ('c3000001-0001-0000-0000-000000000005', 'd0000001-0000-0000-0000-000000000003', 'INSIGHT',
   '{
     "insight": {"trend": "stable", "title": "안정기에 접어들었어요 — 유지가 핵심!", "key_patterns": ["공격성 최저 수준", "불안 관리 양호", "일부 새 자극에 주의"], "summary": "현재 상태를 유지하는 것이 가장 중요해요. 급격한 변화는 피해주세요."},
     "action_plan": {"items": [{"id": "ap1", "text": "현재 루틴 유지 (산책/훈련/약물)", "priority": "high"}, {"id": "ap2", "text": "새로운 환경 점진적 노출", "priority": "medium"}, {"id": "ap3", "text": "스트레스 신호 모니터링", "priority": "medium"}, {"id": "ap4", "text": "보호자 셀프케어도 중요!", "priority": "low"}]},
     "dog_voice": {"message": "나 요즘 많이 좋아졌지? 엄마 아빠 덕분이야. 계속 함께하자!", "emotion": "content"},
     "next_7_days": [{"day": 1, "focus": "루틴 유지", "tasks": ["일상 루틴 체크"]}, {"day": 2, "focus": "가벼운 도전", "tasks": ["새 산책 경로 시도"]}, {"day": 3, "focus": "사회화", "tasks": ["카페 앞 잠깐 앉기"]}, {"day": 4, "focus": "에너지 관리", "tasks": ["노즈워크 + 산책"]}, {"day": 5, "focus": "가족 시간", "tasks": ["아이와 함께 간식 주기(감독 하에)"]}, {"day": 6, "focus": "자유", "tasks": ["달이가 원하는 대로"]}, {"day": 7, "focus": "리뷰", "tasks": ["이번 주 일지 정리"]}],
     "risk_signals": {"overall_risk": "low", "signals": [{"label": "안정기 유지 중", "severity": "info", "recommendation": "급격한 환경 변화 주의"}]},
     "consultation": {"recommended_specialist": "반려견 행동전문가", "reason": "3개월 단위 정기 점검 권장", "questions": ["약물 감량 로드맵", "장기 관리 계획"]}
   }',
   NULL, 430, NOW() - INTERVAL '2 days');

-- Action tracker for heavy user (mixed completion across multiple coachings)
INSERT INTO action_tracker (id, coaching_id, action_item_id, is_completed, completed_at)
VALUES
  ('t3000001-0001-0000-0000-000000000001', 'c3000001-0001-0000-0000-000000000003', 'ap1', true,  NOW() - INTERVAL '28 days'),
  ('t3000001-0001-0000-0000-000000000002', 'c3000001-0001-0000-0000-000000000003', 'ap2', true,  NOW() - INTERVAL '25 days'),
  ('t3000001-0001-0000-0000-000000000003', 'c3000001-0001-0000-0000-000000000003', 'ap3', true,  NOW() - INTERVAL '22 days'),
  ('t3000001-0001-0000-0000-000000000004', 'c3000001-0001-0000-0000-000000000003', 'ap4', false, NULL),
  ('t3000001-0001-0000-0000-000000000005', 'c3000001-0001-0000-0000-000000000004', 'ap1', true,  NOW() - INTERVAL '10 days'),
  ('t3000001-0001-0000-0000-000000000006', 'c3000001-0001-0000-0000-000000000004', 'ap2', false, NULL),
  ('t3000001-0001-0000-0000-000000000007', 'c3000001-0001-0000-0000-000000000005', 'ap1', true,  NOW() - INTERVAL '1 day'),
  ('t3000001-0001-0000-0000-000000000008', 'c3000001-0001-0000-0000-000000000005', 'ap2', false, NULL)
ON CONFLICT DO NOTHING;

COMMIT;
