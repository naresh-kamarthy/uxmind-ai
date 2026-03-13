import { render, screen, fireEvent } from '@testing-library/react';
import App from '../App';
import { useAnalysisStore } from '../store/analysisStore';
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock useAIAnalysis
vi.mock('../hooks/useAIAnalysis', () => ({
  useAIAnalysis: () => ({
    runAnalysis: vi.fn()
  })
}));

describe('App component', () => {
  beforeEach(() => {
    useAnalysisStore.getState().reset();
  });

  it('does not download report if metrics are missing', () => {
    useAnalysisStore.setState({ 
      result: { 
        uxScore: 80,
        metrics: { accessibility: 80, mobile: 70, hierarchy: 90, consistency: 85 }
      } as any, 
      metrics: null, 
      screenshot: 'fake' 
    });
    render(<App />);
    const downloadBtn = screen.getByText('Download PDF Report');
    fireEvent.click(downloadBtn);
    // Should return early and not call exportReportToPDF
  });

  it('renders error state when error is present', () => {
    useAnalysisStore.setState({ error: 'Test Error' });
    render(<App />);
    expect(screen.getByText('Test Error')).toBeInTheDocument();
  });

  it('renders analysis results when present', () => {
    const mockResult = {
      uxScore: 85,
      uiType: 'Dashboard',
      metrics: { accessibility: 80, mobile: 70, hierarchy: 90, consistency: 85 },
      issues: [],
      improvements: []
    };
    useAnalysisStore.setState({ 
      result: mockResult,
      metrics: { latency: 1000, tokensUsed: 500, estimatedCost: 0.01, confidence: 0.95 },
      screenshot: 'data:image/png;base64,fake'
    });
    
    render(<App />);
    expect(screen.getByText('Overall UX Score')).toBeInTheDocument();
    expect(screen.getByText('Download PDF Report')).toBeInTheDocument();
  });
});
