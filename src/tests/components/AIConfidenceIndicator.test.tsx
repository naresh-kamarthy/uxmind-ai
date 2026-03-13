import { render, screen } from '@testing-library/react';
import { AIConfidenceIndicator } from '../../components/AIConfidenceIndicator';
import { describe, it, expect } from 'vitest';

describe('AIConfidenceIndicator component', () => {
  it('renders confidence value correctly', () => {
    render(<AIConfidenceIndicator confidence={88.5} />);
    expect(screen.getByText('89')).toBeInTheDocument();
    expect(screen.getByText('%')).toBeInTheDocument();
  });

  it('renders high confidence label', () => {
    render(<AIConfidenceIndicator confidence={95} />);
    expect(screen.getByText('High Reliability')).toBeInTheDocument();
  });

  it('renders medium confidence label', () => {
    render(<AIConfidenceIndicator confidence={75} />);
    expect(screen.getByText('Moderate Reliability')).toBeInTheDocument();
  });

  it('renders low confidence label', () => {
    render(<AIConfidenceIndicator confidence={50} />);
    expect(screen.getByText('Low Reliability')).toBeInTheDocument();
  });
});
