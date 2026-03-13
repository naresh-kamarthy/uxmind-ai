import { render, screen } from '@testing-library/react';
import { MetricsFooter } from '../../components/MetricsFooter';
import { useAnalysisStore } from '../../store/analysisStore';
import { describe, it, expect, beforeEach } from 'vitest';

describe('MetricsFooter component', () => {
  beforeEach(() => {
    useAnalysisStore.getState().reset();
  });

  it('renders nothing when no metrics', () => {
    const { container } = render(<MetricsFooter />);
    expect(container.firstChild).toBeNull();
  });

  it('renders metrics when present', () => {
    const metrics = { latency: 1200, tokensUsed: 1500, estimatedCost: 0.0002, confidence: 92 };
    render(<MetricsFooter metrics={metrics} />);
    expect(screen.getByText('1200ms')).toBeInTheDocument();
    expect(screen.getByText('1500')).toBeInTheDocument();
    expect(screen.getByText('$0.0002')).toBeInTheDocument();
  });
});
