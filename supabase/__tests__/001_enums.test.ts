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

describe("001_enums.sql", () => {
  const filename = "001_enums.sql";

  it("file exists", () => {
    expect(existsSync(join(MIGRATIONS_DIR, filename))).toBe(true);
  });

  it("is non-empty", () => {
    const sql = readMigration(filename);
    expect(sql.trim().length).toBeGreaterThan(0);
  });

  it("has balanced parentheses", () => {
    const sql = readMigration(filename);
    expect(hasBalancedParens(sql)).toBe(true);
  });

  it("contains CREATE TYPE statements", () => {
    const sql = readMigration(filename);
    expect(sql).toMatch(/CREATE TYPE/i);
  });

  it("contains rule_parameter enum with all expected values", () => {
    const sql = readMigration(filename);
    expect(sql).toContain("rule_parameter");
    expect(sql).toContain("max_apr");
    expect(sql).toContain("max_finance_charge_rate");
    expect(sql).toContain("max_total_interest");
    expect(sql).toContain("max_loan_amount");
    expect(sql).toContain("min_down_payment_pct");
  });

  it("contains comparison_op enum with all expected values", () => {
    const sql = readMigration(filename);
    expect(sql).toContain("comparison_op");
    expect(sql).toContain("lte");
    expect(sql).toContain("gte");
    expect(sql).toContain("lt");
    expect(sql).toContain("gt");
    expect(sql).toContain("eq");
    expect(sql).toContain("between");
  });

  it("contains condition_field enum with all expected values", () => {
    const sql = readMigration(filename);
    expect(sql).toContain("condition_field");
    expect(sql).toContain("loan_amount");
    expect(sql).toContain("vehicle_age_years");
    expect(sql).toContain("term_months");
    expect(sql).toContain("sale_price");
  });

  it("contains user_role enum with all expected values", () => {
    const sql = readMigration(filename);
    expect(sql).toContain("user_role");
    expect(sql).toContain("owner");
    expect(sql).toContain("compliance_manager");
    expect(sql).toContain("staff");
    expect(sql).toContain("readonly");
  });

  it("contains check_result enum with all expected values", () => {
    const sql = readMigration(filename);
    expect(sql).toContain("check_result");
    expect(sql).toContain("pass");
    expect(sql).toContain("fail");
  });

  it("contains restructuring_strategy enum with all expected values", () => {
    const sql = readMigration(filename);
    expect(sql).toContain("restructuring_strategy");
    expect(sql).toContain("reduce_apr");
    expect(sql).toContain("extend_term");
    expect(sql).toContain("increase_down_payment");
    expect(sql).toContain("reduce_sale_price");
    expect(sql).toContain("combined");
  });

  it("uses IF NOT EXISTS or standard CREATE TYPE pattern", () => {
    const sql = readMigration(filename);
    expect(sql).toMatch(/CREATE TYPE/i);
    expect(sql).toMatch(/AS ENUM/i);
  });
});
