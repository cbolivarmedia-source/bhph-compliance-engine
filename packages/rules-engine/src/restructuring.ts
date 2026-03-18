import type { DealInput, Violation, RestructuringSuggestion } from './types.js';
import { calculateMonthlyPayment, findMaxAllowedApr } from './math.js';

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
