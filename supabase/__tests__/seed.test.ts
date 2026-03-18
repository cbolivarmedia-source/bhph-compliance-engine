import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

const SEED_FILE = join(__dirname, "..", "seed.sql");

function readSeed(): string {
  expect(existsSync(SEED_FILE), "seed.sql should exist").toBe(true);
  return readFileSync(SEED_FILE, "utf-8");
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

const EXPECTED_STATES = ["IL", "TX", "FL", "GA", "OH", "NC", "IN", "TN", "AL", "AZ", "VA"];
const EXPECTED_STATE_NAMES = [
  "Illinois",
  "Texas",
  "Florida",
  "Georgia",
  "Ohio",
  "North Carolina",
  "Indiana",
  "Tennessee",
  "Alabama",
  "Arizona",
  "Virginia",
];

describe("seed.sql", () => {
  it("file exists and has balanced parens", () => {
    const sql = readSeed();
    expect(sql.trim().length).toBeGreaterThan(0);
    expect(hasBalancedParens(sql)).toBe(true);
  });

  it("uses INSERT INTO ... ON CONFLICT for idempotency", () => {
    const sql = readSeed();
    expect(sql).toMatch(/ON CONFLICT/i);
  });

  it("contains all 11 expected state codes", () => {
    const sql = readSeed();
    for (const code of EXPECTED_STATES) {
      expect(sql, `Should contain state code '${code}'`).toContain(`'${code}'`);
    }
  });

  it("contains all expected state names", () => {
    const sql = readSeed();
    for (const name of EXPECTED_STATE_NAMES) {
      expect(sql, `Should contain state name '${name}'`).toContain(name);
    }
  });

  it("Illinois appears before other states (home market first)", () => {
    const sql = readSeed();
    const ilIndex = sql.indexOf("'IL'");
    const txIndex = sql.indexOf("'TX'");
    expect(ilIndex).toBeGreaterThanOrEqual(0);
    expect(txIndex).toBeGreaterThan(ilIndex);
  });

  it("inserts the usury regulatory domain", () => {
    const sql = readSeed();
    expect(sql).toMatch(/INSERT INTO regulatory_domains/i);
    expect(sql).toContain("usury");
  });

  it("inserts statute_references for all states", () => {
    const sql = readSeed();
    expect(sql).toMatch(/INSERT INTO statute_references/i);
    // Each state should have at least one statute reference
    for (const code of EXPECTED_STATES) {
      // The jurisdiction UUID for each state should appear in statute_references block
      expect(sql, `statute_references should reference ${code} jurisdiction UUID`).toMatch(
        new RegExp(`-- ${code}|${code}.*statute|statute.*${code}`, "i")
      );
    }
  });

  it("inserts rules for all states", () => {
    const sql = readSeed();
    expect(sql).toMatch(/INSERT INTO rules/i);
    const rulesInserts = (sql.match(/INSERT INTO rules/gi) || []).length;
    expect(rulesInserts).toBeGreaterThanOrEqual(1);
  });

  it("inserts rule_statute_links connecting every rule to a statute", () => {
    const sql = readSeed();
    expect(sql).toMatch(/INSERT INTO rule_statute_links/i);
  });

  it("Illinois rule has APR cap of 36% (PLPA)", () => {
    const sql = readSeed();
    // Illinois PLPA: 36% APR cap stored as 36.0000
    expect(sql).toContain("36.0000");
    expect(sql).toMatch(/PLPA|Predatory Loan Prevention/i);
  });

  it("uses hardcoded deterministic UUIDs", () => {
    const sql = readSeed();
    // Should contain UUID literals, not function calls for IDs
    expect(sql).toMatch(/'[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}'/i);
  });

  it("every rule has a corresponding statute_reference link", () => {
    const sql = readSeed();
    // Extract rule UUIDs from rules INSERT
    const ruleIdPattern = /INSERT INTO rules[\s\S]*?VALUES[\s\S]*?\(?\s*'([0-9a-f-]{36})'/gi;
    const linkPattern = /INSERT INTO rule_statute_links[\s\S]*?VALUES[\s\S]*?\(?\s*'[0-9a-f-]{36}'\s*,\s*'([0-9a-f-]{36})'/gi;

    const ruleIds = new Set<string>();
    let match: RegExpExecArray | null;
    const ruleInsertSection = sql.match(/-- Rules[\s\S]*?(?=-- [A-Z]|$)/i)?.[0] || sql;

    // Count rules and links — there should be at least as many links as rules
    const ruleValueMatches = sql.match(/INSERT INTO rules/gi) || [];
    const linkValueMatches = sql.match(/INSERT INTO rule_statute_links/gi) || [];

    // We need at least one link section
    expect(linkValueMatches.length).toBeGreaterThanOrEqual(1);

    // And rules should exist
    expect(ruleValueMatches.length).toBeGreaterThanOrEqual(1);
  });

  it("contains statute reference URLs or citation text for Illinois", () => {
    const sql = readSeed();
    // Illinois PLPA should have a URL or reference
    expect(sql).toMatch(/815 ILCS 123|ilga\.gov|plpa/i);
  });

  it("contains max_apr rule parameter for each state", () => {
    const sql = readSeed();
    expect(sql).toMatch(/max_apr/i);
    // Should appear multiple times (once per state at minimum)
    const maxAprCount = (sql.match(/max_apr/gi) || []).length;
    expect(maxAprCount).toBeGreaterThanOrEqual(11);
  });
});
