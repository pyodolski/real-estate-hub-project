BEGIN;

-- 1) 조회/정렬 최적화 인덱스 (여러 번 실행 안전)
CREATE INDEX IF NOT EXISTS idx_favorites_user_created_at
  ON favorites (user_id, created_at DESC);

-- 2) UNIQUE 제약: (user_id, property_id)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'uk_favorite_user_property'
  ) THEN
    ALTER TABLE favorites
      ADD CONSTRAINT uk_favorite_user_property
      UNIQUE (user_id, property_id);
  END IF;
END$$;

-- 3) FK: favorites.property_id -> properties.id (on delete cascade)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_favorites_property'
  ) THEN
    ALTER TABLE favorites
      ADD CONSTRAINT fk_favorites_property
      FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE;
  END IF;
END$$;

-- 4) FK: favorites.user_id -> users.id (on delete cascade)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_favorites_user'
  ) THEN
    ALTER TABLE favorites
      ADD CONSTRAINT fk_favorites_user
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
  END IF;
END$$;

COMMIT;