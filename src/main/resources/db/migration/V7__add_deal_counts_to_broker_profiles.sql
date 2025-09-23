-- V7__add_deal_counts_to_broker_profiles.sql
-- 1) 컬럼 추가
ALTER TABLE broker_profiles
  ADD COLUMN total_deals   INT NOT NULL DEFAULT 0,
  ADD COLUMN pending_deals INT NOT NULL DEFAULT 0;

-- 2) 기존 데이터 백필(backfill)
-- pending_deals: 현재 PENDING 상태의 위임요청 수
UPDATE broker_profiles bp
SET pending_deals = COALESCE(src.cnt, 0)
FROM (
  SELECT r.broker_user_id AS user_id, COUNT(*) AS cnt
  FROM broker_delegation_requests r
  WHERE r.status = 'PENDING'
  GROUP BY r.broker_user_id
) src
WHERE bp.user_id = src.user_id;

-- total_deals: 실제 거래완료(SOLD)된 브로커 매물 수 (listing_type = 'BROKER')
UPDATE broker_profiles bp
SET total_deals = COALESCE(src.cnt, 0)
FROM (
  SELECT p.broker_id AS user_id, COUNT(*) AS cnt
  FROM properties p
  WHERE p.listing_type = 'BROKER'
    AND p.status = 'SOLD'
    AND p.broker_id IS NOT NULL
  GROUP BY p.broker_id
) src
WHERE bp.user_id = src.user_id;

-- 3) pending_deals 자동 유지 트리거
CREATE OR REPLACE FUNCTION trg_bdr_pending_deals()
RETURNS trigger AS $$
BEGIN
  -- INSERT: 새로 PENDING이면 +1
  IF TG_OP = 'INSERT' THEN
    IF NEW.status = 'PENDING' THEN
      UPDATE broker_profiles
         SET pending_deals = pending_deals + 1
       WHERE user_id = NEW.broker_user_id;
    END IF;
    RETURN NEW;
  END IF;

  -- UPDATE: PENDING -> 비PENDING 이면 -1 / 비PENDING -> PENDING 이면 +1
  IF TG_OP = 'UPDATE' THEN
    IF OLD.status = 'PENDING' AND NEW.status <> 'PENDING' THEN
      UPDATE broker_profiles
         SET pending_deals = GREATEST(pending_deals - 1, 0)
       WHERE user_id = NEW.broker_user_id;
    ELSIF OLD.status <> 'PENDING' AND NEW.status = 'PENDING' THEN
      UPDATE broker_profiles
         SET pending_deals = pending_deals + 1
       WHERE user_id = NEW.broker_user_id;
    END IF;
    RETURN NEW;
  END IF;

  -- DELETE: PENDING 레코드 삭제 시 -1
  IF TG_OP = 'DELETE' THEN
    IF OLD.status = 'PENDING' THEN
      UPDATE broker_profiles
         SET pending_deals = GREATEST(pending_deals - 1, 0)
       WHERE user_id = OLD.broker_user_id;
    END IF;
    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS bdr_pending_deals_trg ON broker_delegation_requests;
CREATE TRIGGER bdr_pending_deals_trg
AFTER INSERT OR UPDATE OR DELETE ON broker_delegation_requests
FOR EACH ROW EXECUTE FUNCTION trg_bdr_pending_deals();

-- 4) total_deals 자동 유지 트리거
-- properties.status 가 SOLD 로 바뀔 때 +1, SOLD 해제 시 -1
CREATE OR REPLACE FUNCTION trg_properties_total_deals()
RETURNS trigger AS $$
DECLARE
  broker_user_id BIGINT;
BEGIN
  -- SOLD 진입
  IF (OLD.status IS DISTINCT FROM 'SOLD') AND (NEW.status = 'SOLD') THEN
    IF NEW.broker_id IS NOT NULL AND NEW.listing_type = 'BROKER' THEN
      broker_user_id := NEW.broker_id; -- FK -> broker_profiles.user_id
      UPDATE broker_profiles
         SET total_deals = total_deals + 1
       WHERE user_id = broker_user_id;
    END IF;
  END IF;

  -- SOLD 해제(롤백)
  IF (OLD.status = 'SOLD') AND (NEW.status IS DISTINCT FROM 'SOLD') THEN
    IF OLD.broker_id IS NOT NULL AND OLD.listing_type = 'BROKER' THEN
      broker_user_id := OLD.broker_id;
      UPDATE broker_profiles
         SET total_deals = GREATEST(total_deals - 1, 0)
       WHERE user_id = broker_user_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS properties_total_deals_trg ON properties;
CREATE TRIGGER properties_total_deals_trg
AFTER UPDATE OF status ON properties
FOR EACH ROW EXECUTE FUNCTION trg_properties_total_deals();