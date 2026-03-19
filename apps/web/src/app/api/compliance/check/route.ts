import { NextRequest, NextResponse } from 'next/server';
import { dealInputSchema } from '@/lib/schemas';
import { SupabaseRuleLoader } from '@/lib/supabase-rule-loader';
import { checkCompliance, generateRestructuringSuggestions } from '@bhph/rules-engine';

export async function POST(request: NextRequest) {
  const body = await request.json();

  // Validate
  const parsed = dealInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { stateCode, salePrice, downPayment, apr, termMonths, vehicleYear } = parsed.data;
  const loanAmount = salePrice - downPayment;

  const dealInput = { stateCode, salePrice, downPayment, loanAmount, apr, termMonths, vehicleYear };

  // Run compliance check
  const loader = new SupabaseRuleLoader();
  const result = await checkCompliance(dealInput, loader, 'usury');

  // Generate suggestions if non-compliant
  const suggestions = result.result === 'fail'
    ? generateRestructuringSuggestions(dealInput, result.violations)
    : [];

  return NextResponse.json({
    ...result,
    suggestions,
  });
}
