-- 공용: updated_at 자동 갱신 트리거 함수
CREATE OR REPLACE FUNCTION trg_set_updated_at() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =========================
-- users
-- =========================
CREATE TABLE IF NOT EXISTS users (
    id           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    username     VARCHAR(50)  NOT NULL UNIQUE,
    password     VARCHAR(255) NOT NULL,
    email        VARCHAR(100) UNIQUE,
    phone_number VARCHAR(20),
    role_id      VARCHAR(20)  NOT NULL DEFAULT 'regular',
    created_at   TIMESTAMP    NOT NULL DEFAULT now(),
    updated_at   TIMESTAMP    NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS users_set_updated_at ON users;
CREATE TRIGGER users_set_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION trg_set_updated_at();

-- =========================
-- broker_profiles
-- =========================
CREATE TABLE IF NOT EXISTS broker_profiles (
    id             BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id        BIGINT NOT NULL,
    license_number VARCHAR(50),
    company_name   VARCHAR(100),
    office_address TEXT,
    office_phone   VARCHAR(20),
    created_at     TIMESTAMP NOT NULL DEFAULT now(),
    updated_at     TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT fk_broker_profiles_user
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

DROP TRIGGER IF EXISTS broker_profiles_set_updated_at ON broker_profiles;
CREATE TRIGGER broker_profiles_set_updated_at
  BEFORE UPDATE ON broker_profiles
  FOR EACH ROW EXECUTE FUNCTION trg_set_updated_at();

-- =========================
-- properties
-- =========================
CREATE TABLE IF NOT EXISTS properties (
    id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    title         TEXT        NOT NULL,
    address       TEXT        NOT NULL,
    price         NUMERIC(14,2),
    area_m2       NUMERIC(8,2),
    status        VARCHAR(16) NOT NULL DEFAULT 'AVAILABLE',
    listing_type  VARCHAR(16) NOT NULL DEFAULT 'OWNER',
    owner_id      BIGINT,
    broker_id     BIGINT,
    claim_id      BIGINT,
    region_code   VARCHAR(20),
    location_x    DOUBLE PRECISION,
    location_y    DOUBLE PRECISION,
    building_year INT,
    anomaly_alert BOOLEAN     NOT NULL DEFAULT FALSE,
    created_at    TIMESTAMP   NOT NULL DEFAULT now(),
    updated_at    TIMESTAMP   NOT NULL DEFAULT now(),
    CONSTRAINT fk_properties_owner  FOREIGN KEY (owner_id)  REFERENCES users(id)            ON DELETE SET NULL,
    CONSTRAINT fk_properties_broker FOREIGN KEY (broker_id) REFERENCES broker_profiles(id)  ON DELETE SET NULL
    -- claim_id는 순환 FK이므로 뒤에서 ALTER TABLE로 추가
);

DROP TRIGGER IF EXISTS properties_set_updated_at ON properties;
CREATE TRIGGER properties_set_updated_at
  BEFORE UPDATE ON properties
  FOR EACH ROW EXECUTE FUNCTION trg_set_updated_at();

-- =========================
-- ownership_claims
-- =========================
CREATE TABLE IF NOT EXISTS ownership_claims (
    id                      BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id                 BIGINT      NOT NULL,
    property_id             BIGINT,
    status                  VARCHAR(16) NOT NULL DEFAULT 'PENDING',
    admin_id                BIGINT,
    applicant_name          VARCHAR(100) NOT NULL,
    applicant_phone         VARCHAR(20)  NOT NULL,
    relationship_to_property VARCHAR(50) NOT NULL,
    additional_info         TEXT,
    property_address        TEXT,
    location_x              DOUBLE PRECISION,
    location_y              DOUBLE PRECISION,
    building_name           VARCHAR(100),
    detailed_address        VARCHAR(200),
    postal_code             VARCHAR(10),
    rejection_reason        TEXT,
    reviewed_at             TIMESTAMP NULL,
    created_at              TIMESTAMP NOT NULL DEFAULT now(),
    updated_at              TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT fk_claim_user     FOREIGN KEY (user_id)     REFERENCES users(id)      ON DELETE CASCADE,
    CONSTRAINT fk_claim_property FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE SET NULL,
    CONSTRAINT fk_claim_admin    FOREIGN KEY (admin_id)    REFERENCES users(id)      ON DELETE SET NULL
);

DROP TRIGGER IF EXISTS ownership_claims_set_updated_at ON ownership_claims;
CREATE TRIGGER ownership_claims_set_updated_at
  BEFORE UPDATE ON ownership_claims
  FOR EACH ROW EXECUTE FUNCTION trg_set_updated_at();

-- =========================
-- ownership_documents
-- =========================
CREATE TABLE IF NOT EXISTS ownership_documents (
    id               BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    claim_id         BIGINT      NOT NULL,
    document_type    VARCHAR(50) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    stored_filename   VARCHAR(255) NOT NULL,
    file_path        VARCHAR(500) NOT NULL,
    file_size        BIGINT,
    content_type     VARCHAR(100),
    uploaded_at      TIMESTAMP   NOT NULL DEFAULT now(),
    CONSTRAINT fk_docs_claim FOREIGN KEY (claim_id) REFERENCES ownership_claims(id) ON DELETE CASCADE
);

-- 순환 FK: properties.claim_id → ownership_claims.id
ALTER TABLE properties
  ADD CONSTRAINT fk_properties_claim
  FOREIGN KEY (claim_id) REFERENCES ownership_claims(id) ON DELETE SET NULL;

-- =========================
-- indexes
-- =========================
CREATE INDEX IF NOT EXISTS idx_users_username            ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email               ON users(email);
CREATE INDEX IF NOT EXISTS idx_properties_status         ON properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_location       ON properties(location_x, location_y);
CREATE INDEX IF NOT EXISTS idx_ownership_claims_status   ON ownership_claims(status);
CREATE INDEX IF NOT EXISTS idx_ownership_claims_user     ON ownership_claims(user_id);
