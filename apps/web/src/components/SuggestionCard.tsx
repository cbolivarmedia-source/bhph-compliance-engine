'use client';

type RestructuringStrategy =
  | 'reduce_apr'
  | 'extend_term'
  | 'increase_down_payment'
  | 'reduce_sale_price'
  | 'combined';

interface RestructuringSuggestion {
  strategy: RestructuringStrategy;
  suggestedApr: number | null;
  suggestedTermMonths: number | null;
  suggestedDownPayment: number | null;
  suggestedSalePrice: number | null;
  suggestedLoanAmount: number | null;
  originalMonthlyPayment: number;
  suggestedMonthlyPayment: number;
  explanation: string | null;
}

interface SuggestionCardProps {
  suggestion: RestructuringSuggestion;
  originalDeal: {
    apr: number;
    termMonths: number;
    downPayment: number;
    salePrice: number;
  };
}

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

const STRATEGY_LABELS: Record<RestructuringStrategy, string> = {
  reduce_apr: 'Reduce APR',
  extend_term: 'Extend Term',
  increase_down_payment: 'Increase Down Payment',
  reduce_sale_price: 'Reduce Sale Price',
  combined: 'Combined Adjustments',
};

function Arrow() {
  return (
    <svg className="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    </svg>
  );
}

function CompareRow({ label, before, after }: { label: string; before: string; after: string }) {
  return (
    <div className="flex items-center justify-between gap-2 text-sm">
      <span className="text-slate-500 text-xs w-24 flex-shrink-0">{label}</span>
      <span className="text-slate-700">{before}</span>
      <Arrow />
      <span className="font-semibold text-slate-900">{after}</span>
    </div>
  );
}

function ExplanationSkeleton() {
  return (
    <div className="space-y-1.5 animate-pulse">
      <div className="h-3 bg-slate-200 rounded w-full" />
      <div className="h-3 bg-slate-200 rounded w-5/6" />
      <div className="h-3 bg-slate-200 rounded w-4/6" />
    </div>
  );
}

export function SuggestionCard({ suggestion, originalDeal }: SuggestionCardProps) {
  const savings = suggestion.originalMonthlyPayment - suggestion.suggestedMonthlyPayment;
  const label = STRATEGY_LABELS[suggestion.strategy] ?? suggestion.strategy;

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-5 flex flex-col gap-4 min-w-[260px]">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-bold text-slate-900">{label}</h3>
        {savings > 0 && (
          <span className="flex-shrink-0 inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />
            </svg>
            Save {currency.format(savings)}/mo
          </span>
        )}
      </div>

      {/* Before/after comparisons */}
      <div className="space-y-2">
        <CompareRow
          label="Monthly"
          before={currency.format(suggestion.originalMonthlyPayment)}
          after={currency.format(suggestion.suggestedMonthlyPayment)}
        />
        {suggestion.suggestedApr !== null && (
          <CompareRow
            label="APR"
            before={`${originalDeal.apr.toFixed(2)}%`}
            after={`${suggestion.suggestedApr.toFixed(2)}%`}
          />
        )}
        {suggestion.suggestedTermMonths !== null && (
          <CompareRow
            label="Term"
            before={`${originalDeal.termMonths} mo`}
            after={`${suggestion.suggestedTermMonths} mo`}
          />
        )}
        {suggestion.suggestedDownPayment !== null && (
          <CompareRow
            label="Down"
            before={currency.format(originalDeal.downPayment)}
            after={currency.format(suggestion.suggestedDownPayment)}
          />
        )}
        {suggestion.suggestedSalePrice !== null && (
          <CompareRow
            label="Price"
            before={currency.format(originalDeal.salePrice)}
            after={currency.format(suggestion.suggestedSalePrice)}
          />
        )}
      </div>

      {/* AI explanation (with graceful loading skeleton) */}
      <div className="border-t border-slate-100 pt-3">
        <p className="text-xs font-medium text-slate-500 mb-1.5">Why this works</p>
        {suggestion.explanation ? (
          <p className="text-xs text-slate-600 leading-relaxed">{suggestion.explanation}</p>
        ) : (
          <ExplanationSkeleton />
        )}
      </div>
    </div>
  );
}

export function SuggestionCards({
  suggestions,
  originalDeal,
}: {
  suggestions: RestructuringSuggestion[];
  originalDeal: SuggestionCardProps['originalDeal'];
}) {
  if (suggestions.length === 0) return null;

  return (
    <div>
      <h3 className="text-sm font-semibold text-slate-700 mb-3">Restructuring Options</h3>
      <div className="flex gap-4 overflow-x-auto pb-2 sm:grid sm:grid-cols-2 sm:overflow-visible lg:grid-cols-3">
        {suggestions.map((s, i) => (
          <SuggestionCard key={i} suggestion={s} originalDeal={originalDeal} />
        ))}
      </div>
    </div>
  );
}
