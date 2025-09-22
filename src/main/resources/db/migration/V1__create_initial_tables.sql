-- 사용자 테이블
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE,
    phone_number VARCHAR(20),
    role_id VARCHAR(20) NOT NULL DEFAULT 'regular',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 중개인 프로필 테이블
CREATE TABLE IF NOT EXISTS broker_profiles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    license_number VARCHAR(50),
    company_name VARCHAR(100),
    office_address TEXT,
    office_phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 매물 테이블
CREATE TABLE IF NOT EXISTS properties (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title TEXT NOT NULL,
    address TEXT NOT NULL,
    price DECIMAL(14,2),
    area_m2 DECIMAL(8,2),
    status VARCHAR(16) NOT NULL DEFAULT 'AVAILABLE',
    listing_type VARCHAR(16) NOT NULL DEFAULT 'OWNER',
    owner_id BIGINT,
    broker_id BIGINT,
    claim_id BIGINT,
    region_code VARCHAR(20),
    location_x DOUBLE,
    location_y DOUBLE,
    building_year INT,
    anomaly_alert BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (broker_id) REFERENCES broker_profiles(id) ON DELETE SET NULL
);

-- 소유권 신청 테이블
CREATE TABLE IF NOT EXISTS ownership_claims (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    property_id BIGINT,
    status VARCHAR(16) NOT NULL DEFAULT 'PENDING',
    admin_id BIGINT,
    applicant_name VARCHAR(100) NOT NULL,
    applicant_phone VARCHAR(20) NOT NULL,
    relationship_to_property VARCHAR(50) NOT NULL,
    additional_info TEXT,
    property_address TEXT,
    location_x DOUBLE,
    location_y DOUBLE,
    building_name VARCHAR(100),
    detailed_address VARCHAR(200),
    postal_code VARCHAR(10),
    rejection_reason TEXT,
    reviewed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE SET NULL,
    FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 소유권 증명 서류 테이블
CREATE TABLE IF NOT EXISTS ownership_documents (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    claim_id BIGINT NOT NULL,
    document_type VARCHAR(50) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    stored_filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT,
    content_type VARCHAR(100),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (claim_id) REFERENCES ownership_claims(id) ON DELETE CASCADE
);

-- 매물과 소유권 신청 간의 외래키 추가
ALTER TABLE properties ADD CONSTRAINT fk_properties_claim 
    FOREIGN KEY (claim_id) REFERENCES ownership_claims(id) ON DELETE SET NULL;

-- 인덱스 추가
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_properties_location ON properties(location_x, location_y);
CREATE INDEX idx_ownership_claims_status ON ownership_claims(status);
CREATE INDEX idx_ownership_claims_user ON ownership_claims(user_id);