import { render, screen, fireEvent } from '@testing-library/react';
import { UploadPanel } from '../../components/UploadPanel';
import { useAnalysisStore } from '../../store/analysisStore';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('UploadPanel component', () => {
  beforeEach(() => {
    useAnalysisStore.getState().reset();
  });

  it('renders upload instructions when no screenshot is present', () => {
    render(<UploadPanel />);
    expect(screen.getByText(/Upload UI Screenshot/i)).toBeInTheDocument();
    expect(screen.getByText(/Drag & drop or click to upload/i)).toBeInTheDocument();
  });

  it('renders preview when screenshot is present', () => {
    useAnalysisStore.getState().setScreenshot('data:image/png;base64,fake');
    render(<UploadPanel />);
    const img = screen.getByAltText('Screenshot preview');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'data:image/png;base64,fake');
  });

  it('shows remove button when screenshot is present', () => {
    useAnalysisStore.getState().setScreenshot('data:image/png;base64,fake');
    render(<UploadPanel />);
    const removeBtn = screen.getByRole('button', { name: /Remove screenshot/i });
    expect(removeBtn).toBeInTheDocument();
    
    fireEvent.click(removeBtn);
    expect(useAnalysisStore.getState().screenshot).toBeNull();
  });

  it('triggers file input on click', () => {
    render(<UploadPanel />);
    const dropzone = screen.getByTestId('dropzone');
    const input = screen.getByTestId('file-input') as HTMLInputElement;
    
    const clickSpy = vi.spyOn(input, 'click');
    fireEvent.click(dropzone);
    expect(clickSpy).toHaveBeenCalled();
  });

  it('handles file upload via input change', async () => {
    render(<UploadPanel />);
    const input = screen.getByTestId('file-input');
    const file = new File(['fake content'], 'test.png', { type: 'image/png' });
    
    // Mock FileReader
    const mockFileReader = {
      readAsDataURL: vi.fn(),
      onload: null as any,
    };
    vi.stubGlobal('FileReader', vi.fn(function() { return mockFileReader; }));

    fireEvent.change(input, { target: { files: [file] } });
    
    expect(mockFileReader.readAsDataURL).toHaveBeenCalledWith(file);
    
    // Simulate load
    await act(async () => {
      mockFileReader.onload({ target: { result: 'data:image/png;base64,result' } });
    });
    
    expect(useAnalysisStore.getState().screenshot).toBe('data:image/png;base64,result');
  });

  it('shows error for invalid file type', () => {
    render(<UploadPanel />);
    const input = screen.getByTestId('file-input');
    const file = new File(['fake content'], 'test.txt', { type: 'text/plain' });
    
    fireEvent.change(input, { target: { files: [file] } });
    expect(useAnalysisStore.getState().error).toBe('Please upload an image file (PNG, JPG, WEBP)');
  });

  it('does nothing if no file is selected', () => {
    render(<UploadPanel />);
    const input = screen.getByTestId('file-input');
    fireEvent.change(input, { target: { files: [] } });
    expect(useAnalysisStore.getState().screenshot).toBeNull();
  });

  it('does nothing if no file is dropped', () => {
    render(<UploadPanel />);
    const dropzone = screen.getByTestId('dropzone');
    fireEvent.drop(dropzone, {
      dataTransfer: {
        files: []
      }
    });
    expect(useAnalysisStore.getState().screenshot).toBeNull();
  });

  it('handles drag and drop events', () => {
    render(<UploadPanel />);
    const dropzone = screen.getByTestId('dropzone');
    
    // Drag over
    fireEvent.dragOver(dropzone);
    expect(dropzone).toHaveClass('border-emerald-500'); // isDragging effect
    
    // Drag leave
    fireEvent.dragLeave(dropzone);
    expect(dropzone).not.toHaveClass('border-white/20');
    
    // Drop
    const file = new File(['fake content'], 'test.png', { type: 'image/png' });
    const mockFileReader = {
      readAsDataURL: vi.fn(),
      onload: null as any,
    };
    vi.stubGlobal('FileReader', vi.fn(function() { return mockFileReader; }));

    fireEvent.drop(dropzone, {
      dataTransfer: {
        files: [file]
      }
    });
    
    expect(mockFileReader.readAsDataURL).toHaveBeenCalledWith(file);
  });
});

// Helper for act in non-hook tests if needed, but usually fireEvent handles it.
import { act } from '@testing-library/react';
