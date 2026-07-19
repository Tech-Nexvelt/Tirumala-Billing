-- ============================================================
-- Tirumala Furniture — V2.1 Enterprise Scanner Pairing Migration
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

-- 2. SCANNER DEVICES TABLE (SHA-256 Token Hashing + Health Telemetry)
CREATE TABLE IF NOT EXISTS public.scanner_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  counter_id UUID NOT NULL REFERENCES public.billing_counters(id) ON DELETE CASCADE,
  device_name TEXT NOT NULL DEFAULT 'Mobile Scanner',
  pairing_token_hash TEXT NOT NULL UNIQUE,
  platform TEXT DEFAULT 'Mobile PWA',
  browser TEXT,
  os TEXT,
  app_version TEXT DEFAULT '2.1.0',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'revoked', 'disabled')),
  battery_level INT CHECK (battery_level BETWEEN 0 AND 100),
  capabilities JSONB DEFAULT '{}'::jsonb,
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. SCANNER PAIRING SESSIONS TABLE (2-Min Single Use with Attempt Limit)
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

-- 4. SCANNER ACTIVITY AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.scanner_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  device_id UUID REFERENCES public.scanner_devices(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- INDEXES FOR MAXIMUM SCAN PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_billing_counters_store ON public.billing_counters(store_id);
CREATE INDEX IF NOT EXISTS idx_scanner_devices_lookup ON public.scanner_devices(store_id, counter_id, status);
CREATE INDEX IF NOT EXISTS idx_scanner_devices_hash ON public.scanner_devices(pairing_token_hash);
CREATE INDEX IF NOT EXISTS idx_pairing_sessions_active ON public.scanner_pairing_sessions(pairing_code, is_used, expires_at);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.billing_counters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scanner_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scanner_pairing_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scanner_activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users access store counters" ON public.billing_counters FOR ALL USING (
  store_id IN (SELECT store_id FROM public.profiles WHERE id = auth.uid())
);
CREATE POLICY "Users access store devices" ON public.scanner_devices FOR ALL USING (
  store_id IN (SELECT store_id FROM public.profiles WHERE id = auth.uid())
);
CREATE POLICY "Users access store pairing sessions" ON public.scanner_pairing_sessions FOR ALL USING (
  store_id IN (SELECT store_id FROM public.profiles WHERE id = auth.uid())
);
CREATE POLICY "Users access store scanner logs" ON public.scanner_activity_logs FOR ALL USING (
  store_id IN (SELECT store_id FROM public.profiles WHERE id = auth.uid())
);

-- AUTOMATED PAIRING CLEANUP RPC FUNCTION
CREATE OR REPLACE FUNCTION public.cleanup_expired_pairing_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM public.scanner_pairing_sessions
  WHERE expires_at < now() OR is_used = true OR attempts >= 5;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
