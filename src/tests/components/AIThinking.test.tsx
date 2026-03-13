import { render, screen, act } from '@testing-library/react';
import { AIThinking } from '../../components/AIThinking';
import { describe, it, expect, vi } from 'vitest';

describe('AIThinking component', () => {
  it('renders status messages', () => {
    render(<AIThinking />);
    expect(screen.getByText('Analyzing UX...')).toBeInTheDocument();
    
    const statusMessages = [
      'Evaluating layout hierarchy',
      'Checking accessibility',
      'Detecting spacing issues',
      'Reviewing CTA visibility'
    ];
    
    statusMessages.forEach(msg => {
      expect(screen.getByText(msg)).toBeInTheDocument();
    });
  });

  it('cycles through steps over time', () => {
    vi.useFakeTimers();
    render(<AIThinking />);
    
    expect(screen.getByText('Analyzing UX...')).toBeInTheDocument();

    // Advance to cover all steps
    act(() => {
      vi.advanceTimersByTime(1500 * 5);
    });
    
    vi.useRealTimers();
  });
});
