import React from 'react';
import { useAnalysisStore } from '../store/analysisStore';
import { Severity } from '../types';

const FILTERS: (Severity | 'All')[] = ['All', 'High', 'Medium', 'Low'];

export function IssueFilterTabs() {
  const { issueFilter, setIssueFilter } = useAnalysisStore();

  return (
    <div className="flex items-center gap-1 p-1 bg-black/20 rounded-lg mb-4">
      {FILTERS.map((filter) => (
        <button
          key={filter}
          onClick={() => setIssueFilter(filter)}
          className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all ${
            issueFilter === filter
              ? 'bg-zinc-800 text-white shadow-sm'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          {filter}
        </button>
      ))}
    </div>
  );
}
