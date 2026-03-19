import type { Rule, RuleLoader } from './types.js';

export function createMockRuleLoader(rules: Rule[]): RuleLoader {
  return {
    async loadRules(stateCode: string, domainSlug: string, asOfDate: Date): Promise<Rule[]> {
      return rules.filter(r => {
        if (r.stateCode !== stateCode) return false;
        if (r.domainSlug !== domainSlug) return false;
        const validFrom = new Date(r.validFrom);
        if (validFrom > asOfDate) return false;
        if (r.validUntil !== null) {
          const validUntil = new Date(r.validUntil);
          if (validUntil <= asOfDate) return false;
        }
        return true;
      });
    },
  };
}
