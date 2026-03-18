-- Migration: 007_rule_versions

CREATE TABLE rule_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id UUID NOT NULL REFERENCES rules(id),
  version INTEGER NOT NULL,
  jurisdiction_id UUID NOT NULL,
  domain_id UUID NOT NULL,
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
  valid_from DATE NOT NULL,
  valid_until DATE,
  display_description TEXT NOT NULL,
  severity TEXT NOT NULL,
  is_active BOOLEAN NOT NULL,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  changed_by UUID,
  change_reason TEXT
);
CREATE INDEX idx_rule_versions_rule ON rule_versions(rule_id, version);

CREATE OR REPLACE FUNCTION snapshot_rule_version()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO rule_versions (
    rule_id, version, jurisdiction_id, domain_id,
    rule_parameter, comparison_op, threshold_value, threshold_min, threshold_max,
    condition_field, condition_op, condition_value, condition_min, condition_max,
    valid_from, valid_until, display_description, severity, is_active
  ) VALUES (
    OLD.id, OLD.version, OLD.jurisdiction_id, OLD.domain_id,
    OLD.rule_parameter, OLD.comparison_op, OLD.threshold_value, OLD.threshold_min, OLD.threshold_max,
    OLD.condition_field, OLD.condition_op, OLD.condition_value, OLD.condition_min, OLD.condition_max,
    OLD.valid_from, OLD.valid_until, OLD.display_description, OLD.severity, OLD.is_active
  );
  NEW.version := OLD.version + 1;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_rule_version
  BEFORE UPDATE ON rules
  FOR EACH ROW
  EXECUTE FUNCTION snapshot_rule_version();
