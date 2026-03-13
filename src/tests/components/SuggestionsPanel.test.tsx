import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SuggestionsPanel } from '../../components/SuggestionsPanel';
import { useAnalysisStore } from '../../store/analysisStore';
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock the hook
const mockRegenerateSection = vi.fn();
vi.mock('../../hooks/useAIAnalysis', () => ({
  useAIAnalysis: () => ({
    regenerateSection: mockRegenerateSection
  })
}));

describe('SuggestionsPanel component', () => {
  beforeEach(() => {
    useAnalysisStore.getState().reset();
    mockRegenerateSection.mockReset();
  });

  it('renders empty state when no result', () => {
    render(<SuggestionsPanel suggestions={[]} />);
    expect(screen.getByText(/No suggestions yet/i)).toBeInTheDocument();
  });

  it('renders suggestions when result is present', () => {
    render(<SuggestionsPanel suggestions={["Improve A", "Improve B"]} />);
    expect(screen.getByText("Improve A")).toBeInTheDocument();
    expect(screen.getByText("Improve B")).toBeInTheDocument();
  });

  it('handles regeneration of a suggestion', async () => {
    mockRegenerateSection.mockResolvedValue("Better A");
    
    render(<SuggestionsPanel suggestions={["Improve A"]} />);
    const regenBtn = screen.getByRole('button', { name: /Regenerate/i });
    fireEvent.click(regenBtn);
    
    await waitFor(() => {
      expect(mockRegenerateSection).toHaveBeenCalled();
    });
    
    expect(screen.getByText("Better A")).toBeInTheDocument();
  });
});
