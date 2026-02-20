-- ============================================================
-- Migration: 20240101000001_create_tables.sql
-- Description: Create all base tables for RentChain
-- Run this FIRST in Supabase SQL Editor
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;

-- ============================================================
-- TABLE: users
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  public_key    TEXT        NOT NULL UNIQUE,
  username      TEXT        UNIQUE,
  email         TEXT        UNIQUE,
  avatar_url    TEXT,
  bio           TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT users_public_key_format CHECK (public_key ~* '^G[A-Z2-7]{55}$'),
  CONSTRAINT users_username_length   CHECK (char_length(username) BETWEEN 3 AND 30),
  CONSTRAINT users_email_format      CHECK (email ~* '^[^@]+@[^@]+\.[^@]+$')
);

COMMENT ON TABLE  users IS 'User profiles linked to Stellar blockchain wallets';
COMMENT ON COLUMN users.public_key IS 'Stellar Ed25519 public key (G-prefixed, 56 chars)';

-- ============================================================
-- TABLE: listings
-- ============================================================
CREATE TABLE IF NOT EXISTS listings (
  -- Identity
  id                  UUID             PRIMARY KEY DEFAULT gen_random_uuid(),
  landlord_id         UUID             NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Core info
  title               TEXT             NOT NULL,
  description         TEXT,
  property_type       TEXT             NOT NULL DEFAULT 'apartment',

  -- Address
  address             TEXT             NOT NULL,
  city                TEXT             NOT NULL,
  state               TEXT             NOT NULL,
  country             TEXT             NOT NULL DEFAULT 'Nigeria',
  postal_code         TEXT,

  -- Location (PostGIS)
  latitude            DOUBLE PRECISION,
  longitude           DOUBLE PRECISION,
  location            GEOGRAPHY(POINT, 4326),

  -- Pricing
  rent_xlm            NUMERIC(18, 7)   NOT NULL,
  deposit_xlm         NUMERIC(18, 7),
  rent_negotiable     BOOLEAN          NOT NULL DEFAULT FALSE,

  -- Property details
  bedrooms            SMALLINT         NOT NULL DEFAULT 1,
  bathrooms           SMALLINT         NOT NULL DEFAULT 1,
  toilets             SMALLINT,
  floor_area_sqm      NUMERIC(8, 2),
  floor_number        SMALLINT,
  total_floors        SMALLINT,

  -- Booleans
  furnished           BOOLEAN          NOT NULL DEFAULT FALSE,
  pet_friendly        BOOLEAN          NOT NULL DEFAULT FALSE,
  utilities_included  BOOLEAN          NOT NULL DEFAULT FALSE,
  parking_available   BOOLEAN          NOT NULL DEFAULT FALSE,
  is_verified         BOOLEAN          NOT NULL DEFAULT FALSE,

  -- Availability
  status              TEXT             NOT NULL DEFAULT 'active',
  move_in_date        DATE,
  lease_term_months   SMALLINT,

  -- Metadata
  view_count          INTEGER          NOT NULL DEFAULT 0,
  created_at          TIMESTAMPTZ      NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ      NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT listings_title_length      CHECK (char_length(title) BETWEEN 5 AND 120),
  CONSTRAINT listings_rent_positive     CHECK (rent_xlm > 0),
  CONSTRAINT listings_bedrooms_valid    CHECK (bedrooms >= 0),
  CONSTRAINT listings_bathrooms_valid   CHECK (bathrooms >= 0),
  CONSTRAINT listings_status_valid      CHECK (status IN ('active', 'inactive', 'rented', 'suspended')),
  CONSTRAINT listings_property_type     CHECK (property_type IN ('apartment', 'house', 'room', 'studio', 'duplex', 'villa', 'office')),
  CONSTRAINT listings_lease_term_valid  CHECK (lease_term_months IS NULL OR lease_term_months > 0),
  CONSTRAINT listings_floor_area_valid  CHECK (floor_area_sqm IS NULL OR floor_area_sqm > 0)
);

COMMENT ON TABLE  listings IS 'Rental property listings with XLM-denominated rent';
COMMENT ON COLUMN listings.location IS 'PostGIS geography point, auto-set from lat/lng via trigger';
COMMENT ON COLUMN listings.rent_xlm IS 'Monthly rent in Stellar Lumens (XLM)';

-- ============================================================
-- TABLE: amenities
-- ============================================================
CREATE TABLE IF NOT EXISTS amenities (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT        NOT NULL UNIQUE,
  slug        TEXT        NOT NULL UNIQUE,
  category    TEXT        NOT NULL,
  icon        TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT amenities_category_valid CHECK (
    category IN ('outdoor', 'security', 'appliances', 'utilities', 'accessibility', 'entertainment', 'other')
  )
);

COMMENT ON TABLE amenities IS 'Master list of amenities that can be assigned to listings';

-- ============================================================
-- TABLE: listing_amenities (junction)
-- ============================================================
CREATE TABLE IF NOT EXISTS listing_amenities (
  listing_id  UUID        NOT NULL REFERENCES listings(id)  ON DELETE CASCADE,
  amenity_id  UUID        NOT NULL REFERENCES amenities(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  PRIMARY KEY (listing_id, amenity_id)
);

-- ============================================================
-- TABLE: listing_images
-- ============================================================
CREATE TABLE IF NOT EXISTS listing_images (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id    UUID        NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  url           TEXT        NOT NULL,
  storage_path  TEXT,
  caption       TEXT,
  is_cover      BOOLEAN     NOT NULL DEFAULT FALSE,
  sort_order    SMALLINT    NOT NULL DEFAULT 0,
  width         INTEGER,
  height        INTEGER,
  size_bytes    INTEGER,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  listing_images IS 'Images for each listing stored in Supabase Storage';
COMMENT ON COLUMN listing_images.storage_path IS 'Supabase Storage path used for deletion';

-- ============================================================
-- TABLE: messages
-- ============================================================
CREATE TABLE IF NOT EXISTS messages (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id     UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id   UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  listing_id    UUID        REFERENCES listings(id) ON DELETE SET NULL,
  content       TEXT        NOT NULL,
  is_read       BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT messages_no_self_message CHECK (sender_id <> receiver_id),
  CONSTRAINT messages_content_length  CHECK (char_length(content) BETWEEN 1 AND 5000)
);

COMMENT ON TABLE messages IS 'Direct messages between users scoped to a listing';

-- ============================================================
-- TABLE: payment_records
-- ============================================================
CREATE TABLE IF NOT EXISTS payment_records (
  id                UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID           NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  listing_id        UUID           NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  amount_paid       NUMERIC(18, 7) NOT NULL,
  transaction_hash  TEXT           NOT NULL UNIQUE,
  status            TEXT           NOT NULL DEFAULT 'pending',
  memo              TEXT,
  created_at        TIMESTAMPTZ    NOT NULL DEFAULT NOW(),

  CONSTRAINT payment_records_amount_positive CHECK (amount_paid > 0),
  CONSTRAINT payment_records_status_valid    CHECK (status IN ('pending', 'confirmed', 'failed', 'refunded')),
  CONSTRAINT payment_records_txhash_format   CHECK (char_length(transaction_hash) = 64)
);

COMMENT ON TABLE  payment_records IS 'Stellar blockchain payment records for rent';
COMMENT ON COLUMN payment_records.transaction_hash IS '64-char hex Stellar transaction hash';

-- ============================================================
-- TABLE: rent_agreements
-- ============================================================
CREATE TABLE IF NOT EXISTS rent_agreements (
  id            UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id    UUID           NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  tenant_id     UUID           NOT NULL REFERENCES users(id)   ON DELETE CASCADE,
  contract_id   TEXT           NOT NULL UNIQUE,
  status        TEXT           NOT NULL DEFAULT 'pending',
  start_date    DATE,
  end_date      DATE,
  deposit_xlm   NUMERIC(18, 7),
  terms         JSONB          DEFAULT '{}',
  created_at    TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ    NOT NULL DEFAULT NOW(),

  CONSTRAINT rent_agreements_status_valid  CHECK (status IN ('pending', 'active', 'expired', 'terminated')),
  CONSTRAINT rent_agreements_dates_valid   CHECK (end_date IS NULL OR end_date > start_date),
  CONSTRAINT rent_agreements_deposit_check CHECK (deposit_xlm IS NULL OR deposit_xlm >= 0)
);

COMMENT ON TABLE  rent_agreements IS 'Rental agreements backed by Stellar smart contracts';
COMMENT ON COLUMN rent_agreements.contract_id IS 'Stellar contract ID or escrow account address';