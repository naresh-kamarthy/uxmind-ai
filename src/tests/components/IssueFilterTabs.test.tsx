import { render, screen, fireEvent } from '@testing-library/react';
import { IssueFilterTabs } from '../../components/IssueFilterTabs';
import { useAnalysisStore } from '../../store/analysisStore';
import { describe, it, expect, beforeEach } from 'vitest';

describe('IssueFilterTabs component', () => {
  beforeEach(() => {
    useAnalysisStore.getState().reset();
  });

  it('renders all filter tabs', () => {
    render(<IssueFilterTabs />);
    expect(screen.getByText('All')).toBeInTheDocument();
    expect(screen.getByText('High')).toBeInTheDocument();
    expect(screen.getByText('Medium')).toBeInTheDocument();
    expect(screen.getByText('Low')).toBeInTheDocument();
  });

  it('changes filter on click', () => {
    render(<IssueFilterTabs />);
    const highTab = screen.getByText('High').closest('button');
    fireEvent.click(highTab!);
    expect(useAnalysisStore.getState().issueFilter).toBe('High');
  });

  it('applies active styles to selected filter', () => {
    useAnalysisStore.setState({ issueFilter: 'Medium' });
    render(<IssueFilterTabs />);
    const mediumTab = screen.getByText('Medium').closest('button');
    expect(mediumTab).toHaveClass('bg-zinc-800');
  });
});
