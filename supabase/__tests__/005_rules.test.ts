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

describe("005_rules.sql", () => {
  const filename = "005_rules.sql";

  it("file exists and has balanced parens", () => {
    const sql = readMigration(filename);
    expect(sql.trim().length).toBeGreaterThan(0);
    expect(hasBalancedParens(sql)).toBe(true);
  });

  it("creates rules table", () => {
    const sql = readMigration(filename);
    expect(sql).toMatch(/CREATE TABLE rules/i);
  });

  it("has FKs to jurisdictions and regulatory_domains", () => {
    const sql = readMigration(filename);
    expect(sql).toMatch(/jurisdiction_id\s+UUID\s+NOT NULL\s+REFERENCES jurisdictions\(id\)/i);
    expect(sql).toMatch(/domain_id\s+UUID\s+NOT NULL\s+REFERENCES regulatory_domains\(id\)/i);
  });

  it("uses rule_parameter and comparison_op enum types", () => {
    const sql = readMigration(filename);
    expect(sql).toMatch(/rule_parameter\s+rule_parameter\s+NOT NULL/i);
    expect(sql).toMatch(/comparison_op\s+comparison_op\s+NOT NULL/i);
  });

  it("has threshold and condition columns", () => {
    const sql = readMigration(filename);
    expect(sql).toMatch(/threshold_value\s+DECIMAL/i);
    expect(sql).toMatch(/threshold_min\s+DECIMAL/i);
    expect(sql).toMatch(/threshold_max\s+DECIMAL/i);
    expect(sql).toMatch(/condition_field\s+condition_field/i);
    expect(sql).toMatch(/condition_op\s+comparison_op/i);
    expect(sql).toMatch(/condition_value\s+DECIMAL/i);
    expect(sql).toMatch(/condition_min\s+DECIMAL/i);
    expect(sql).toMatch(/condition_max\s+DECIMAL/i);
  });

  it("has validity, metadata, and audit columns", () => {
    const sql = readMigration(filename);
    expect(sql).toMatch(/valid_from\s+DATE\s+NOT NULL/i);
    expect(sql).toMatch(/valid_until\s+DATE/i);
    expect(sql).toMatch(/display_description\s+TEXT\s+NOT NULL/i);
    expect(sql).toMatch(/severity\s+TEXT\s+NOT NULL/i);
    expect(sql).toMatch(/is_active\s+BOOLEAN\s+NOT NULL/i);
    expect(sql).toMatch(/version\s+INTEGER\s+NOT NULL/i);
    expect(sql).toMatch(/created_at\s+TIMESTAMPTZ/i);
    expect(sql).toMatch(/updated_at\s+TIMESTAMPTZ/i);
  });

  it("creates four indexes", () => {
    const sql = readMigration(filename);
    expect(sql).toMatch(/CREATE INDEX idx_rules_jurisdiction/i);
    expect(sql).toMatch(/CREATE INDEX idx_rules_domain/i);
    expect(sql).toMatch(/CREATE INDEX idx_rules_active/i);
    expect(sql).toMatch(/CREATE INDEX idx_rules_param/i);
  });
});
