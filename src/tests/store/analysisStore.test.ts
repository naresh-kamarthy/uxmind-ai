import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAnalysisStore } from '../../store/analysisStore';

describe('analysisStore', () => {
  beforeEach(() => {
    localStorage.clear();
    useAnalysisStore.getState().reset();
    useAnalysisStore.getState().clearHistory();
    vi.restoreAllMocks();
  });

  it('should initialize with empty history if localStorage is empty', () => {
    expect(useAnalysisStore.getState().history).toEqual([]);
  });

  it('should load history from localStorage', () => {
    const mockHistory = [{ id: '1', screenshot: 's1', uiType: 'Dashboard', uxScore: 80, timestamp: Date.now(), result: {} as any, metrics: {} as any }];
    localStorage.setItem('uxmind_history', JSON.stringify(mockHistory));
  });

  it('should handle localStorage errors during load', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementationOnce(() => {
      throw new Error('Storage error');
    });
  });

  it('should save history and respect MAX_HISTORY_ITEMS', () => {
    const store = useAnalysisStore.getState();
    store.setScreenshot('data:image/png;base64,1');
    store.finishAnalysis({ uiType: 'T1', uxScore: 10, issues: [], improvements: [], metrics: {} as any }, {} as any);
    
    expect(useAnalysisStore.getState().history.length).toBe(1);

    store.setScreenshot('data:image/png;base64,2');
    store.finishAnalysis({ uiType: 'T2', uxScore: 20, issues: [], improvements: [], metrics: {} as any }, {} as any);
    
    store.setScreenshot('data:image/png;base64,3');
    store.finishAnalysis({ uiType: 'T3', uxScore: 30, issues: [], improvements: [], metrics: {} as any }, {} as any);
    
    store.setScreenshot('data:image/png;base64,4');
    store.finishAnalysis({ uiType: 'T4', uxScore: 40, issues: [], improvements: [], metrics: {} as any }, {} as any);

    expect(useAnalysisStore.getState().history.length).toBe(3);
    expect(useAnalysisStore.getState().history[0].uiType).toBe('T4');
  });

  it('should handle QuotaExceededError and remove oldest items', () => {
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
    let callCount = 0;
    setItemSpy.mockImplementation((key, value) => {
      callCount++;
      if (callCount === 1) {
        throw new DOMException('Quota exceeded', 'QuotaExceededError');
      }
    });

    const store = useAnalysisStore.getState();
    store.setScreenshot('data:image/png;base64,1');
    useAnalysisStore.setState({ history: [{ id: 'old', uiType: 'Old' } as any] });
    
    store.finishAnalysis({ uiType: 'New', uxScore: 90, issues: [], improvements: [], metrics: {} as any }, {} as any);

    expect(setItemSpy).toHaveBeenCalledTimes(2);
    expect(useAnalysisStore.getState().history.length).toBe(1);
    expect(useAnalysisStore.getState().history[0].uiType).toBe('New');
  });

  it('should clear history and remove from localStorage', () => {
    localStorage.setItem('uxmind_history', '[]');
    useAnalysisStore.getState().clearHistory();
    expect(localStorage.getItem('uxmind_history')).toBeNull();
    expect(useAnalysisStore.getState().history).toEqual([]);
  });

  it('should handle JSON parse error in loadHistory', () => {
    localStorage.setItem('uxmind_history', 'invalid-json');
  });

  it('should remove history key if saveHistory results in empty array', () => {
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
    setItemSpy.mockImplementation(() => {
      throw new DOMException('Quota exceeded', 'QuotaExceededError');
    });
    const removeItemSpy = vi.spyOn(Storage.prototype, 'removeItem');

    const store = useAnalysisStore.getState();
    useAnalysisStore.setState({ history: [{ id: '1' } as any] });
    store.setScreenshot('data:image/png;base64,new');
    
    store.finishAnalysis({ uiType: 'T', uxScore: 50, issues: [], improvements: [], metrics: {} as any }, {} as any);

    expect(removeItemSpy).toHaveBeenCalledWith('uxmind_history');
  });

  it('should handle generic errors in saveHistory', () => {
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Generic error');
    });
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const store = useAnalysisStore.getState();
    store.setScreenshot('data:image/png;base64,1');
    store.finishAnalysis({ uiType: 'T', uxScore: 50, issues: [], improvements: [], metrics: {} as any }, {} as any);

    expect(consoleSpy).toHaveBeenCalledWith('Failed to save history:', expect.any(Error));
    consoleSpy.mockRestore();
  });

  it('should skip history update if screenshot is missing', () => {
    const { finishAnalysis } = useAnalysisStore.getState();
    const mockResult = { uxScore: 85, uiType: 'Dashboard', issues: [], improvements: [], metrics: {} as any } as any;
    const mockMetrics = { confidence: 0.95 } as any;
    
    useAnalysisStore.setState({ screenshot: null, history: [] });
    finishAnalysis(mockResult, mockMetrics);
    
    expect(useAnalysisStore.getState().history).toEqual([]);
  });

  it('should handle QuotaExceededError with code 22', () => {
    const { finishAnalysis } = useAnalysisStore.getState();
    const mockResult = { uxScore: 85, uiType: 'Dashboard', issues: [], improvements: [], metrics: {} as any } as any;
    const mockMetrics = { confidence: 0.95 } as any;
    
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
    setItemSpy.mockImplementationOnce(() => {
      const err = new DOMException('Quota exceeded', 'QuotaExceededError');
      // @ts-ignore
      Object.defineProperty(err, 'code', { value: 22 });
      throw err;
    });
    
    useAnalysisStore.setState({ screenshot: 'fake-screenshot' });
    finishAnalysis(mockResult, mockMetrics);
    
    expect(setItemSpy).toHaveBeenCalled();
    setItemSpy.mockRestore();
  });

  it('should handle NS_ERROR_DOM_QUOTA_REACHED', () => {
    const { finishAnalysis } = useAnalysisStore.getState();
    const mockResult = { uxScore: 85, uiType: 'Dashboard', issues: [], improvements: [], metrics: {} as any } as any;
    const mockMetrics = { confidence: 0.95 } as any;
    
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
    setItemSpy.mockImplementationOnce(() => {
      throw new DOMException('Quota exceeded', 'NS_ERROR_DOM_QUOTA_REACHED');
    });
    
    useAnalysisStore.setState({ screenshot: 'fake-screenshot' });
    finishAnalysis(mockResult, mockMetrics);
    
    expect(setItemSpy).toHaveBeenCalled();
    setItemSpy.mockRestore();
  });

  it('should handle DOMException with different name', () => {
    const { finishAnalysis } = useAnalysisStore.getState();
    const mockResult = { uxScore: 85, uiType: 'Dashboard', issues: [], improvements: [], metrics: {} as any } as any;
    const mockMetrics = { confidence: 0.95 } as any;
    
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
    setItemSpy.mockImplementationOnce(() => {
      throw new DOMException('Other error', 'NotAllowedError');
    });
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    useAnalysisStore.setState({ screenshot: 'fake-screenshot' });
    finishAnalysis(mockResult, mockMetrics);
    
    expect(consoleSpy).toHaveBeenCalled();
    setItemSpy.mockRestore();
    consoleSpy.mockRestore();
  });
});
