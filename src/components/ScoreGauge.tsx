import { motion } from 'motion/react';

interface ScoreGaugeProps {
  score: number;
  label: string;
  max?: number;
}

export const ScoreGauge = ({ score, label, max = 100 }: ScoreGaugeProps) => {
  const percentage = (score / max) * 100;
  
  const getColor = (s: number) => {
    const normalized = max === 100 ? s : (s / max) * 100;
    if (normalized >= 80) return 'text-emerald-400';
    if (normalized >= 50) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-32 h-32 flex items-center justify-center">
        {/* Background Circle */}
        <svg className="w-full h-full -rotate-90">
          <circle
            cx="64"
            cy="64"
            r="58"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-zinc-800"
          />
          {/* Progress Circle */}
          <motion.circle
            cx="64"
            cy="64"
            r="58"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeDasharray={364.4}
            initial={{ strokeDashoffset: 364.4 }}
            animate={{ strokeDashoffset: 364.4 - (364.4 * percentage) / 100 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className={getColor(score)}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-3xl font-bold ${getColor(score)}`}>{score}</span>
          <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">/ {max}</span>
        </div>
      </div>
      <p className="mt-3 text-sm font-medium text-zinc-300">{label}</p>
    </div>
  );
};
