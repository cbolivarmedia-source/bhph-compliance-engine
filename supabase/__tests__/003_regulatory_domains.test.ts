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

describe("003_regulatory_domains.sql", () => {
  const filename = "003_regulatory_domains.sql";

  it("file exists", () => {
    expect(existsSync(join(MIGRATIONS_DIR, filename))).toBe(true);
  });

  it("is non-empty and has balanced parens", () => {
    const sql = readMigration(filename);
    expect(sql.trim().length).toBeGreaterThan(0);
    expect(hasBalancedParens(sql)).toBe(true);
  });

  it("creates regulatory_domains table", () => {
    const sql = readMigration(filename);
    expect(sql).toMatch(/CREATE TABLE regulatory_domains/i);
  });

  it("has required columns", () => {
    const sql = readMigration(filename);
    expect(sql).toMatch(/id\s+UUID\s+PRIMARY KEY/i);
    expect(sql).toMatch(/slug\s+TEXT\s+UNIQUE\s+NOT NULL/i);
    expect(sql).toMatch(/display_name\s+TEXT\s+NOT NULL/i);
    expect(sql).toMatch(/description\s+TEXT/i);
    expect(sql).toMatch(/is_active\s+BOOLEAN\s+NOT NULL\s+DEFAULT true/i);
    expect(sql).toMatch(/created_at\s+TIMESTAMPTZ\s+NOT NULL\s+DEFAULT now\(\)/i);
  });
});
