export const estimateCost = (tokens: number) => {
  // Gemini 2.5 Flash pricing (approximate)
  // $0.10 / 1M input tokens
  // $0.40 / 1M output tokens
  // Let's use a flat $0.0001 per 1000 tokens for simplicity in this demo
  return (tokens / 1000) * 0.0001;
};

export const generateConfidence = () => {
  // Mock confidence score for UI display
  return 85 + Math.random() * 10;
};
