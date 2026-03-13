import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { IssuesPanel } from '../../components/IssuesPanel';
import { useAnalysisStore } from '../../store/analysisStore';
import { describe, it, expect, beforeEach } from 'vitest';
import { AnalysisResult } from '../../types';

const mockResult: AnalysisResult = {
  uxScore: 80,
  uiType: "Web App",
  metrics: { accessibility: 80, mobile: 80, hierarchy: 80, consistency: 80 },
  issues: [
    { title: "High Issue", severity: "High", description: "D1", type: "contrast", coordinates: { x: 0, y: 0, width: 0, height: 0 } },
    { title: "Medium Issue", severity: "Medium", description: "D2", type: "spacing", coordinates: { x: 0, y: 0, width: 0, height: 0 } },
    { title: "Low Issue", severity: "Low", description: "D3", type: "hierarchy", coordinates: { x: 0, y: 0, width: 0, height: 0 } },
  ],
  improvements: []
};

describe('IssuesPanel component', () => {
  beforeEach(() => {
    useAnalysisStore.getState().reset();
  });

  it('renders empty state when no result', () => {
    render(<IssuesPanel issues={[]} />);
    expect(screen.getByText(/No issues detected yet/i)).toBeInTheDocument();
  });

  it('renders all issues by default', () => {
    render(<IssuesPanel issues={mockResult.issues} />);
    expect(screen.getByText('High Issue')).toBeInTheDocument();
    expect(screen.getByText('Medium Issue')).toBeInTheDocument();
    expect(screen.getByText('Low Issue')).toBeInTheDocument();
  });

  it('filters issues by severity', async () => {
    render(<IssuesPanel issues={mockResult.issues} />);
    
    const highTab = screen.getByRole('button', { name: /High/i });
    fireEvent.click(highTab);
    
    await waitFor(() => {
      expect(screen.getByText('High Issue')).toBeInTheDocument();
      expect(screen.queryByText('Medium Issue')).not.toBeInTheDocument();
      expect(screen.queryByText('Low Issue')).not.toBeInTheDocument();
    });
  });

  it('shows empty state when no issues match filter', () => {
    const resultNoHigh: AnalysisResult = { ...mockResult, issues: [mockResult.issues[1]] };
    render(<IssuesPanel issues={resultNoHigh.issues} />);
    
    const highTab = screen.getByRole('button', { name: /High/i });
    fireEvent.click(highTab);
    
    expect(screen.getByText(/No High severity issues found/i)).toBeInTheDocument();
  });
});
