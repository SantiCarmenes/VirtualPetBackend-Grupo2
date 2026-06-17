-- Add RIDER value to Role enum (user schema)
ALTER TYPE "user"."Role" ADD VALUE IF NOT EXISTS 'RIDER';

-- Add rider_id and taken_at columns to shipment table (shipping schema)
ALTER TABLE "shipping"."shipment"
  ADD COLUMN "rider_id" TEXT,
  ADD COLUMN "taken_at" TIMESTAMPTZ;

-- Seed: riders iniciales
INSERT INTO "user"."user" (id, first_name, last_name, username, role, email, password_hash, is_active, created_at, updated_at)
VALUES
  (gen_random_uuid(), 'Gian',  'Rider', 'gian-rider',  'RIDER', 'gian@virtualpet.com',  '$2b$10$rTKv26cmalsXwy2wDag5qeaPqLucVGTgMG73zi.A8Zc5XCa7eCQ66', true, now(), now()),
  (gen_random_uuid(), 'Mica',  'Rider', 'mica-rider',  'RIDER', 'mica@virtualpet.com',  '$2b$10$bZNxEV7wIgMUj6ynjRxG3eL4KItqqw0Mkaca9nvWgEUEJ/fvknW5a', true, now(), now()),
  (gen_random_uuid(), 'Santi', 'Rider', 'santi-rider', 'RIDER', 'santi@virtualpet.com', '$2b$10$sDHsDazdR2pgrBgKjP2vx.bc3t0eGwnkp4zEDZvlnCXbTY5Y5HSGq', true, now(), now())
ON CONFLICT (email) DO NOTHING;
