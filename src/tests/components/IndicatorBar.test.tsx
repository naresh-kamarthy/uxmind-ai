import { render, screen } from '@testing-library/react';
import { IndicatorBar } from '../../App';
import { describe, it, expect } from 'vitest';

describe('IndicatorBar component', () => {
  it('renders with correct color for high score', () => {
    const { container } = render(<IndicatorBar label="Test" score={85} />);
    expect(screen.getByText('85%')).toBeInTheDocument();
    expect(container.querySelector('.bg-emerald-400')).toBeInTheDocument();
  });

  it('renders with correct color for medium score', () => {
    const { container } = render(<IndicatorBar label="Test" score={65} />);
    expect(screen.getByText('65%')).toBeInTheDocument();
    expect(container.querySelector('.bg-yellow-400')).toBeInTheDocument();
  });

  it('renders with correct color for low score', () => {
    const { container } = render(<IndicatorBar label="Test" score={35} />);
    expect(screen.getByText('35%')).toBeInTheDocument();
    expect(container.querySelector('.bg-red-400')).toBeInTheDocument();
  });
});
