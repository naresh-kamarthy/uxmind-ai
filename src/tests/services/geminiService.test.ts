import { describe, it, expect, vi, beforeEach } from 'vitest';
import { analyzeScreenshot, regenerateSection } from '../../services/geminiService';

const mockGenerateContent = vi.fn();

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
      STRING: 'STRING',
      NUMBER: 'NUMBER',
      ARRAY: 'ARRAY'
    }
  };
});

describe('geminiService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.GEMINI_API_KEY = 'fake-key';
  });

  describe('analyzeScreenshot', () => {
    it('should return analysis result and tokens', async () => {
      const mockResponse = {
        text: JSON.stringify({
          uxScore: 85,
          uiType: 'Dashboard',
          metrics: { accessibility: 80, mobile: 70, hierarchy: 90, consistency: 85 },
          issues: [],
          improvements: []
        })
      };
      mockGenerateContent.mockResolvedValue(mockResponse);

      const { result, tokens } = await analyzeScreenshot('data:image/png;base64,fake');
      
      expect(result.uxScore).toBe(85);
      expect(tokens).toBeGreaterThan(0);
    });

    it('should throw error if response is empty', async () => {
      mockGenerateContent.mockResolvedValue({ text: '' });
      await expect(analyzeScreenshot('fake')).rejects.toThrow('Empty response from AI');
    });

    it('should handle NOT_FOUND error and trigger key selection', async () => {
      const openSelectKey = vi.fn();
      (window as any).aistudio = { openSelectKey };
      
      const error = new Error('Requested entity was not found');
      mockGenerateContent.mockRejectedValue(error);

      await expect(analyzeScreenshot('fake')).rejects.toThrow('API Key required. Please select a key and try again.');
      expect(openSelectKey).toHaveBeenCalled();
    });

    it('should handle NOT_FOUND error when aistudio is missing', async () => {
      delete (window as any).aistudio;
      const error = new Error('Requested entity was not found');
      mockGenerateContent.mockRejectedValue(error);

      await expect(analyzeScreenshot('fake')).rejects.toThrow('Requested entity was not found');
    });
  });

  describe('regenerateSection', () => {
    it('should return current content if response text is empty', async () => {
      mockGenerateContent.mockResolvedValue({ text: '' });
      const result = await regenerateSection('Suggestions', 'Old suggestion', 'fake');
      expect(result).toBe('Old suggestion');
    });

    it('should return regenerated text', async () => {
      mockGenerateContent.mockResolvedValue({ text: 'Improved suggestion' });
      const result = await regenerateSection('Suggestions', 'Old suggestion', 'fake');
      expect(result).toBe('Improved suggestion');
    });

    it('should return current content on error', async () => {
      mockGenerateContent.mockRejectedValue(new Error('Regen failed'));
      const result = await regenerateSection('Suggestions', 'Old suggestion', 'fake');
      expect(result).toBe('Old suggestion');
    });
  });
});
