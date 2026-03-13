import React, { useState } from 'react';
import { RefreshCcw, Sparkles } from 'lucide-react';
import { useAIAnalysis } from '../hooks/useAIAnalysis';
import { motion } from 'motion/react';

interface SectionRegeneratorProps {
  section: string;
  content: string;
  onUpdate?: (newContent: string) => void;
}

export const SectionRegenerator: React.FC<SectionRegeneratorProps> = ({ section, content, onUpdate }) => {
  const { regenerateSection } = useAIAnalysis();
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [currentContent, setCurrentContent] = useState(content);

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      const newContent = await regenerateSection(section, currentContent);
      if (newContent) {
        setCurrentContent(newContent);
        onUpdate?.(newContent);
      }
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <div className="group relative bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl p-4 transition-all duration-300">
      <div className="flex justify-between items-start mb-2">
        <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          {section}
        </span>
        <button
          onClick={handleRegenerate}
          disabled={isRegenerating}
          className="p-1.5 rounded-lg bg-white/5 hover:bg-emerald-500 hover:text-black transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          title="Regenerate this suggestion"
        >
          <RefreshCcw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
        </button>
      </div>
      
      <p className="text-sm text-zinc-300 leading-relaxed">
        {currentContent}
      </p>

      {isRegenerating && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-black/40 backdrop-blur-[1px] rounded-xl flex items-center justify-center"
        >
          <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 rounded-full border border-white/10 shadow-xl">
            <RefreshCcw className="w-3 h-3 animate-spin text-emerald-400" />
            <span className="text-[10px] font-bold text-white uppercase tracking-wider">Regenerating...</span>
          </div>
        </motion.div>
      )}
    </div>
  );
};
