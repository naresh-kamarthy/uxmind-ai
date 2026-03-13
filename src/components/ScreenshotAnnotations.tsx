import React, { useCallback, useMemo } from 'react';
import { UXIssue } from '../types';
import { motion } from 'motion/react';

interface ScreenshotAnnotationsProps {
  screenshot: string;
  issues: UXIssue[];
}

export const ScreenshotAnnotations: React.FC<ScreenshotAnnotationsProps> = ({ screenshot, issues = [] }) => {
  const containerRef = React.useRef<HTMLDivElement>(null);

  if (!screenshot) return null;

  const getSeverityColor = useCallback((severity: string) => {
    switch (severity.toLowerCase()) {
      case 'high': return 'border-red-500 bg-red-500/10';
      case 'medium': return 'border-yellow-500 bg-yellow-500/10';
      case 'low': return 'border-blue-500 bg-blue-500/10';
      default: return 'border-emerald-500 bg-emerald-500/10';
    }
  }, []);

  const renderedAnnotations = useMemo(() => (
    issues.map((issue, index) => {
      if (!issue.coordinates) return null;
      
      const { x, y, width, height } = issue.coordinates;
      
      return (
        <motion.div
          key={`${issue.title}-${index}`}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 + index * 0.1 }}
          className={`absolute border-2 rounded-sm pointer-events-auto cursor-help group ${getSeverityColor(issue.severity)}`}
          style={{
            left: `${x}%`,
            top: `${y}%`,
            width: `${width}%`,
            height: `${height}%`,
          }}
        >
          <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block z-50">
            <div className="bg-zinc-900 text-white text-[10px] p-2 rounded shadow-xl border border-white/10 whitespace-nowrap">
              <p className="font-bold uppercase tracking-widest text-emerald-400 mb-1">{issue.type || 'Issue'}</p>
              <p className="font-medium">{issue.title}</p>
            </div>
          </div>
        </motion.div>
      );
    })
  ), [issues, getSeverityColor]);

  return (
    <div ref={containerRef} data-testid="annotations-container" className="relative w-full h-full flex items-center justify-center">
      <img 
        src={screenshot} 
        alt="UI Preview" 
        className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
        referrerPolicy="no-referrer"
      />
      
      {/* Overlay Layer */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="relative inline-block">
          {/* This inner div should match the displayed image dimensions */}
          <img 
            src={screenshot} 
            alt="Reference" 
            className="invisible max-w-full max-h-full object-contain"
            aria-hidden="true"
          />
          
          {renderedAnnotations}
        </div>
      </div>
    </div>
  );
};
