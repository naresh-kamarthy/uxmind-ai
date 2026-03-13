import { render, screen, fireEvent } from '@testing-library/react';
import { ScreenshotAnnotations } from '../../components/ScreenshotAnnotations';
import { useAnalysisStore } from '../../store/analysisStore';
import { describe, it, expect, beforeEach } from 'vitest';

describe('ScreenshotAnnotations component', () => {
  beforeEach(() => {
    useAnalysisStore.getState().reset();
  });

  it('renders nothing when no screenshot', () => {
    const { container } = render(<ScreenshotAnnotations screenshot="" />);
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing for issues without coordinates', () => {
    const issues = [
      { title: 'No Coord Issue', severity: 'High', coordinates: null }
    ];
    render(<ScreenshotAnnotations screenshot="fake" issues={issues as any} />);
    expect(screen.queryByText('No Coord Issue')).not.toBeInTheDocument();
  });

  it('renders annotations with different severities', () => {
    const issues = [
      { title: 'High Issue', severity: 'High', coordinates: { x: 10, y: 10, width: 20, height: 20 } },
      { title: 'Medium Issue', severity: 'Medium', coordinates: { x: 40, y: 40, width: 20, height: 20 } },
      { title: 'Low Issue', severity: 'Low', coordinates: { x: 70, y: 70, width: 20, height: 20 } },
      { title: 'Other Issue', severity: 'Other', coordinates: { x: 5, y: 5, width: 5, height: 5 } }
    ];
    render(<ScreenshotAnnotations screenshot="fake" issues={issues as any} />);
    expect(screen.getByText('High Issue')).toBeInTheDocument();
    expect(screen.getByText('Medium Issue')).toBeInTheDocument();
    expect(screen.getByText('Low Issue')).toBeInTheDocument();
    expect(screen.getByText('Other Issue')).toBeInTheDocument();
  });

  it('updates annotations on window resize', () => {
    const issues = [
      { title: "Issue 1", severity: "High", description: "D", type: "contrast", coordinates: { x: 10, y: 10, width: 20, height: 20 } }
    ];
    render(<ScreenshotAnnotations screenshot="data:image/png;base64,fake" issues={issues} />);
    
    // Mock container size
    const container = screen.getByTestId('annotations-container');
    Object.defineProperty(container, 'offsetWidth', { value: 1000, writable: true });
    Object.defineProperty(container, 'offsetHeight', { value: 500, writable: true });

    fireEvent(window, new Event('resize'));
    
    // Check if annotations are rendered
    expect(screen.getByText('Issue 1')).toBeInTheDocument();
  });
});
