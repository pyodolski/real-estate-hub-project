-- oftion 컬럼을 문자열로 사용하려고 TEXT로 변경
-- 기존 BIT(1) 값이 있으면 '1' 또는 '0' 문자열로 보존

ALTER TABLE property_offers
  ALTER COLUMN oftion TYPE text
  USING (
    CASE
      WHEN oftion IS NULL THEN NULL
      WHEN oftion = B'1' THEN '1'
      WHEN oftion = B'0' THEN '0'
      ELSE oftion::text
    END
  );
