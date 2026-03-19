'use client';
import { useState, useEffect } from 'react';

interface Jurisdiction {
  id: string;
  state_code: string;
  state_name: string;
}

interface StateSelectorProps {
  value: string;
  onChange: (stateCode: string) => void;
  disabled?: boolean;
}

export function StateSelector({ value, onChange, disabled }: StateSelectorProps) {
  const [jurisdictions, setJurisdictions] = useState<Jurisdiction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/jurisdictions')
      .then(r => r.json())
      .then(data => setJurisdictions(data.jurisdictions || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <label htmlFor="state" className="block text-sm font-medium text-slate-700 mb-1">
        State
      </label>
      <select
        id="state"
        value={value}
        onChange={e => onChange(e.target.value)}
        disabled={loading || disabled}
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-400"
      >
        <option value="">{loading ? 'Loading states...' : 'Select a state...'}</option>
        {jurisdictions.map(j => (
          <option key={j.id} value={j.state_code}>
            {j.state_name} ({j.state_code})
          </option>
        ))}
      </select>
    </div>
  );
}
