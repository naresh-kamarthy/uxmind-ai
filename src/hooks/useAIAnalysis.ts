import { useCallback } from 'react';
import { useAnalysisStore } from '../store/analysisStore';
import { analyzeScreenshot, regenerateSection as apiRegenerateSection } from '../services/geminiService';
import { estimateCost, generateConfidence } from '../utils/tokenEstimator';
import { AnalysisResult } from '../types';

const FALLBACK_RESULT: AnalysisResult = {
  uxScore: 65,
  uiType: "Generic Interface",
  metrics: {
    accessibility: 70,
    mobile: 60,
    hierarchy: 75,
    consistency: 65
  },
  issues: [
    {
      title: "Navigation Clarity",
      severity: "Medium",
      description: "Navigation elements might be too dense for mobile users.",
      type: "hierarchy",
      coordinates: { x: 10, y: 10, width: 80, height: 10 }
    },
    {
      title: "Color Contrast",
      severity: "High",
      description: "Check text contrast ratios on primary call-to-action buttons.",
      type: "contrast",
      coordinates: { x: 40, y: 45, width: 20, height: 10 }
    }
  ],
  improvements: [
    "Increase primary button prominence",
    "Improve text contrast",
    "Reduce navigation items",
    "Standardize spacing"
  ]
};

export const useAIAnalysis = () => {
  const { screenshot, startAnalysis, finishAnalysis, setError, setProgress } = useAnalysisStore();

  const runAnalysis = useCallback(async () => {
    if (!screenshot) return;

    startAnalysis();
    const startTime = Date.now();

    try {
      // Step 1: Processing screenshot
      setProgress(15);
      
      const { result, tokens } = await analyzeScreenshot(screenshot);
      
      const endTime = Date.now();
      const latency = endTime - startTime;

      const metrics = {
        latency: latency,
        tokensUsed: tokens,
        estimatedCost: estimateCost(tokens),
        confidence: generateConfidence(),
      };

      finishAnalysis(result, metrics);
    } catch (err) {
      console.error('Analysis failed:', err);
      setError("AI Analysis Failed. We couldn't complete the UX review. Please try again.");
    }
  }, [screenshot, startAnalysis, finishAnalysis, setError, setProgress]);

  const regenerateSection = useCallback(async (section: string, currentContent: string) => {
    if (!screenshot) return null;
    return await apiRegenerateSection(section, currentContent, screenshot);
  }, [screenshot]);

  return { runAnalysis, regenerateSection };
};
