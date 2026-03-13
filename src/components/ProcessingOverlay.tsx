import { motion, AnimatePresence } from 'motion/react';
import { Loader2, Search, ShieldCheck, FileText } from 'lucide-react';

interface ProcessingOverlayProps {
  progress: number;
}

export const ProcessingOverlay = ({ progress }: ProcessingOverlayProps) => {
  const getStep = () => {
    if (progress < 25) return { text: "Processing screenshot", icon: <Loader2 className="w-5 h-5 animate-spin" /> };
    if (progress < 50) return { text: "Detecting layout patterns", icon: <Search className="w-5 h-5 text-emerald-400" /> };
    if (progress < 75) return { text: "Evaluating accessibility", icon: <ShieldCheck className="w-5 h-5 text-blue-400" /> };
    return { text: "Generating UX improvements", icon: <FileText className="w-5 h-5 text-purple-400" /> };
  };

  const step = getStep();

  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm rounded-2xl">
      <div className="w-64">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {step.icon}
            <span className="text-sm font-medium text-white">{step.text}</span>
          </div>
          <span className="text-xs font-mono text-zinc-500">{progress}%</span>
        </div>
        
        <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-gradient-to-r from-emerald-500 to-blue-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>
    </div>
  );
};
