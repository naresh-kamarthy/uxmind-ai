import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, Circle, Loader2 } from 'lucide-react';

const steps = [
  { id: 1, label: 'Evaluating layout hierarchy' },
  { id: 2, label: 'Checking accessibility' },
  { id: 3, label: 'Detecting spacing issues' },
  { id: 4, label: 'Reviewing CTA visibility' },
];

export const AIThinking = () => {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev < steps.length ? prev + 1 : prev));
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-zinc-900/80 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl">
      <div className="relative mb-8">
        <div className="w-20 h-20 rounded-full border-4 border-emerald-500/20 flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-emerald-400 animate-spin" />
        </div>
        <motion.div 
          className="absolute inset-0 bg-emerald-500/10 blur-2xl rounded-full"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </div>

      <h3 className="text-xl font-bold text-white mb-6">Analyzing UX...</h3>

      <div className="w-full max-w-xs space-y-4">
        {steps.map((step, index) => (
          <motion.div 
            key={step.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ 
              opacity: index <= currentStep ? 1 : 0.3, 
              x: 0 
            }}
            className="flex items-center gap-3"
          >
            {index < currentStep ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            ) : index === currentStep ? (
              <Loader2 className="w-5 h-5 text-emerald-400 animate-spin" />
            ) : (
              <Circle className="w-5 h-5 text-zinc-700" />
            )}
            <span className={`text-sm font-medium ${index === currentStep ? 'text-white' : 'text-zinc-500'}`}>
              {step.label}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
