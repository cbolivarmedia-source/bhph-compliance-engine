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

describe("002_jurisdictions.sql", () => {
  const filename = "002_jurisdictions.sql";

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

  it("creates jurisdictions table", () => {
    const sql = readMigration(filename);
    expect(sql).toMatch(/CREATE TABLE jurisdictions/i);
  });

  it("has id UUID primary key", () => {
    const sql = readMigration(filename);
    expect(sql).toMatch(/id\s+UUID\s+PRIMARY KEY/i);
    expect(sql).toMatch(/gen_random_uuid\(\)/i);
  });

  it("has state_code CHAR(2) UNIQUE NOT NULL", () => {
    const sql = readMigration(filename);
    expect(sql).toMatch(/state_code\s+CHAR\(2\)\s+UNIQUE\s+NOT NULL/i);
  });

  it("has state_name TEXT NOT NULL", () => {
    const sql = readMigration(filename);
    expect(sql).toMatch(/state_name\s+TEXT\s+NOT NULL/i);
  });

  it("has is_active BOOLEAN NOT NULL DEFAULT true", () => {
    const sql = readMigration(filename);
    expect(sql).toMatch(/is_active\s+BOOLEAN\s+NOT NULL\s+DEFAULT true/i);
  });

  it("has created_at TIMESTAMPTZ NOT NULL DEFAULT now()", () => {
    const sql = readMigration(filename);
    expect(sql).toMatch(/created_at\s+TIMESTAMPTZ\s+NOT NULL\s+DEFAULT now\(\)/i);
  });
});
