import { render, screen } from '@testing-library/react';
import { ProcessingOverlay } from '../../components/ProcessingOverlay';
import { useAnalysisStore } from '../../store/analysisStore';
import { describe, it, expect, beforeEach } from 'vitest';

describe('ProcessingOverlay component', () => {
  beforeEach(() => {
    useAnalysisStore.getState().reset();
  });

  it('renders progress and step text', () => {
    render(<ProcessingOverlay progress={40} />);
    expect(screen.getByText('Detecting layout patterns')).toBeInTheDocument();
    expect(screen.getByText('40%')).toBeInTheDocument();
  });

  it('renders different steps based on progress', () => {
    const { rerender } = render(<ProcessingOverlay progress={10} />);
    expect(screen.getByText('Processing screenshot')).toBeInTheDocument();

    rerender(<ProcessingOverlay progress={40} />);
    expect(screen.getByText('Detecting layout patterns')).toBeInTheDocument();

    rerender(<ProcessingOverlay progress={60} />);
    expect(screen.getByText('Evaluating accessibility')).toBeInTheDocument();

    rerender(<ProcessingOverlay progress={85} />);
    expect(screen.getByText('Generating UX improvements')).toBeInTheDocument();
  });
});
