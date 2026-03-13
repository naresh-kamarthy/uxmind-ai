import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SectionRegenerator } from '../../components/SectionRegenerator';
import { describe, it, expect, vi } from 'vitest';

// Mock the hook
const mockRegenerateSection = vi.fn();
vi.mock('../../hooks/useAIAnalysis', () => ({
  useAIAnalysis: () => ({
    regenerateSection: mockRegenerateSection
  })
}));

describe('SectionRegenerator component', () => {
  it('does not update content if newContent is empty', async () => {
    mockRegenerateSection.mockResolvedValueOnce('');
    render(<SectionRegenerator section="test" content="Old Content" />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(mockRegenerateSection).toHaveBeenCalled();
    });
    
    expect(screen.getByText('Old Content')).toBeInTheDocument();
  });

  it('calls onUpdate with new content when button is clicked', async () => {
    const onUpdate = vi.fn();
    mockRegenerateSection.mockResolvedValue("New Content");
    
    render(<SectionRegenerator section="test" content="Old" onUpdate={onUpdate} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(mockRegenerateSection).toHaveBeenCalledWith("test", "Old");
    });
    
    expect(onUpdate).toHaveBeenCalledWith("New Content");
  });

  it('shows loading state while regenerating', async () => {
    mockRegenerateSection.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve("New"), 100)));
    
    const { container } = render(<SectionRegenerator section="test" content="Old" />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    const icon = container.querySelector('.animate-spin');
    expect(icon).toBeInTheDocument();
  });

  it('works without onUpdate prop', async () => {
    mockRegenerateSection.mockResolvedValue("New Content");
    render(<SectionRegenerator section="test" content="Old" />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getByText("New Content")).toBeInTheDocument();
    });
  });
});
