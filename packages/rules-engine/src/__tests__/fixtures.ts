import type { Rule, DealInput, StatuteReference } from '../types.js';

export function makeStatute(overrides: Partial<StatuteReference> = {}): StatuteReference {
  return {
    id: 'statute-1',
    title: 'Test Statute',
    section: '5.1',
    url: null,
    excerpt: null,
    ...overrides,
  };
}

export function makeRule(overrides: Partial<Rule> = {}): Rule {
  return {
    id: 'rule-1',
    jurisdictionId: 'jur-il',
    stateCode: 'IL',
    domainSlug: 'consumer_credit',
    ruleParameter: 'max_apr',
    comparisonOp: 'lte',
    thresholdValue: 36,
    thresholdMin: null,
    thresholdMax: null,
    conditionField: null,
    conditionOp: null,
    conditionValue: null,
    conditionMin: null,
    conditionMax: null,
    validFrom: '2020-01-01',
    validUntil: null,
    displayDescription: 'APR must not exceed 36%',
    severity: 'violation',
    statuteReferences: [],
    ...overrides,
  };
}

export function makeDeal(overrides: Partial<DealInput> = {}): DealInput {
  return {
    stateCode: 'IL',
    salePrice: 15000,
    downPayment: 3000,
    loanAmount: 12000,
    apr: 24.99,
    termMonths: 48,
    vehicleYear: 2020,
    ...overrides,
  };
}
