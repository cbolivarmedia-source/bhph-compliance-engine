import type { ConditionField, Rule, DealInput } from './types.js';
import { passesComparison } from './comparisons.js';

export function getConditionValue(field: ConditionField, input: DealInput): number {
  const currentYear = new Date().getFullYear();
  switch (field) {
    case 'loan_amount':       return input.loanAmount;
    case 'vehicle_age_years': return currentYear - input.vehicleYear;
    case 'term_months':       return input.termMonths;
    case 'sale_price':        return input.salePrice;
  }
}

export function evaluateCondition(rule: Rule, input: DealInput): boolean {
  if (rule.conditionField === null) return true;
  if (rule.conditionOp === null) return true;
  const conditionValue = getConditionValue(rule.conditionField, input);
  return passesComparison(
    conditionValue,
    rule.conditionOp,
    rule.conditionValue,
    rule.conditionMin,
    rule.conditionMax
  );
}
