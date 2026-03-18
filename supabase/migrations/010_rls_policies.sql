-- Migration: 010_rls_policies
-- Row Level Security policies for all application tables

-- ============================================================
-- Enable RLS on all tables
-- ============================================================
ALTER TABLE jurisdictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE regulatory_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE statute_references ENABLE ROW LEVEL SECURITY;
ALTER TABLE rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE rule_statute_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_restructuring_suggestions ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Public read policies for reference / lookup tables
-- (jurisdictions, domains, statutes, rules, and links are
--  read-only public data; no auth required to SELECT)
-- ============================================================
CREATE POLICY "public_read_jurisdictions"
  ON jurisdictions FOR SELECT
  USING (true);

CREATE POLICY "public_read_regulatory_domains"
  ON regulatory_domains FOR SELECT
  USING (true);

CREATE POLICY "public_read_statute_references"
  ON statute_references FOR SELECT
  USING (true);

CREATE POLICY "public_read_rules"
  ON rules FOR SELECT
  USING (true);

CREATE POLICY "public_read_rule_statute_links"
  ON rule_statute_links FOR SELECT
  USING (true);

-- ============================================================
-- Org-isolation policies
-- Users may only see/mutate rows belonging to their org.
-- auth.uid() matches users.id; we derive the org from that.
-- ============================================================

-- organizations: a user may see their own org row
CREATE POLICY "org_isolation_organizations_select"
  ON organizations FOR SELECT
  USING (
    id = (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

-- users: a user may see other users in the same org
CREATE POLICY "org_isolation_users_select"
  ON users FOR SELECT
  USING (
    organization_id = (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

-- deal_checks: select restricted to own org
CREATE POLICY "org_isolation_deal_checks_select"
  ON deal_checks FOR SELECT
  USING (
    organization_id = (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

-- deal_checks: insert only into own org
CREATE POLICY "org_isolation_deal_checks_insert"
  ON deal_checks FOR INSERT
  WITH CHECK (
    organization_id = (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

-- ============================================================
-- deal_restructuring_suggestions
-- Read access inherited from the parent deal_check's org
-- ============================================================
CREATE POLICY "suggestion_read_via_deal_check"
  ON deal_restructuring_suggestions FOR SELECT
  USING (
    deal_check_id IN (
      SELECT id FROM deal_checks
      WHERE organization_id = (
        SELECT organization_id FROM users WHERE id = auth.uid()
      )
    )
  );
