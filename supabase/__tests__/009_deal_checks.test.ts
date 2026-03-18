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

describe("009_deal_checks.sql", () => {
  const filename = "009_deal_checks.sql";

  it("file exists and has balanced parens", () => {
    const sql = readMigration(filename);
    expect(sql.trim().length).toBeGreaterThan(0);
    expect(hasBalancedParens(sql)).toBe(true);
  });

  it("creates deal_checks table", () => {
    const sql = readMigration(filename);
    expect(sql).toMatch(/CREATE TABLE deal_checks/i);
  });

  it("deal_checks has FKs to organizations, users, jurisdictions", () => {
    const sql = readMigration(filename);
    expect(sql).toMatch(/organization_id\s+UUID\s+NOT NULL\s+REFERENCES organizations\(id\)/i);
    expect(sql).toMatch(/user_id\s+UUID\s+NOT NULL\s+REFERENCES users\(id\)/i);
    expect(sql).toMatch(/jurisdiction_id\s+UUID\s+NOT NULL\s+REFERENCES jurisdictions\(id\)/i);
  });

  it("deal_checks has financial input columns", () => {
    const sql = readMigration(filename);
    expect(sql).toMatch(/sale_price\s+DECIMAL/i);
    expect(sql).toMatch(/down_payment\s+DECIMAL/i);
    expect(sql).toMatch(/loan_amount\s+DECIMAL/i);
    expect(sql).toMatch(/apr\s+DECIMAL/i);
    expect(sql).toMatch(/term_months\s+INTEGER/i);
    expect(sql).toMatch(/vehicle_year\s+INTEGER/i);
  });

  it("deal_checks has result and count columns", () => {
    const sql = readMigration(filename);
    expect(sql).toMatch(/result\s+check_result\s+NOT NULL/i);
    expect(sql).toMatch(/violations_count\s+INTEGER/i);
    expect(sql).toMatch(/warnings_count\s+INTEGER/i);
    expect(sql).toMatch(/result_details\s+JSONB\s+NOT NULL/i);
  });

  it("deal_checks has three indexes", () => {
    const sql = readMigration(filename);
    expect(sql).toMatch(/CREATE INDEX idx_deal_checks_org/i);
    expect(sql).toMatch(/CREATE INDEX idx_deal_checks_user/i);
    expect(sql).toMatch(/CREATE INDEX idx_deal_checks_created/i);
  });

  it("creates deal_restructuring_suggestions table", () => {
    const sql = readMigration(filename);
    expect(sql).toMatch(/CREATE TABLE deal_restructuring_suggestions/i);
  });

  it("suggestions has FK to deal_checks with cascade", () => {
    const sql = readMigration(filename);
    expect(sql).toMatch(/deal_check_id\s+UUID\s+NOT NULL\s+REFERENCES deal_checks\(id\)\s+ON DELETE CASCADE/i);
  });

  it("suggestions has strategy and financial outcome columns", () => {
    const sql = readMigration(filename);
    expect(sql).toMatch(/strategy\s+restructuring_strategy\s+NOT NULL/i);
    expect(sql).toMatch(/suggested_apr\s+DECIMAL/i);
    expect(sql).toMatch(/suggested_term_months\s+INTEGER/i);
    expect(sql).toMatch(/suggested_down_payment\s+DECIMAL/i);
    expect(sql).toMatch(/suggested_sale_price\s+DECIMAL/i);
    expect(sql).toMatch(/suggested_loan_amount\s+DECIMAL/i);
    expect(sql).toMatch(/original_monthly_payment\s+DECIMAL/i);
    expect(sql).toMatch(/suggested_monthly_payment\s+DECIMAL/i);
    expect(sql).toMatch(/explanation\s+TEXT/i);
  });

  it("suggestions has index on deal_check_id", () => {
    const sql = readMigration(filename);
    expect(sql).toMatch(/CREATE INDEX idx_suggestions_check/i);
    expect(sql).toMatch(/ON deal_restructuring_suggestions\(deal_check_id\)/i);
  });
});
