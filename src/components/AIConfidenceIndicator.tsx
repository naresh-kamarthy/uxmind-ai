import React from 'react';
import { Info } from 'lucide-react';
import { motion } from 'motion/react';

interface AIConfidenceIndicatorProps {
  confidence: number;
}

export function AIConfidenceIndicator({ confidence }: AIConfidenceIndicatorProps) {
  return (
    <div className="flex flex-col gap-1 group relative">
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">AI Confidence</span>
        <div className="cursor-help">
          <Info className="w-3 h-3 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
        </div>
      </div>
      
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold text-white">{Math.round(confidence)}</span>
        <span className="text-xs text-zinc-500 font-medium">%</span>
        <span className="ml-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
          {confidence >= 90 ? 'High Reliability' : confidence >= 70 ? 'Moderate Reliability' : 'Low Reliability'}
        </span>
      </div>

      {/* Tooltip */}
      <div className="absolute bottom-full left-0 mb-2 w-48 p-2 bg-zinc-800 border border-white/10 rounded-lg text-[10px] text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl">
        Confidence indicates how reliable the AI analysis is based on UI clarity, layout structure, and visual pattern detection.
      </div>

      <div className="mt-1 h-1 w-full bg-white/5 rounded-full overflow-hidden">
        <motion.div 
          className="h-full bg-blue-500"
          initial={{ width: 0 }}
          animate={{ width: `${confidence}%` }}
          transition={{ duration: 1 }}
        />
      </div>
    </div>
  );
}
