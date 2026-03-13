import { render, screen } from '@testing-library/react';
import { ScoreGauge } from '../../components/ScoreGauge';
import { describe, it, expect } from 'vitest';

describe('ScoreGauge component', () => {
  it('renders correctly with a score', () => {
    render(<ScoreGauge score={85} label="UX Score" />);
    expect(screen.getByText('85')).toBeInTheDocument();
    expect(screen.getByText('UX Score')).toBeInTheDocument();
  });

  it('applies correct color class for high score', () => {
    const { container } = render(<ScoreGauge score={90} label="Test" />);
    const text = screen.getByText('90');
    expect(text).toHaveClass('text-emerald-400');
  });

  it('applies correct color class for medium score', () => {
    render(<ScoreGauge score={65} label="Test" />);
    const text = screen.getByText('65');
    expect(text).toHaveClass('text-yellow-400');
  });

  it('applies correct color class for low score', () => {
    render(<ScoreGauge score={30} label="Test" />);
    const text = screen.getByText('30');
    expect(text).toHaveClass('text-red-400');
  });

  it('handles custom max value', () => {
    render(<ScoreGauge score={40} max={50} label="Test" />);
    const text = screen.getByText('40');
    // 40/50 = 80%, so it should be emerald
    expect(text).toHaveClass('text-emerald-400');
  });
});
