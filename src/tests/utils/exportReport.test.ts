import { describe, it, expect, vi, beforeEach } from 'vitest';
import { exportReportToPDF } from '../../utils/exportReport';

const { mockjsPDF } = vi.hoisted(() => ({
  mockjsPDF: vi.fn().mockImplementation(function() {
    return {
      addImage: vi.fn(),
      save: vi.fn(),
      setFontSize: vi.fn(),
      setTextColor: vi.fn(),
      text: vi.fn(),
      addPage: vi.fn(),
      splitTextToSize: vi.fn().mockReturnValue(['line1', 'line2']),
      internal: { pageSize: { getWidth: () => 210, getHeight: () => 297 } }
    };
  })
}));

vi.mock('jspdf', () => ({
  default: mockjsPDF,
  jsPDF: mockjsPDF
}));

describe('exportReportToPDF', () => {
  const mockResult = {
    uxScore: 85,
    uiType: 'Dashboard',
    metrics: {
      accessibility: 80,
      mobile: 70,
      hierarchy: 90,
      consistency: 85
    },
    issues: [
      { title: 'Issue 1', severity: 'High', description: 'Desc 1', type: 'contrast', coordinates: { x: 0, y: 0, width: 10, height: 10 } }
    ],
    improvements: ['Improve 1']
  };

  const mockMetrics = {
    confidence: 95,
    estimatedCost: 0.05
  };

  const mockScreenshot = 'data:image/png;base64,fake';

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock Image
    global.Image = class {
      onload: any = null;
      width = 1000;
      height = 1000;
      set src(val: string) {
        setTimeout(() => this.onload && this.onload(), 0);
      }
    } as any;
  });

  it('should generate a PDF report', async () => {
    await exportReportToPDF(mockResult as any, mockMetrics as any, mockScreenshot);
    expect(mockjsPDF).toHaveBeenCalled();
    const instance = mockjsPDF.mock.results[0].value;
    expect(instance.save).toHaveBeenCalled();
  });

  it('should handle many issues and add pages', async () => {
    const manyIssues = Array(20).fill(mockResult.issues[0]);
    const resultWithManyIssues = { ...mockResult, issues: manyIssues };
    
    await exportReportToPDF(resultWithManyIssues as any, mockMetrics as any, mockScreenshot);
    const instance = mockjsPDF.mock.results[0].value;
    expect(instance.addPage).toHaveBeenCalled();
  });

  it('should handle many improvements and add pages', async () => {
    const manyImprovements = Array(30).fill('Improvement text');
    const resultWithManyImprovements = { ...mockResult, improvements: manyImprovements };
    
    await exportReportToPDF(resultWithManyImprovements as any, mockMetrics as any, mockScreenshot);
    const instance = mockjsPDF.mock.results[0].value;
    expect(instance.addPage).toHaveBeenCalled();
  });

  it('should handle image loading failure gracefully', async () => {
    // Mock Image to fail
    vi.stubGlobal('Image', class {
      onload: any = null;
      onerror: any = null;
      set src(val: string) {
        setTimeout(() => {
          if (this.onerror) {
            this.onerror(new Error('Image load failed'));
          }
        }, 10);
      }
    });

    await exportReportToPDF(mockResult as any, mockMetrics as any, mockScreenshot);
    const instance = mockjsPDF.mock.results[0].value;
    expect(instance.text).toHaveBeenCalledWith('[Screenshot could not be loaded]', expect.any(Number), expect.any(Number));
    
    vi.stubGlobal('Image', undefined);
  });

  it('should add page if screenshot is tall', async () => {
    // Mock Image to be very tall
    global.Image = class {
      onload: any = null;
      width = 100;
      height = 2000; // Very tall
      set src(val: string) {
        setTimeout(() => this.onload && this.onload(), 0);
      }
    } as any;

    await exportReportToPDF(mockResult as any, mockMetrics as any, mockScreenshot);
    const instance = mockjsPDF.mock.results[0].value;
    expect(instance.addPage).toHaveBeenCalled();
  });

  it('should add page before issues section if cursor is high', async () => {
    // We need to make cursorY > 250 before line 102 in exportReport.ts
    // Initial cursorY is ~130. 
    // If we have a tall image, it adds finalImgHeight + 15.
    // maxImgHeight is now 150.
    // 130 + 150 + 15 = 295. This should trigger it.
    
    global.Image = class {
      onload: any = null;
      width = 100;
      height = 150; // This will result in finalImgHeight = 150 if contentWidth is large enough
      set src(val: string) {
        setTimeout(() => this.onload && this.onload(), 0);
      }
    } as any;

    await exportReportToPDF(mockResult as any, mockMetrics as any, mockScreenshot);
    const instance = mockjsPDF.mock.results[0].value;
    expect(instance.addPage).toHaveBeenCalled();
  });

  it('should add page before recommendations section if cursor is high', async () => {
    const longDescResult = {
      ...mockResult,
      issues: [
        {
          ...mockResult.issues[0],
          description: 'A'.repeat(2000)
        }
      ]
    };
    
    let instance: any;
    mockjsPDF.mockImplementationOnce(function() {
      instance = {
        addImage: vi.fn(),
        save: vi.fn(),
        setFontSize: vi.fn(),
        setTextColor: vi.fn(),
        text: vi.fn(),
        addPage: vi.fn(),
        splitTextToSize: vi.fn().mockReturnValue(Array(50).fill('line')),
        internal: { pageSize: { getWidth: () => 210, getHeight: () => 297 } }
      };
      return instance;
    });

    await exportReportToPDF(longDescResult as any, mockMetrics as any, mockScreenshot);
    expect(instance.addPage).toHaveBeenCalled();
  });

  it('should handle small image and non-high severity issue', async () => {
    const smallImgResult = {
      ...mockResult,
      issues: [
        { ...mockResult.issues[0], severity: 'Low' }
      ]
    };
    
    global.Image = class {
      onload: any = null;
      width = 100;
      height = 50; // Small height
      set src(val: string) {
        setTimeout(() => this.onload && this.onload(), 0);
      }
    } as any;

    await exportReportToPDF(smallImgResult as any, mockMetrics as any, mockScreenshot);
    expect(mockjsPDF).toHaveBeenCalled();
  });
});
