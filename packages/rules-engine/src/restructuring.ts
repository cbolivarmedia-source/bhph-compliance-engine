import type { DealInput, Violation, RestructuringSuggestion } from './types.js';
import { calculateMonthlyPayment, findMaxAllowedApr } from './math.js';

export function suggestIncreaseDownPayment(
  input: DealInput,
  violations: Violation[],
  maxDownPaymentPct: number = 50
): RestructuringSuggestion | null {
  const maxAllowedApr = findMaxAllowedApr(violations);
  if (maxAllowedApr === null) return null;

  const originalMonthlyPayment = calculateMonthlyPayment(input.loanAmount, input.apr, input.termMonths);

  // Reference: monthly payment of the deal at the capped APR (same loan, same term)
  const referenceMonthly = calculateMonthlyPayment(input.loanAmount, maxAllowedApr, input.termMonths);

  // Find the loan amount at the original (high) APR that matches the reference monthly.
  // Since original APR > maxAllowedApr, this loan amount is smaller than the original,
  // meaning the buyer needs to put more down.
  let suggestedLoanAmount: number;
  if (input.apr === 0) {
    suggestedLoanAmount = Math.round(referenceMonthly * input.termMonths * 100) / 100;
  } else {
    const r = input.apr / 100 / 12;
    suggestedLoanAmount = Math.round((referenceMonthly * (1 - Math.pow(1 + r, -input.termMonths)) / r) * 100) / 100;
  }

  const suggestedDownPayment = Math.round((input.salePrice - suggestedLoanAmount) * 100) / 100;

  if (suggestedDownPayment > input.salePrice) return null;
  if (suggestedDownPayment < 0) return null;
  if (suggestedDownPayment > (maxDownPaymentPct / 100) * input.salePrice) return null;

  const suggestedMonthlyPayment = calculateMonthlyPayment(suggestedLoanAmount, maxAllowedApr, input.termMonths);

  return {
    strategy: 'increase_down_payment',
    suggestedApr: maxAllowedApr,
    suggestedTermMonths: input.termMonths,
    suggestedDownPayment,
    suggestedSalePrice: null,
    suggestedLoanAmount,
    originalMonthlyPayment,
    suggestedMonthlyPayment,
    explanation: null,
  };
}

export function generateRestructuringSuggestions(
  input: DealInput,
  violations: Violation[]
): RestructuringSuggestion[] {
  const candidates = [
    suggestReduceApr(input, violations),
    suggestExtendTerm(input, violations),
    suggestIncreaseDownPayment(input, violations),
  ];
  return candidates.filter((s): s is RestructuringSuggestion => s !== null);
}

export function suggestExtendTerm(
  input: DealInput,
  violations: Violation[],
  maxTermMonths: number = 72
): RestructuringSuggestion | null {
  const maxAllowedApr = findMaxAllowedApr(violations);
  if (maxAllowedApr === null) return null;
  if (input.termMonths >= maxTermMonths) return null;

  const originalMonthlyPayment = calculateMonthlyPayment(input.loanAmount, input.apr, input.termMonths);

  for (let term = input.termMonths + 6; term <= maxTermMonths; term += 6) {
    const suggestedMonthlyPayment = calculateMonthlyPayment(input.loanAmount, maxAllowedApr, term);
    if (suggestedMonthlyPayment < originalMonthlyPayment) {
      return {
        strategy: 'extend_term',
        suggestedApr: maxAllowedApr,
        suggestedTermMonths: term,
        suggestedDownPayment: null,
        suggestedSalePrice: null,
        suggestedLoanAmount: input.loanAmount,
        originalMonthlyPayment,
        suggestedMonthlyPayment,
        explanation: null,
      };
    }
  }

  return null;
}

export function suggestReduceApr(
  input: DealInput,
  violations: Violation[]
): RestructuringSuggestion | null {
  const maxAllowedApr = findMaxAllowedApr(violations);
  if (maxAllowedApr === null) return null;
  if (input.apr <= maxAllowedApr) return null;

  const originalMonthlyPayment = calculateMonthlyPayment(input.loanAmount, input.apr, input.termMonths);
  const suggestedMonthlyPayment = calculateMonthlyPayment(input.loanAmount, maxAllowedApr, input.termMonths);

  return {
    strategy: 'reduce_apr',
    suggestedApr: maxAllowedApr,
    suggestedTermMonths: input.termMonths,
    suggestedDownPayment: null,
    suggestedSalePrice: null,
    suggestedLoanAmount: input.loanAmount,
    originalMonthlyPayment,
    suggestedMonthlyPayment,
    explanation: null,
  };
}
