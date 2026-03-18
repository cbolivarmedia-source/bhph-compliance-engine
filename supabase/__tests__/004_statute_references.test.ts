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

describe("004_statute_references.sql", () => {
  const filename = "004_statute_references.sql";

  it("file exists and has balanced parens", () => {
    const sql = readMigration(filename);
    expect(sql.trim().length).toBeGreaterThan(0);
    expect(hasBalancedParens(sql)).toBe(true);
  });

  it("creates statute_references table", () => {
    const sql = readMigration(filename);
    expect(sql).toMatch(/CREATE TABLE statute_references/i);
  });

  it("has foreign key to jurisdictions", () => {
    const sql = readMigration(filename);
    expect(sql).toMatch(/jurisdiction_id\s+UUID\s+NOT NULL\s+REFERENCES jurisdictions\(id\)/i);
  });

  it("has required columns", () => {
    const sql = readMigration(filename);
    expect(sql).toMatch(/title\s+TEXT\s+NOT NULL/i);
    expect(sql).toMatch(/section\s+TEXT/i);
    expect(sql).toMatch(/url\s+TEXT/i);
    expect(sql).toMatch(/excerpt\s+TEXT/i);
    expect(sql).toMatch(/retrieved_at\s+TIMESTAMPTZ\s+NOT NULL/i);
    expect(sql).toMatch(/created_at\s+TIMESTAMPTZ\s+NOT NULL/i);
  });

  it("creates index on jurisdiction_id", () => {
    const sql = readMigration(filename);
    expect(sql).toMatch(/CREATE INDEX.*statute_refs.*jurisdiction/i);
    expect(sql).toMatch(/ON statute_references\(jurisdiction_id\)/i);
  });
});
