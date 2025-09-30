-- 샘플 브로커 사용자 및 프로필 데이터 삽입

-- 브로커 사용자들 추가
INSERT INTO users (username, password, email, phone_number, role_id, created_at, updated_at) VALUES
('김중개', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'kim.broker@example.com', '010-1234-5678', 'broker', NOW(), NOW()),
('이부동산', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'lee.broker@example.com', '010-2345-6789', 'broker', NOW(), NOW()),
('박중개사', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'park.broker@example.com', '010-3456-7890', 'broker', NOW(), NOW()),
('최부동산', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'choi.broker@example.com', '010-4567-8901', 'broker', NOW(), NOW()),
('정중개', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'jung.broker@example.com', '010-5678-9012', 'broker', NOW(), NOW())
ON CONFLICT (username) DO NOTHING;

-- 브로커 프로필 추가
INSERT INTO broker_profiles (user_id, license_number, agency_name, intro, total_deals, pending_deals, created_at, updated_at)
SELECT 
    u.id,
    CASE 
        WHEN u.username = '김중개' THEN '서울-2021-001'
        WHEN u.username = '이부동산' THEN '서울-2020-045'
        WHEN u.username = '박중개사' THEN '경기-2019-123'
        WHEN u.username = '최부동산' THEN '서울-2022-078'
        WHEN u.username = '정중개' THEN '부산-2021-034'
    END as license_number,
    CASE 
        WHEN u.username = '김중개' THEN '강남부동산'
        WHEN u.username = '이부동산' THEN '서초중개사무소'
        WHEN u.username = '박중개사' THEN '분당부동산'
        WHEN u.username = '최부동산' THEN '홍대부동산센터'
        WHEN u.username = '정중개' THEN '해운대부동산'
    END as agency_name,
    CASE 
        WHEN u.username = '김중개' THEN '강남구, 서초구 전문 중개사입니다. 8년간의 경험으로 고객님께 최적의 매물을 찾아드립니다.'
        WHEN u.username = '이부동산' THEN '서초구 아파트 전문입니다. 신뢰할 수 있는 거래를 약속드립니다.'
        WHEN u.username = '박중개사' THEN '분당 신도시 전문 중개사로 10년 경력을 보유하고 있습니다.'
        WHEN u.username = '최부동산' THEN '홍대, 마포구 원룸, 투룸 전문입니다. 대학생 및 직장인 분들께 최적의 매물을 제공합니다.'
        WHEN u.username = '정중개' THEN '부산 해운대구 전문 중개사입니다. 바다 전망 아파트부터 도심 오피스텔까지 다양한 매물을 보유하고 있습니다.'
    END as intro,
    CASE 
        WHEN u.username = '김중개' THEN 127
        WHEN u.username = '이부동산' THEN 89
        WHEN u.username = '박중개사' THEN 156
        WHEN u.username = '최부동산' THEN 73
        WHEN u.username = '정중개' THEN 94
    END as total_deals,
    CASE 
        WHEN u.username = '김중개' THEN 8
        WHEN u.username = '이부동산' THEN 5
        WHEN u.username = '박중개사' THEN 12
        WHEN u.username = '최부동산' THEN 6
        WHEN u.username = '정중개' THEN 7
    END as pending_deals,
    NOW() as created_at,
    NOW() as updated_at
FROM users u 
WHERE u.role_id = 'broker' 
  AND u.username IN ('김중개', '이부동산', '박중개사', '최부동산', '정중개')
ON CONFLICT (user_id) DO NOTHING;