-- V6__create_broker_delegation_requests.sql

CREATE TABLE broker_delegation_requests (
    id               BIGSERIAL PRIMARY KEY,
    owner_id         BIGINT NOT NULL,
    property_id      BIGINT NOT NULL,
    broker_user_id   BIGINT NOT NULL,
    status           VARCHAR(16) NOT NULL,
    reject_reason    TEXT,
    created_at       TIMESTAMP NOT NULL DEFAULT now(),
    updated_at       TIMESTAMP NOT NULL DEFAULT now(),

    CONSTRAINT fk_deleg_owner    FOREIGN KEY (owner_id)        REFERENCES users (id),
    CONSTRAINT fk_deleg_property FOREIGN KEY (property_id)     REFERENCES properties (id),
    CONSTRAINT fk_deleg_broker   FOREIGN KEY (broker_user_id)  REFERENCES broker_profiles (user_id),

    CONSTRAINT ck_deleg_status CHECK (status IN ('PENDING','APPROVED','REJECTED','CANCELED'))
);

-- 조회 최적화 인덱스
CREATE INDEX idx_deleg_broker_status ON broker_delegation_requests (broker_user_id, status);
CREATE INDEX idx_deleg_owner         ON broker_delegation_requests (owner_id);
CREATE INDEX idx_deleg_property      ON broker_delegation_requests (property_id);

-- 단일 요청 보장: 동일 매물(property_id)에 PENDING 상태는 하나만 허용
CREATE UNIQUE INDEX uq_deleg_property_pending
    ON broker_delegation_requests (property_id)
    WHERE status = 'PENDING';