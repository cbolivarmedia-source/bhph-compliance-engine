'use client';

interface StatuteReference {
  id: string;
  title: string;
  section: string | null;
  url: string | null;
  excerpt: string | null;
}

interface Violation {
  ruleId: string;
  ruleParameter: string;
  displayDescription: string;
  severity: 'violation' | 'warning';
  actualValue: number;
  thresholdValue: number;
  comparisonOp: string;
  statuteReferences: StatuteReference[];
}

interface ViolationsListProps {
  violations: Violation[];
  warnings: Violation[];
}

function formatValue(param: string, value: number): string {
  if (param.includes('apr') || param.includes('rate') || param.includes('pct')) {
    return `${value.toFixed(2)}%`;
  }
  if (param.includes('amount') || param.includes('price') || param.includes('charge') || param.includes('interest') || param.includes('down_payment')) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  }
  return value.toString();
}

function compOpLabel(op: string): string {
  const map: Record<string, string> = {
    lte: '≤', gte: '≥', lt: '<', gt: '>', eq: '=',
  };
  return map[op] ?? op;
}

function ViolationItem({ v }: { v: Violation }) {
  const isViolation = v.severity === 'violation';

  return (
    <li className={`rounded-lg border px-4 py-4 space-y-2 ${
      isViolation ? 'border-red-200 bg-red-50' : 'border-yellow-200 bg-yellow-50'
    }`}>
      <div className="flex items-start justify-between gap-3">
        <p className={`text-sm font-medium ${isViolation ? 'text-red-800' : 'text-yellow-800'}`}>
          {v.displayDescription}
        </p>
        <span className={`flex-shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
          isViolation
            ? 'bg-red-100 text-red-700'
            : 'bg-yellow-100 text-yellow-700'
        }`}>
          {isViolation ? 'Violation' : 'Warning'}
        </span>
      </div>

      <div className={`text-xs flex flex-wrap gap-x-4 gap-y-1 ${isViolation ? 'text-red-700' : 'text-yellow-700'}`}>
        <span>
          <span className="font-medium">Actual:</span> {formatValue(v.ruleParameter, v.actualValue)}
        </span>
        <span>
          <span className="font-medium">Limit:</span> {compOpLabel(v.comparisonOp)} {formatValue(v.ruleParameter, v.thresholdValue)}
        </span>
      </div>

      {v.statuteReferences.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {v.statuteReferences.map(ref => (
            <span key={ref.id}>
              {ref.url ? (
                <a
                  href={ref.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-1 text-xs underline underline-offset-2 ${
                    isViolation ? 'text-red-700 hover:text-red-900' : 'text-yellow-700 hover:text-yellow-900'
                  }`}
                  title={ref.excerpt ?? undefined}
                >
                  <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                  </svg>
                  {ref.title}{ref.section ? ` § ${ref.section}` : ''}
                </a>
              ) : (
                <span className={`text-xs ${isViolation ? 'text-red-600' : 'text-yellow-600'}`}>
                  {ref.title}{ref.section ? ` § ${ref.section}` : ''}
                </span>
              )}
            </span>
          ))}
        </div>
      )}
    </li>
  );
}

export function ViolationsList({ violations, warnings }: ViolationsListProps) {
  if ((!violations || violations.length === 0) && (!warnings || warnings.length === 0)) return null;

  return (
    <div className="space-y-4">
      {violations.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-red-700 mb-2">
            Violations ({violations.length})
          </h3>
          <ul className="space-y-3">
            {violations.map(v => <ViolationItem key={v.ruleId} v={v} />)}
          </ul>
        </div>
      )}
      {warnings.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-yellow-700 mb-2">
            Warnings ({warnings.length})
          </h3>
          <ul className="space-y-3">
            {warnings.map(v => <ViolationItem key={v.ruleId} v={v} />)}
          </ul>
        </div>
      )}
    </div>
  );
}
