import { useState, useCallback } from 'react';
import type { DragEvent, ChangeEvent } from 'react';
import { useAnalysisStore } from '../store/analysisStore';

export const useFileUpload = () => {
  const setScreenshot = useAnalysisStore((state) => state.setScreenshot);
  const setError = useAnalysisStore((state) => state.setError);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (PNG, JPG, WEBP)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setScreenshot(result);
    };
    reader.readAsDataURL(file);
  }, [setScreenshot]);

  const onDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const onFileChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  return { isDragging, onDragOver, onDragLeave, onDrop, onFileChange };
};
