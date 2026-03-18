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

describe("010_rls_policies.sql", () => {
  const filename = "010_rls_policies.sql";

  it("file exists and has balanced parens", () => {
    const sql = readMigration(filename);
    expect(sql.trim().length).toBeGreaterThan(0);
    expect(hasBalancedParens(sql)).toBe(true);
  });

  it("enables RLS on all tables", () => {
    const sql = readMigration(filename);
    const tables = [
      "jurisdictions",
      "regulatory_domains",
      "statute_references",
      "rules",
      "rule_statute_links",
      "organizations",
      "users",
      "deal_checks",
      "deal_restructuring_suggestions",
    ];
    for (const table of tables) {
      expect(sql, `Should enable RLS on ${table}`).toMatch(
        new RegExp(`ALTER TABLE ${table}\\s+ENABLE ROW LEVEL SECURITY`, "i")
      );
    }
  });

  it("has public read policies on reference tables", () => {
    const sql = readMigration(filename);
    const publicReadTables = [
      "jurisdictions",
      "regulatory_domains",
      "statute_references",
      "rules",
      "rule_statute_links",
    ];
    for (const table of publicReadTables) {
      expect(sql, `Should have public SELECT policy on ${table}`).toMatch(
        new RegExp(`ON ${table}\\s+FOR SELECT`, "i")
      );
    }
  });

  it("has org-isolation policies on organizations", () => {
    const sql = readMigration(filename);
    expect(sql).toMatch(/ON organizations\s+FOR SELECT/i);
    expect(sql).toMatch(/organization_id/i);
  });

  it("has org-isolation policies on users", () => {
    const sql = readMigration(filename);
    expect(sql).toMatch(/ON users\s+FOR SELECT/i);
  });

  it("has org-isolation policies on deal_checks", () => {
    const sql = readMigration(filename);
    expect(sql).toMatch(/ON deal_checks\s+FOR SELECT/i);
    expect(sql).toMatch(/ON deal_checks\s+FOR INSERT/i);
  });

  it("has read policy on deal_restructuring_suggestions", () => {
    const sql = readMigration(filename);
    expect(sql).toMatch(/ON deal_restructuring_suggestions\s+FOR SELECT/i);
    expect(sql).toMatch(/deal_check_id/i);
  });

  it("uses auth.uid() for org isolation", () => {
    const sql = readMigration(filename);
    expect(sql).toMatch(/auth\.uid\(\)/i);
  });

  it("uses CREATE POLICY syntax", () => {
    const sql = readMigration(filename);
    const policyCount = (sql.match(/CREATE POLICY/gi) || []).length;
    expect(policyCount).toBeGreaterThanOrEqual(8);
  });
});
