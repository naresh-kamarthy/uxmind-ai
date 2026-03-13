import { renderHook, act } from '@testing-library/react';
import { useAIAnalysis } from '../../hooks/useAIAnalysis';
import { useAnalysisStore } from '../../store/analysisStore';
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock the geminiService
vi.mock('../../services/geminiService', () => ({
  analyzeScreenshot: vi.fn().mockResolvedValue({
    result: {
      uxScore: 85,
      uiType: "Dashboard",
      metrics: { accessibility: 80, mobile: 90, hierarchy: 85, consistency: 85 },
      issues: [],
      improvements: []
    },
    tokens: 1500
  }),
  regenerateSection: vi.fn().mockResolvedValue("Improved content")
}));

describe('useAIAnalysis hook', () => {
  beforeEach(() => {
    useAnalysisStore.getState().reset();
  });

  it('should not run analysis if no screenshot is present', async () => {
    const { result } = renderHook(() => useAIAnalysis());
    
    await act(async () => {
      await result.current.runAnalysis();
    });

    expect(useAnalysisStore.getState().isAnalyzing).toBe(false);
  });

  it('should run analysis successfully when screenshot is present', async () => {
    const { result: hookResult } = renderHook(() => useAIAnalysis());
    
    act(() => {
      useAnalysisStore.getState().setScreenshot('data:image/png;base64,fake');
    });

    await act(async () => {
      await hookResult.current.runAnalysis();
    });

    const state = useAnalysisStore.getState();
    expect(state.isAnalyzing).toBe(false);
    expect(state.result).not.toBeNull();
    expect(state.result?.uxScore).toBe(85);
    expect(state.metrics).not.toBeNull();
    expect(state.progress).toBe(100);
  });

  it('should handle analysis failure', async () => {
    const { analyzeScreenshot } = await import('../../services/geminiService');
    vi.mocked(analyzeScreenshot).mockRejectedValueOnce(new Error('API Error'));

    const { result: hookResult } = renderHook(() => useAIAnalysis());
    
    act(() => {
      useAnalysisStore.getState().setScreenshot('data:image/png;base64,fake');
    });

    await act(async () => {
      await hookResult.current.runAnalysis();
    });

    const state = useAnalysisStore.getState();
    expect(state.isAnalyzing).toBe(false);
    expect(state.error).toContain('AI Analysis Failed');
  });

  it('should regenerate section successfully', async () => {
    const { result: hookResult } = renderHook(() => useAIAnalysis());
    
    act(() => {
      useAnalysisStore.getState().setScreenshot('data:image/png;base64,fake');
    });

    let regenerated;
    await act(async () => {
      regenerated = await hookResult.current.regenerateSection('improvements', 'old content');
    });

    expect(regenerated).toBe('Improved content');
  });

  it('should return null for regeneration if no screenshot', async () => {
    const { result: hookResult } = renderHook(() => useAIAnalysis());
    
    let regenerated;
    await act(async () => {
      regenerated = await hookResult.current.regenerateSection('improvements', 'old content');
    });

    expect(regenerated).toBeNull();
  });

  it('should handle regeneration failure', async () => {
    const { regenerateSection } = await import('../../services/geminiService');
    vi.mocked(regenerateSection).mockRejectedValueOnce(new Error('Regen Error'));

    const { result: hookResult } = renderHook(() => useAIAnalysis());
    
    act(() => {
      useAnalysisStore.getState().setScreenshot('data:image/png;base64,fake');
    });

    let regenerated;
    await act(async () => {
      try {
        regenerated = await hookResult.current.regenerateSection('improvements', 'old content');
      } catch (e) {
        regenerated = null;
      }
    });

    expect(regenerated).toBeNull();
  });
});
