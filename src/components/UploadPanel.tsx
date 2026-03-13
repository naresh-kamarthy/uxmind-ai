import { Upload, Image as ImageIcon } from 'lucide-react';
import { useFileUpload } from '../hooks/useFileUpload';
import { useAnalysisStore } from '../store/analysisStore';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const UploadPanel = () => {
  const { isDragging, onDragOver, onDragLeave, onDrop, onFileChange } = useFileUpload();
  const screenshot = useAnalysisStore((state) => state.screenshot);

  return (
    <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 h-full flex flex-col">
      <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <Upload className="w-5 h-5 text-emerald-400" />
        Upload UI Screenshot
      </h2>
      
      <div
        data-testid="dropzone"
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={cn(
          "flex-1 border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-all duration-300 cursor-pointer relative overflow-hidden group",
          isDragging ? "border-emerald-500 bg-emerald-500/10" : "border-white/10 hover:border-white/20 hover:bg-white/5",
          screenshot ? "p-0" : "p-8"
        )}
        onClick={() => document.getElementById('file-upload')?.click()}
      >
        <input
          id="file-upload"
          data-testid="file-input"
          type="file"
          className="hidden"
          accept="image/*"
          onChange={onFileChange}
        />

        {screenshot ? (
          <div className="relative w-full h-full group">
            <img 
              src={screenshot} 
              alt="Screenshot preview" 
              className="w-full h-full object-contain rounded-lg"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-4">
              <p className="text-white text-sm font-medium">Click to change</p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  useAnalysisStore.getState().setScreenshot(null);
                }}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-lg transition-colors"
                aria-label="Remove screenshot"
              >
                Remove screenshot
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <ImageIcon className="w-6 h-6 text-zinc-400" />
            </div>
            <p className="text-zinc-300 font-medium text-center">Drag & drop or click to upload</p>
            <p className="text-zinc-500 text-xs mt-2">Supports PNG, JPG, WEBP</p>
          </>
        )}
      </div>
    </div>
  );
};
