-- Migration: 005_rules

CREATE TABLE rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jurisdiction_id UUID NOT NULL REFERENCES jurisdictions(id),
  domain_id UUID NOT NULL REFERENCES regulatory_domains(id),
  rule_parameter rule_parameter NOT NULL,
  comparison_op comparison_op NOT NULL,
  threshold_value DECIMAL(12,4),
  threshold_min DECIMAL(12,4),
  threshold_max DECIMAL(12,4),
  condition_field condition_field,
  condition_op comparison_op,
  condition_value DECIMAL(12,4),
  condition_min DECIMAL(12,4),
  condition_max DECIMAL(12,4),
  valid_from DATE NOT NULL DEFAULT CURRENT_DATE,
  valid_until DATE,
  display_description TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'violation',
  is_active BOOLEAN NOT NULL DEFAULT true,
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_rules_jurisdiction ON rules(jurisdiction_id);
CREATE INDEX idx_rules_domain ON rules(domain_id);
CREATE INDEX idx_rules_active ON rules(is_active, valid_from, valid_until);
CREATE INDEX idx_rules_param ON rules(rule_parameter);
