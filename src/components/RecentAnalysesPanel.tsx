import React from 'react';
import { History, Clock, ChevronRight } from 'lucide-react';
import { useAnalysisStore } from '../store/analysisStore';
import { motion } from 'motion/react';

export function RecentAnalysesPanel() {
  const { history, loadFromHistory, clearHistory } = useAnalysisStore();

  if (history.length === 0) {
    return (
      <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center text-center py-12">
        <History className="w-8 h-8 text-zinc-700 mb-2" />
        <p className="text-sm text-zinc-400 font-medium">No recent analyses</p>
        <p className="text-xs text-zinc-500 mt-1">Your analysis history will appear here.</p>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
          <History className="w-4 h-4 text-zinc-400" />
          Recent Analyses
        </h2>
        <button 
          onClick={clearHistory}
          className="text-[10px] font-bold text-zinc-500 hover:text-red-400 uppercase tracking-wider transition-colors"
        >
          Clear
        </button>
      </div>
      
      <div className="space-y-3">
        {history.map((item, index) => (
          <motion.button
            key={item.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => loadFromHistory(item)}
            className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors group text-left"
          >
            <div className="w-12 h-12 rounded-lg overflow-hidden border border-white/10 shrink-0">
              <img 
                src={item.screenshot} 
                alt="Thumbnail" 
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all"
                referrerPolicy="no-referrer"
              />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-sm font-bold text-zinc-200 truncate group-hover:text-emerald-400 transition-colors">
                  {item.uiType}
                </span>
                <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                  {item.uxScore}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-zinc-500">
                <Clock className="w-3 h-3" />
                {new Date(item.timestamp).toLocaleDateString()} at {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
            
            <ChevronRight className="w-4 h-4 text-zinc-700 group-hover:text-zinc-400 transition-colors" />
          </motion.button>
        ))}
      </div>
    </div>
  );
}
