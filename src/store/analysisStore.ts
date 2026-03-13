import { create } from 'zustand';
import { AnalysisState, AnalysisResult, Metrics, HistoryItem } from '../types';

const HISTORY_KEY = 'uxmind_history';
const MAX_HISTORY_ITEMS = 3;

const loadHistory = (): HistoryItem[] => {
  try {
    const saved = localStorage.getItem(HISTORY_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

const saveHistory = (history: HistoryItem[]): HistoryItem[] => {
  let currentHistory = [...history];
  
  // Try to save, progressively removing oldest items if quota is exceeded
  while (currentHistory.length > 0) {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(currentHistory));
      return currentHistory;
    } catch (err) {
      // Check if it's a quota error
      if (err instanceof DOMException && 
          (err.name === 'QuotaExceededError' || 
           err.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
           err.code === 22)) {
        currentHistory.pop(); // Remove oldest
      } else {
        console.error('Failed to save history:', err);
        break;
      }
    }
  }
  
  // If we couldn't even save one item, clear it
  if (currentHistory.length === 0) {
    try {
      localStorage.removeItem(HISTORY_KEY);
    } catch (e) {
      // Ignore
    }
  }
  return [];
};

export const useAnalysisStore = create<AnalysisState>((set, get) => ({
  screenshot: null,
  isAnalyzing: false,
  progress: 0,
  result: null,
  metrics: null,
  error: null,
  history: loadHistory(),
  issueFilter: 'All',

  setScreenshot: (url) => set({ screenshot: url, result: null, metrics: null, error: null }),
  
  startAnalysis: () => set({ isAnalyzing: true, error: null, progress: 0 }),
  
  finishAnalysis: (result, metrics) => {
    const { screenshot, history } = get();
    
    let newHistory = history;
    if (screenshot) {
      const newItem: HistoryItem = {
        id: crypto.randomUUID(),
        screenshot,
        uiType: result.uiType,
        uxScore: result.uxScore,
        timestamp: Date.now(),
        result,
        metrics,
      };
      // Keep only the most recent items
      const candidateHistory = [newItem, ...history].slice(0, MAX_HISTORY_ITEMS);
      newHistory = saveHistory(candidateHistory);
    }

    set({ 
      result, 
      metrics, 
      isAnalyzing: false, 
      progress: 100,
      history: newHistory,
      error: null
    });
  },
  
  setError: (error) => set({ error, isAnalyzing: false, progress: 0 }),
  
  setProgress: (progress) => set({ progress }),

  setIssueFilter: (filter) => set({ issueFilter: filter }),

  loadFromHistory: (item) => set({
    screenshot: item.screenshot,
    result: item.result,
    metrics: item.metrics,
    error: null,
    isAnalyzing: false,
    progress: 100
  }),

  clearHistory: () => {
    localStorage.removeItem(HISTORY_KEY);
    set({ history: [] });
  },
  
  reset: () => set({ 
    screenshot: null, 
    isAnalyzing: false, 
    progress: 0, 
    result: null, 
    metrics: null, 
    error: null,
    issueFilter: 'All'
  }),
}));
