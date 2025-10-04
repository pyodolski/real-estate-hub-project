-- 알림 테이블 생성
CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id BIGINT NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    related_id BIGINT,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    read_at TIMESTAMP,
    
    CONSTRAINT fk_notifications_user 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_notifications_user_created 
    ON notifications(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_user_unread 
    ON notifications(user_id, is_read, created_at DESC);

-- 샘플 알림 데이터 (테스트용)
INSERT INTO notifications (user_id, type, title, message, related_id, is_read, created_at) 
SELECT 
    u.id,
    'SYSTEM_UPDATE',
    '시스템 업데이트',
    '더 나은 서비스 제공을 위해 시스템이 업데이트되었습니다. 새로운 필터 기능을 사용해보세요.',
    NULL,
    false,
    NOW() - INTERVAL '1 day'
FROM users u 
WHERE u.role_id = 'regular'
LIMIT 3;