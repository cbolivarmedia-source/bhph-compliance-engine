'use client';
import { useState } from 'react';

interface StatuteReference {
  id: string;
  title: string;
  section: string | null;
  url: string | null;
  excerpt: string | null;
}

interface Rule {
  id: string;
  ruleParameter: string;
  displayDescription: string;
  severity: 'violation' | 'warning';
  statuteReferences: StatuteReference[];
}

interface ApplicableRulesProps {
  rules: Rule[];
}

export function ApplicableRules({ rules }: ApplicableRulesProps) {
  const [open, setOpen] = useState(false);

  if (rules.length === 0) return null;

  return (
    <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-slate-50 transition-colors"
      >
        <span className="text-sm font-medium text-slate-700">
          Rules Checked ({rules.length})
        </span>
        <svg
          className={`w-4 h-4 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {open && (
        <div className="border-t border-slate-100 divide-y divide-slate-100">
          {rules.map(rule => (
            <div key={rule.id} className="px-4 py-3 space-y-1">
              <p className="text-sm text-slate-800">{rule.displayDescription}</p>
              {rule.statuteReferences.length > 0 && (
                <div className="flex flex-wrap gap-x-3 gap-y-1">
                  {rule.statuteReferences.map(ref => (
                    <span key={ref.id}>
                      {ref.url ? (
                        <a
                          href={ref.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:text-blue-800 underline underline-offset-2"
                          title={ref.excerpt ?? undefined}
                        >
                          {ref.title}{ref.section ? ` § ${ref.section}` : ''}
                        </a>
                      ) : (
                        <span className="text-xs text-slate-500">
                          {ref.title}{ref.section ? ` § ${ref.section}` : ''}
                        </span>
                      )}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
