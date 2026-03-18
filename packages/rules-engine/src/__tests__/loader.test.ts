import { createMockRuleLoader } from '../loader.js';
import { makeRule } from './fixtures.js';

describe('createMockRuleLoader', () => {
  const asOf = new Date('2026-01-15');

  it('filters rules by stateCode', async () => {
    const rules = [
      makeRule({ id: 'il-rule', stateCode: 'IL' }),
      makeRule({ id: 'tx-rule', stateCode: 'TX' }),
    ];
    const loader = createMockRuleLoader(rules);
    const result = await loader.loadRules('IL', 'consumer_credit', asOf);
    expect(result).toHaveLength(1);
    expect(result[0]!.id).toBe('il-rule');
  });

  it('filters rules by domainSlug', async () => {
    const rules = [
      makeRule({ id: 'credit-rule', domainSlug: 'consumer_credit' }),
      makeRule({ id: 'other-rule', domainSlug: 'other_domain' }),
    ];
    const loader = createMockRuleLoader(rules);
    const result = await loader.loadRules('IL', 'consumer_credit', asOf);
    expect(result).toHaveLength(1);
    expect(result[0]!.id).toBe('credit-rule');
  });

  it('excludes rules whose validFrom is after asOfDate', async () => {
    const rules = [
      makeRule({ id: 'current', validFrom: '2025-01-01', validUntil: null }),
      makeRule({ id: 'future', validFrom: '2027-01-01', validUntil: null }),
    ];
    const loader = createMockRuleLoader(rules);
    const result = await loader.loadRules('IL', 'consumer_credit', asOf);
    expect(result).toHaveLength(1);
    expect(result[0]!.id).toBe('current');
  });

  it('excludes rules whose validUntil is on or before asOfDate', async () => {
    const rules = [
      makeRule({ id: 'active', validFrom: '2020-01-01', validUntil: null }),
      makeRule({ id: 'expired', validFrom: '2020-01-01', validUntil: '2025-06-01' }),
    ];
    const loader = createMockRuleLoader(rules);
    const result = await loader.loadRules('IL', 'consumer_credit', asOf);
    expect(result).toHaveLength(1);
    expect(result[0]!.id).toBe('active');
  });

  it('includes rules with no expiration (validUntil null)', async () => {
    const rules = [makeRule({ validFrom: '2020-01-01', validUntil: null })];
    const loader = createMockRuleLoader(rules);
    const result = await loader.loadRules('IL', 'consumer_credit', asOf);
    expect(result).toHaveLength(1);
  });
});
