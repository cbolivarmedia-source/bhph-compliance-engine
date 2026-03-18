import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

const MIGRATIONS_DIR = join(__dirname, "..", "migrations");

function readMigration(filename: string): string {
  const filePath = join(MIGRATIONS_DIR, filename);
  expect(existsSync(filePath), `Migration file ${filename} should exist`).toBe(true);
  return readFileSync(filePath, "utf-8");
}

function hasBalancedParens(sql: string): boolean {
  let depth = 0;
  for (const ch of sql) {
    if (ch === "(") depth++;
    else if (ch === ")") depth--;
    if (depth < 0) return false;
  }
  return depth === 0;
}

describe("007_rule_versions.sql", () => {
  const filename = "007_rule_versions.sql";

  it("file exists and has balanced parens", () => {
    const sql = readMigration(filename);
    expect(sql.trim().length).toBeGreaterThan(0);
    expect(hasBalancedParens(sql)).toBe(true);
  });

  it("creates rule_versions table", () => {
    const sql = readMigration(filename);
    expect(sql).toMatch(/CREATE TABLE rule_versions/i);
  });

  it("has FK to rules and mirrors key rule columns", () => {
    const sql = readMigration(filename);
    expect(sql).toMatch(/rule_id\s+UUID\s+NOT NULL\s+REFERENCES rules\(id\)/i);
    expect(sql).toMatch(/version\s+INTEGER\s+NOT NULL/i);
    expect(sql).toMatch(/rule_parameter\s+rule_parameter\s+NOT NULL/i);
    expect(sql).toMatch(/comparison_op\s+comparison_op\s+NOT NULL/i);
    expect(sql).toMatch(/display_description\s+TEXT\s+NOT NULL/i);
    expect(sql).toMatch(/severity\s+TEXT\s+NOT NULL/i);
    expect(sql).toMatch(/is_active\s+BOOLEAN\s+NOT NULL/i);
  });

  it("has audit columns", () => {
    const sql = readMigration(filename);
    expect(sql).toMatch(/changed_at\s+TIMESTAMPTZ\s+NOT NULL/i);
    expect(sql).toMatch(/changed_by\s+UUID/i);
    expect(sql).toMatch(/change_reason\s+TEXT/i);
  });

  it("creates index on rule_id and version", () => {
    const sql = readMigration(filename);
    expect(sql).toMatch(/CREATE INDEX idx_rule_versions_rule/i);
    expect(sql).toMatch(/ON rule_versions\(rule_id,\s*version\)/i);
  });

  it("defines snapshot_rule_version function", () => {
    const sql = readMigration(filename);
    expect(sql).toMatch(/CREATE OR REPLACE FUNCTION snapshot_rule_version/i);
    expect(sql).toMatch(/RETURNS TRIGGER/i);
    expect(sql).toMatch(/LANGUAGE plpgsql/i);
  });

  it("inserts OLD row snapshot into rule_versions", () => {
    const sql = readMigration(filename);
    expect(sql).toMatch(/INSERT INTO rule_versions/i);
    expect(sql).toMatch(/OLD\.id/i);
    expect(sql).toMatch(/OLD\.version/i);
    expect(sql).toMatch(/NEW\.version\s*:=\s*OLD\.version\s*\+\s*1/i);
    expect(sql).toMatch(/NEW\.updated_at\s*:=\s*now\(\)/i);
  });

  it("creates BEFORE UPDATE trigger on rules table", () => {
    const sql = readMigration(filename);
    expect(sql).toMatch(/CREATE TRIGGER trigger_rule_version/i);
    expect(sql).toMatch(/BEFORE UPDATE ON rules/i);
    expect(sql).toMatch(/FOR EACH ROW/i);
    expect(sql).toMatch(/EXECUTE FUNCTION snapshot_rule_version\(\)/i);
  });
});
