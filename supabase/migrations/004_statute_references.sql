-- Migration: 004_statute_references

CREATE TABLE statute_references (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jurisdiction_id UUID NOT NULL REFERENCES jurisdictions(id),
  title TEXT NOT NULL,
  section TEXT,
  url TEXT,
  excerpt TEXT,
  retrieved_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_statute_refs_jurisdiction ON statute_references(jurisdiction_id);
