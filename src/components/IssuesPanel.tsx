import React, { useMemo } from 'react';
import { AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { UXIssue, Severity } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { useAnalysisStore } from '../store/analysisStore';
import { IssueFilterTabs } from './IssueFilterTabs';

const SeverityBadge = ({ severity }: { severity: Severity }) => {
  const colors = {
    High: 'bg-red-500/10 text-red-400 border-red-500/20',
    Medium: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    Low: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
  };

  return (
    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${colors[severity]}`}>
      {severity}
    </span>
  );
};

const IssueIcon = ({ severity }: { severity: Severity }) => {
  switch (severity) {
    case 'High': return <AlertCircle className="w-5 h-5 text-red-400" />;
    case 'Medium': return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
    case 'Low': return <Info className="w-5 h-5 text-zinc-400" />;
  }
};

export const IssuesPanel = ({ issues = [] }: { issues?: UXIssue[] }) => {
  const { issueFilter } = useAnalysisStore();

  const filteredIssues = useMemo(() => 
    issues.filter(issue => 
      issueFilter === 'All' || issue.severity === issueFilter
    ), [issues, issueFilter]
  );

  if (issues.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center h-full">
        <Info className="w-8 h-8 text-zinc-700 mb-2" />
        <p className="text-sm text-zinc-400 font-medium">No issues detected yet.</p>
        <p className="text-xs text-zinc-500 mt-1 px-8">Upload a screenshot to start the AI analysis.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <IssueFilterTabs />
      
      <div className="flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar flex-1">
        <AnimatePresence mode="popLayout">
          {filteredIssues.length > 0 ? (
            filteredIssues.map((issue, idx) => (
              <motion.div
                key={`${issue.title}-${idx}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="bg-zinc-900/50 border border-white/5 rounded-xl p-4 hover:border-white/10 transition-colors group"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <IssueIcon severity={issue.severity} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-sm font-semibold text-white group-hover:text-emerald-400 transition-colors">
                        {issue.title}
                      </h3>
                      <SeverityBadge severity={issue.severity} />
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      {issue.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-12 text-center"
            >
              <Info className="w-8 h-8 text-zinc-700 mb-2" />
              <p className="text-xs text-zinc-500">No {issueFilter.toLowerCase()} severity issues found.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
