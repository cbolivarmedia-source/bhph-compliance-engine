-- Migration: 009_deal_checks

CREATE TABLE deal_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  user_id UUID NOT NULL REFERENCES users(id),
  jurisdiction_id UUID NOT NULL REFERENCES jurisdictions(id),
  sale_price DECIMAL(12,2) NOT NULL,
  down_payment DECIMAL(12,2) NOT NULL,
  loan_amount DECIMAL(12,2) NOT NULL,
  apr DECIMAL(6,4) NOT NULL,
  term_months INTEGER NOT NULL,
  vehicle_year INTEGER NOT NULL,
  result check_result NOT NULL,
  violations_count INTEGER NOT NULL DEFAULT 0,
  warnings_count INTEGER NOT NULL DEFAULT 0,
  result_details JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_deal_checks_org ON deal_checks(organization_id);
CREATE INDEX idx_deal_checks_user ON deal_checks(user_id);
CREATE INDEX idx_deal_checks_created ON deal_checks(created_at DESC);

CREATE TABLE deal_restructuring_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_check_id UUID NOT NULL REFERENCES deal_checks(id) ON DELETE CASCADE,
  strategy restructuring_strategy NOT NULL,
  suggested_apr DECIMAL(6,4),
  suggested_term_months INTEGER,
  suggested_down_payment DECIMAL(12,2),
  suggested_sale_price DECIMAL(12,2),
  suggested_loan_amount DECIMAL(12,2),
  original_monthly_payment DECIMAL(12,2),
  suggested_monthly_payment DECIMAL(12,2),
  explanation TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_suggestions_check ON deal_restructuring_suggestions(deal_check_id);
