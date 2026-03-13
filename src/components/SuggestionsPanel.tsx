import { SectionRegenerator } from './SectionRegenerator';

export const SuggestionsPanel = ({ suggestions = [] }: { suggestions?: string[] }) => {
  if (suggestions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center bg-zinc-900/30 rounded-2xl border border-white/5">
        <p className="text-sm text-zinc-500">No suggestions yet. Run an analysis to see improvements.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {suggestions.map((suggestion, idx) => (
        <SectionRegenerator 
          key={idx}
          section={`Suggestion ${idx + 1}`}
          content={suggestion}
        />
      ))}
    </div>
  );
};
