-- FlowSight MVP: Initial Schema
-- Aligned with: docs/architecture/contracts/case_contract.md
-- RLS: enabled on all tables, MVP uses service_role_key (bypasses RLS)

-- ============================================================
-- Enums (match case_contract.md exactly)
-- ============================================================

CREATE TYPE case_source AS ENUM ('wizard', 'voice');
CREATE TYPE case_urgency AS ENUM ('notfall', 'dringend', 'normal');

-- ============================================================
-- Tenants
-- ============================================================

CREATE TABLE tenants (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  slug       text        UNIQUE NOT NULL,
  name       text        NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE tenants IS 'Multi-tenant root. Each customer (e.g. doerfler-ag) is one tenant.';

-- ============================================================
-- Cases (SSOT shape from case_contract.md)
-- ============================================================

CREATE TABLE cases (
  id            uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     uuid          NOT NULL REFERENCES tenants(id),
  source        case_source   NOT NULL,
  created_at    timestamptz   NOT NULL DEFAULT now(),
  contact_phone text,
  contact_email text,
  plz           text          NOT NULL,
  city          text          NOT NULL,
  category      text          NOT NULL,
  urgency       case_urgency  NOT NULL,
  description   text          NOT NULL,
  photo_url     text,
  raw_payload   jsonb,

  -- Contract: "contact_phone OR contact_email (mindestens eins)"
  CONSTRAINT cases_contact_required
    CHECK (contact_phone IS NOT NULL OR contact_email IS NOT NULL)
);

COMMENT ON TABLE cases IS 'Central case table. Shape matches case_contract.md. Producers: wizard, voice webhook.';

CREATE INDEX idx_cases_tenant_created ON cases (tenant_id, created_at DESC);
CREATE INDEX idx_cases_urgency ON cases (urgency);

-- ============================================================
-- Tenant Numbers (called_number → tenant routing)
-- ============================================================

CREATE TABLE tenant_numbers (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id    uuid        NOT NULL REFERENCES tenants(id),
  phone_number text        UNIQUE NOT NULL,
  active       boolean     NOT NULL DEFAULT true,
  created_at   timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE tenant_numbers IS 'Maps inbound phone numbers (E.164) to tenants for voice routing.';

-- ============================================================
-- Row Level Security (MVP: enabled, no anon policies)
-- ============================================================

ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_numbers ENABLE ROW LEVEL SECURITY;

-- MVP: No RLS policies defined.
-- service_role_key bypasses RLS automatically.
-- All server-side operations (API routes) use service_role_key.
-- If anon access is needed later, add policies here.
