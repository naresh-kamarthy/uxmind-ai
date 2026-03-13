import React from 'react';
import { AlertCircle, RefreshCcw } from 'lucide-react';
import { motion } from 'motion/react';

interface ErrorStateCardProps {
  onRetry: () => void;
}

export function ErrorStateCard({ onRetry }: ErrorStateCardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center p-8 text-center bg-zinc-900/80 backdrop-blur-xl border border-red-500/20 rounded-2xl shadow-2xl max-w-md mx-auto"
    >
      <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
        <AlertCircle className="w-8 h-8 text-red-500" />
      </div>
      
      <h3 className="text-xl font-bold text-white mb-2">AI Analysis Failed</h3>
      <p className="text-zinc-400 text-sm mb-8 leading-relaxed">
        We couldn't complete the UX review. This might be due to a network issue or a temporary AI service interruption.
      </p>
      
      <button
        onClick={onRetry}
        className="flex items-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-400 text-white rounded-xl font-bold transition-all active:scale-95 shadow-lg shadow-red-500/20"
      >
        <RefreshCcw className="w-4 h-4" />
        Retry Analysis
      </button>
    </motion.div>
  );
}
