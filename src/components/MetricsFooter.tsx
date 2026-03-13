import { Activity, Database, DollarSign, Zap } from 'lucide-react';
import { Metrics } from '../types';

export const MetricsFooter = ({ metrics }: { metrics?: Metrics }) => {
  if (!metrics) return null;

  return (
    <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 py-4 px-6 bg-black/40 border-t border-white/5 backdrop-blur-md">
      <div className="flex items-center gap-2">
        <Activity className="w-4 h-4 text-zinc-500" />
        <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Latency:</span>
        <span className="text-xs font-mono text-zinc-300">{metrics.latency.toFixed(0)}ms</span>
      </div>
      
      <div className="flex items-center gap-2">
        <Database className="w-4 h-4 text-zinc-500" />
        <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Tokens:</span>
        <span className="text-xs font-mono text-zinc-300">{metrics.tokensUsed}</span>
      </div>

      <div className="flex items-center gap-2">
        <DollarSign className="w-4 h-4 text-zinc-500" />
        <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Cost:</span>
        <span className="text-xs font-mono text-zinc-300">${metrics.estimatedCost.toFixed(4)}</span>
      </div>

      <div className="flex items-center gap-2">
        <Zap className="w-4 h-4 text-zinc-500" />
        <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Confidence:</span>
        <span className="text-xs font-mono text-zinc-300">{metrics.confidence.toFixed(0)}%</span>
      </div>
    </div>
  );
};
