import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorStateCard } from '../../components/ErrorStateCard';
import { describe, it, expect, vi } from 'vitest';

describe('ErrorStateCard component', () => {
  it('renders title and description', () => {
    render(<ErrorStateCard onRetry={() => {}} />);
    expect(screen.getByText('AI Analysis Failed')).toBeInTheDocument();
    expect(screen.getByText(/We couldn't complete the UX review/i)).toBeInTheDocument();
  });

  it('calls onRetry when button is clicked', () => {
    const onRetry = vi.fn();
    render(<ErrorStateCard onRetry={onRetry} />);
    const button = screen.getByRole('button', { name: /Retry Analysis/i });
    fireEvent.click(button);
    expect(onRetry).toHaveBeenCalled();
  });
});
