import { render, screen, fireEvent } from '@testing-library/react';
import { RecentAnalysesPanel } from '../../components/RecentAnalysesPanel';
import { useAnalysisStore } from '../../store/analysisStore';
import { describe, it, expect, beforeEach, vi } from 'vitest';

const mockHistoryItem = {
  id: '1',
  screenshot: 'data:image/png;base64,fake',
  uiType: 'Dashboard',
  uxScore: 85,
  timestamp: Date.now(),
  result: { uxScore: 85, uiType: 'Dashboard', metrics: { accessibility: 0, mobile: 0, hierarchy: 0, consistency: 0 }, issues: [], improvements: [] },
  metrics: { latency: 100, tokensUsed: 100, estimatedCost: 0.01, confidence: 90 }
};

describe('RecentAnalysesPanel component', () => {
  beforeEach(() => {
    useAnalysisStore.getState().reset();
    localStorage.clear();
  });

  it('renders empty state when no history', () => {
    render(<RecentAnalysesPanel />);
    expect(screen.getByText(/No recent analyses/i)).toBeInTheDocument();
  });

  it('renders history items', () => {
    useAnalysisStore.setState({ history: [mockHistoryItem] });
    render(<RecentAnalysesPanel />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('85')).toBeInTheDocument();
  });

  it('loads item from history on click', () => {
    useAnalysisStore.setState({ history: [mockHistoryItem] });
    render(<RecentAnalysesPanel />);
    
    const item = screen.getByText('Dashboard').closest('button');
    fireEvent.click(item!);
    
    expect(useAnalysisStore.getState().screenshot).toBe(mockHistoryItem.screenshot);
    expect(useAnalysisStore.getState().result).toEqual(mockHistoryItem.result);
  });

  it('clears history on button click', () => {
    useAnalysisStore.setState({ history: [mockHistoryItem] });
    render(<RecentAnalysesPanel />);
    
    const clearBtn = screen.getByRole('button', { name: /Clear/i });
    fireEvent.click(clearBtn);
    
    expect(useAnalysisStore.getState().history).toHaveLength(0);
  });
});
