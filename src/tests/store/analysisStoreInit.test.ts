import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('analysisStore initialization', () => {
  beforeEach(() => {
    vi.resetModules();
    localStorage.clear();
  });

  it('should load empty history when localStorage is empty', async () => {
    const { useAnalysisStore } = await import('../../store/analysisStore');
    expect(useAnalysisStore.getState().history).toEqual([]);
  });

  it('should load history from localStorage on initialization', async () => {
    const mockHistory = [{ id: '1', uiType: 'Test' }];
    localStorage.setItem('uxmind_history', JSON.stringify(mockHistory));
    
    const { useAnalysisStore } = await import('../../store/analysisStore');
    expect(useAnalysisStore.getState().history).toEqual(mockHistory);
  });

  it('should return empty history on JSON parse error', async () => {
    localStorage.setItem('uxmind_history', 'invalid-json');
    const { useAnalysisStore } = await import('../../store/analysisStore');
    expect(useAnalysisStore.getState().history).toEqual([]);
  });
});
