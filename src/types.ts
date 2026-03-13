export type Severity = 'Low' | 'Medium' | 'High';

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface UXIssue {
  title: string;
  severity: Severity;
  description: string;
  type?: 'contrast' | 'spacing' | 'hierarchy' | 'cta' | 'accessibility' | 'other';
  coordinates?: BoundingBox;
}

export interface AnalysisResult {
  uxScore: number;
  uiType: string;
  metrics: {
    accessibility: number;
    mobile: number;
    hierarchy: number;
    consistency: number;
  };
  issues: UXIssue[];
  improvements: string[];
}

export interface Metrics {
  latency: number;
  tokensUsed: number;
  estimatedCost: number;
  confidence: number;
}

export interface HistoryItem {
  id: string;
  screenshot: string;
  uiType: string;
  uxScore: number;
  timestamp: number;
  result: AnalysisResult;
  metrics: Metrics;
}

export interface AnalysisState {
  screenshot: string | null;
  isAnalyzing: boolean;
  progress: number;
  result: AnalysisResult | null;
  metrics: Metrics | null;
  error: string | null;
  history: HistoryItem[];
  issueFilter: Severity | 'All';
  setScreenshot: (url: string | null) => void;
  startAnalysis: () => void;
  finishAnalysis: (result: AnalysisResult, metrics: Metrics) => void;
  setError: (error: string | null) => void;
  setProgress: (progress: number) => void;
  setIssueFilter: (filter: Severity | 'All') => void;
  loadFromHistory: (item: HistoryItem) => void;
  clearHistory: () => void;
  reset: () => void;
}
