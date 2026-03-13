import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../../App';
import { useAnalysisStore } from '../../store/analysisStore';
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock html2canvas and jspdf
vi.mock('html2canvas', () => ({
  default: vi.fn().mockResolvedValue({
    toDataURL: () => 'data:image/png;base64,canvas'
  })
}));

vi.mock('jspdf', () => {
  const mockjsPDF = vi.fn().mockImplementation(function() {
    return {
      addImage: vi.fn(),
      save: vi.fn(),
      setFontSize: vi.fn(),
      setTextColor: vi.fn(),
      text: vi.fn(),
      addPage: vi.fn(),
      internal: { pageSize: { getWidth: () => 210, getHeight: () => 297 } }
    };
  });
  return {
    jsPDF: mockjsPDF,
    default: mockjsPDF
  };
});

const { mockGenerateContent } = vi.hoisted(() => ({
  mockGenerateContent: vi.fn().mockResolvedValue({
    text: JSON.stringify({
      uxScore: 85,
      uiType: "Dashboard",
      metrics: {
        accessibility: 80,
        mobile: 90,
        hierarchy: 85,
        consistency: 85
      },
      issues: [
        {
          title: "Contrast Issue",
          severity: "High",
          description: "Low contrast on buttons",
          type: "contrast",
          coordinates: { x: 10, y: 10, width: 20, height: 5 }
        }
      ],
      improvements: ["Improve contrast", "Fix spacing"]
    }),
    candidates: [{ content: { parts: [{ text: '...' }] } }]
  })
}));

// Mock @google/genai
vi.mock('@google/genai', () => {
  return {
    GoogleGenAI: vi.fn().mockImplementation(function() {
      return {
        models: {
          generateContent: mockGenerateContent
        }
      };
    }),
    Type: {
      OBJECT: 'OBJECT',
      ARRAY: 'ARRAY',
      STRING: 'STRING',
      NUMBER: 'NUMBER'
    }
  };
});

describe('App Integration Flow', () => {
  beforeEach(() => {
    useAnalysisStore.getState().reset();
    localStorage.clear();
    
    // Mock FileReader
    const mockFileReader = {
      readAsDataURL: vi.fn(),
      onload: null as any,
    };
    vi.stubGlobal('FileReader', vi.fn(function() { return mockFileReader; }));
  });

  it('completes a full UX analysis flow', async () => {
    render(<App />);

    // 1. Initial state
    expect(screen.getByRole('heading', { name: /UXMind/i })).toBeInTheDocument();
    expect(screen.getByText(/Upload UI Screenshot/i)).toBeInTheDocument();

    // 2. Upload screenshot
    const file = new File(['fake'], 'test.png', { type: 'image/png' });
    const input = screen.getByTestId('file-input');
    
    fireEvent.change(input, { target: { files: [file] } });
    
    await waitFor(() => {
      const fr = new FileReader() as any;
      fr.onload({ target: { result: 'data:image/png;base64,screenshot' } });
    });

    // 3. Run Analysis
    const analyzeBtn = screen.getByRole('button', { name: /Analyze UX/i });
    fireEvent.click(analyzeBtn);

    // 4. Check loading state
    expect(screen.getByText(/Analyzing\.\.\./i)).toBeInTheDocument();

    // 5. Wait for results (MSW will handle the API call)
    await waitFor(() => {
      expect(screen.queryByText(/Analyzing\.\.\./i)).not.toBeInTheDocument();
    }, { timeout: 5000 });

    // 6. Verify results are rendered
    expect(screen.getAllByText('85')[0]).toBeInTheDocument(); // Score
    expect(screen.getAllByText('Dashboard')[0]).toBeInTheDocument(); // UI Type
    expect(screen.getAllByText('Contrast Issue')[0]).toBeInTheDocument(); // Issue
    expect(screen.getByText('Improve contrast')).toBeInTheDocument(); // Suggestion

    // 7. Download PDF
    const downloadBtn = screen.getByRole('button', { name: /Download PDF Report/i });
    fireEvent.click(downloadBtn);
    
    // Check if jspdf was called (indirectly via mock)
    const { jsPDF } = await import('jspdf');
    expect(jsPDF).toHaveBeenCalled();
  });

  it('handles analysis failure gracefully', async () => {
    // Mock failure
    mockGenerateContent.mockRejectedValueOnce(new Error('AI Analysis Failed'));

    render(<App />);

    // Upload
    const file = new File(['fake'], 'test.png', { type: 'image/png' });
    const input = screen.getByTestId('file-input');
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      const fr = new FileReader() as any;
      fr.onload({ target: { result: 'data:image/png;base64,screenshot' } });
    });

    // Analyze
    const analyzeBtn = screen.getByRole('button', { name: /Analyze UX/i });
    fireEvent.click(analyzeBtn);

    // Wait for error
    await waitFor(() => {
      expect(screen.getAllByText(/AI Analysis Failed/i)[0]).toBeInTheDocument();
    }, { timeout: 5000 });

    expect(screen.getByRole('button', { name: /Retry Analysis/i })).toBeInTheDocument();
  }, 15000);
});
