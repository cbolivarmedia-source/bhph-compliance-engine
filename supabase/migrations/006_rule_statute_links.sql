-- Migration: 006_rule_statute_links

CREATE TABLE rule_statute_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id UUID NOT NULL REFERENCES rules(id) ON DELETE CASCADE,
  statute_reference_id UUID NOT NULL REFERENCES statute_references(id) ON DELETE CASCADE,
  UNIQUE(rule_id, statute_reference_id)
);
