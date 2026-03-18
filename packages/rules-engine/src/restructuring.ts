import type { DealInput, Violation, RestructuringSuggestion } from './types.js';
import { calculateMonthlyPayment, findMaxAllowedApr } from './math.js';

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
