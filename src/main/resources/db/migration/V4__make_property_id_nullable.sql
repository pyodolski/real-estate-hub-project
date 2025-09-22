-- 소유권 증명 신청 시 매물이 아직 존재하지 않을 수 있으므로 property_id를 nullable로 변경
ALTER TABLE ownership_claims ALTER COLUMN property_id DROP NOT NULL;

CREATE INDEX IF NOT EXISTS idx_ownership_claims_applicant_id ON ownership_claims(user_id);
CREATE INDEX IF NOT EXISTS idx_ownership_claims_status ON ownership_claims(status);
CREATE INDEX IF NOT EXISTS idx_ownership_claims_property_address ON ownership_claims(property_address);