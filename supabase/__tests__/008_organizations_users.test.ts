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

describe("008_organizations_users.sql", () => {
  const filename = "008_organizations_users.sql";

  it("file exists and has balanced parens", () => {
    const sql = readMigration(filename);
    expect(sql.trim().length).toBeGreaterThan(0);
    expect(hasBalancedParens(sql)).toBe(true);
  });

  it("creates organizations table", () => {
    const sql = readMigration(filename);
    expect(sql).toMatch(/CREATE TABLE organizations/i);
    expect(sql).toMatch(/name\s+TEXT\s+NOT NULL/i);
    expect(sql).toMatch(/slug\s+TEXT\s+UNIQUE\s+NOT NULL/i);
  });

  it("creates users table with FK to organizations", () => {
    const sql = readMigration(filename);
    expect(sql).toMatch(/CREATE TABLE users/i);
    expect(sql).toMatch(/organization_id\s+UUID\s+NOT NULL\s+REFERENCES organizations\(id\)\s+ON DELETE CASCADE/i);
  });

  it("users table has email, full_name, role columns", () => {
    const sql = readMigration(filename);
    expect(sql).toMatch(/email\s+TEXT\s+NOT NULL/i);
    expect(sql).toMatch(/full_name\s+TEXT/i);
    expect(sql).toMatch(/role\s+user_role\s+NOT NULL\s+DEFAULT\s+'staff'/i);
  });

  it("both tables have created_at and updated_at", () => {
    const sql = readMigration(filename);
    const createdAtMatches = sql.match(/created_at\s+TIMESTAMPTZ\s+NOT NULL/gi);
    const updatedAtMatches = sql.match(/updated_at\s+TIMESTAMPTZ\s+NOT NULL/gi);
    expect(createdAtMatches?.length).toBeGreaterThanOrEqual(2);
    expect(updatedAtMatches?.length).toBeGreaterThanOrEqual(2);
  });

  it("creates index on users(organization_id)", () => {
    const sql = readMigration(filename);
    expect(sql).toMatch(/CREATE INDEX idx_users_org/i);
    expect(sql).toMatch(/ON users\(organization_id\)/i);
  });
});
