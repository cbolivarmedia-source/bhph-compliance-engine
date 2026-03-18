import type { DealInput, Rule, RuleParameter, Violation, ComplianceResult, RuleLoader } from './types.js';
import { calculateTotalInterest } from './math.js';
import { passesComparison } from './comparisons.js';
import { evaluateCondition } from './conditions.js';

export function getDealValueForParameter(param: RuleParameter, input: DealInput): number | null {
  switch (param) {
    case 'max_apr':                return input.apr;
    case 'max_finance_charge_rate': return input.apr;
    case 'max_loan_amount':        return input.loanAmount;
    case 'min_down_payment_pct':   return (input.downPayment / input.salePrice) * 100;
    case 'max_total_interest':     return calculateTotalInterest(input);
  }
}

export function filterApplicableRules(rules: Rule[], input: DealInput): Rule[] {
  return rules.filter(rule => evaluateCondition(rule, input));
}
