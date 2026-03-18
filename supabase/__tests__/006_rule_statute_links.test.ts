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

describe("006_rule_statute_links.sql", () => {
  const filename = "006_rule_statute_links.sql";

  it("file exists and has balanced parens", () => {
    const sql = readMigration(filename);
    expect(sql.trim().length).toBeGreaterThan(0);
    expect(hasBalancedParens(sql)).toBe(true);
  });

  it("creates rule_statute_links table", () => {
    const sql = readMigration(filename);
    expect(sql).toMatch(/CREATE TABLE rule_statute_links/i);
  });

  it("has cascading FK to rules", () => {
    const sql = readMigration(filename);
    expect(sql).toMatch(/rule_id\s+UUID\s+NOT NULL\s+REFERENCES rules\(id\)\s+ON DELETE CASCADE/i);
  });

  it("has cascading FK to statute_references", () => {
    const sql = readMigration(filename);
    expect(sql).toMatch(/statute_reference_id\s+UUID\s+NOT NULL\s+REFERENCES statute_references\(id\)\s+ON DELETE CASCADE/i);
  });

  it("has unique constraint on (rule_id, statute_reference_id)", () => {
    const sql = readMigration(filename);
    expect(sql).toMatch(/UNIQUE\s*\(\s*rule_id\s*,\s*statute_reference_id\s*\)/i);
  });
});
