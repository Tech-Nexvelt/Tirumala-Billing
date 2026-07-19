-- ============================================================
-- Tirumala Furniture — V2.2 Enterprise Scanner Pairing Migration
-- ============================================================

-- 1. BILLING COUNTERS TABLE
CREATE TABLE IF NOT EXISTS public.billing_counters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Main Counter 1',
  code TEXT NOT NULL DEFAULT 'CTR-01',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. SCANNER DEVICES TABLE (SHA-256 Token Hashing + Hardware Metadata)
CREATE TABLE IF NOT EXISTS public.scanner_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  counter_id UUID NOT NULL REFERENCES public.billing_counters(id) ON DELETE CASCADE,
  device_name TEXT NOT NULL DEFAULT 'Mobile Scanner',
  pairing_token_hash TEXT NOT NULL UNIQUE,
  platform TEXT DEFAULT 'Mobile PWA',
  browser TEXT,
  os TEXT,
  app_version TEXT DEFAULT '2.2.0',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'revoked', 'disabled')),
  battery_level INT CHECK (battery_level BETWEEN 0 AND 100),
  capabilities JSONB DEFAULT '{}'::jsonb,
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. SCANNER PAIRING SESSIONS TABLE (2-Min Single Use with Attempt Guard)
CREATE TABLE IF NOT EXISTS public.scanner_pairing_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  counter_id UUID NOT NULL REFERENCES public.billing_counters(id) ON DELETE CASCADE,
  pairing_code TEXT NOT NULL UNIQUE,
  attempts INT NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ NOT NULL,
  is_used BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. SCANNER PRESENCE TELEMETRY TABLE
CREATE TABLE IF NOT EXISTS public.scanner_presence (
  device_id UUID PRIMARY KEY REFERENCES public.scanner_devices(id) ON DELETE CASCADE,
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'ONLINE' CHECK (status IN ('ONLINE', 'IDLE', 'OFFLINE')),
  latency_ms INT DEFAULT 0,
  network_type TEXT DEFAULT 'wifi',
  health_score INT DEFAULT 100,
  connected_since TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_heartbeat_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. IMMUTABLE SCANNER PAIRING HISTORY TABLE
CREATE TABLE IF NOT EXISTS public.scanner_pairing_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  device_id UUID REFERENCES public.scanner_devices(id) ON DELETE SET NULL,
  counter_id UUID REFERENCES public.billing_counters(id) ON DELETE SET NULL,
  paired_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  paired_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  revoked_at TIMESTAMPTZ,
  revocation_reason TEXT
);

-- INDEXES FOR MAXIMUM SCAN SPEED (<10ms)
CREATE INDEX IF NOT EXISTS idx_billing_counters_store ON public.billing_counters(store_id);
CREATE INDEX IF NOT EXISTS idx_scanner_devices_lookup ON public.scanner_devices(store_id, counter_id, status);
CREATE INDEX IF NOT EXISTS idx_scanner_devices_hash ON public.scanner_devices(pairing_token_hash);
CREATE INDEX IF NOT EXISTS idx_scanner_presence_store ON public.scanner_presence(store_id, status);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.billing_counters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scanner_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scanner_pairing_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scanner_presence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scanner_pairing_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Stores isolate counters" ON public.billing_counters FOR ALL USING (
  store_id IN (SELECT store_id FROM public.profiles WHERE id = auth.uid())
);
CREATE POLICY "Stores isolate scanner devices" ON public.scanner_devices FOR ALL USING (
  store_id IN (SELECT store_id FROM public.profiles WHERE id = auth.uid())
);
CREATE POLICY "Stores isolate pairing sessions" ON public.scanner_pairing_sessions FOR ALL USING (
  store_id IN (SELECT store_id FROM public.profiles WHERE id = auth.uid())
);
CREATE POLICY "Stores isolate presence" ON public.scanner_presence FOR ALL USING (
  store_id IN (SELECT store_id FROM public.profiles WHERE id = auth.uid())
);
CREATE POLICY "Stores isolate pairing history" ON public.scanner_pairing_history FOR ALL USING (
  store_id IN (SELECT store_id FROM public.profiles WHERE id = auth.uid())
);
