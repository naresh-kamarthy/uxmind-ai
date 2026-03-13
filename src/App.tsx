import { Layout, Play, RefreshCcw, Sparkles, AlertCircle, AlertTriangle, Image as ImageIcon, FileText, BarChart3 } from 'lucide-react';
import { useAnalysisStore } from './store/analysisStore';
import { useAIAnalysis } from './hooks/useAIAnalysis';
import { UploadPanel } from './components/UploadPanel';
import { ScoreGauge } from './components/ScoreGauge';
import { IssuesPanel } from './components/IssuesPanel';
import { SuggestionsPanel } from './components/SuggestionsPanel';
import { MetricsFooter } from './components/MetricsFooter';
import { AIThinking } from './components/AIThinking';
import { ScreenshotAnnotations } from './components/ScreenshotAnnotations';
import { ErrorStateCard } from './components/ErrorStateCard';
import { RecentAnalysesPanel } from './components/RecentAnalysesPanel';
import { AIConfidenceIndicator } from './components/AIConfidenceIndicator';
import { exportReportToPDF } from './utils/exportReport';
import { motion, AnimatePresence } from 'motion/react';
import React, { useCallback } from 'react';

export default function App() {
  const { screenshot, isAnalyzing, progress, result, metrics, error } = useAnalysisStore();
  const { runAnalysis } = useAIAnalysis();

  const handleDownloadReport = useCallback(async () => {
    if (!result || !metrics || !screenshot) return;
    await exportReportToPDF(result, metrics, screenshot);
  }, [result, metrics, screenshot]);

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-400 font-sans selection:bg-emerald-500/30">
      {/* Top Bar */}
      <header className="h-16 border-b border-white/5 bg-black/50 backdrop-blur-xl flex items-center justify-between px-6 sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none" className="w-6 h-6">
              <path d="M9 10V16C9 18.2091 10.7909 20 13 20C15.2091 20 17 18.2091 17 16V10" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M20 10L26 22M26 10L20 22" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">UX<span className="text-emerald-400">Mind</span></h1>
        </div>

        <nav className="flex items-center gap-1">
          {result && (
            <button
              onClick={handleDownloadReport}
              className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 rounded-lg transition-colors text-xs font-bold text-black mr-2 shadow-lg shadow-emerald-500/20"
            >
              <FileText className="w-4 h-4" />
              Download PDF Report
            </button>
          )}
        </nav>
      </header>

      <main className="p-6 max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[calc(100vh-120px)]">

        {/* Left Panel - Control & Stats */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          <div className="flex flex-col gap-6">
            <UploadPanel />
            <RecentAnalysesPanel />
          </div>

          <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex flex-col gap-6">
            {result ? (
              <>
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Detected UI Type</span>
                  <div className="px-3 py-2 bg-white/5 rounded-lg border border-white/5 text-sm font-semibold text-white">
                    {result.uiType}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 py-4">
                  <ScoreGauge score={result.uxScore} label="Overall UX Score" max={100} />
                </div>

                <div className="flex flex-col gap-3">
                  <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Key Indicators</span>
                  <div className="space-y-3">
                    <IndicatorBar label="Accessibility" score={result.metrics.accessibility} />
                    <IndicatorBar label="Mobile Readiness" score={result.metrics.mobile} />
                    <IndicatorBar label="Visual Hierarchy" score={result.metrics.hierarchy} />
                    <IndicatorBar label="Layout Consistency" score={result.metrics.consistency} />
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Layout className="w-12 h-12 text-zinc-700 mb-4" />
                <p className="text-sm text-zinc-500">Upload a screenshot to see analysis metrics</p>
              </div>
            )}

            <button
              onClick={runAnalysis}
              disabled={!screenshot || isAnalyzing}
              className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-300 ${!screenshot || isAnalyzing
                  ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                  : "bg-emerald-500 text-black hover:bg-emerald-400 shadow-lg shadow-emerald-500/20 active:scale-[0.98]"
                }`}
            >
              {isAnalyzing ? (
                <RefreshCcw className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4 fill-current" />
              )}
              {isAnalyzing ? "Analyzing..." : "Analyze UX"}
            </button>
          </div>
        </div>

        {/* Center Panel - Preview & Suggestions */}
        <div className="lg:col-span-6 flex flex-col gap-6 relative">
          <AnimatePresence>
            {isAnalyzing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm rounded-2xl"
              >
                <AIThinking />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex-1 bg-zinc-900/30 border border-white/5 rounded-2xl overflow-hidden relative group min-h-[400px] flex items-center justify-center">
            {error ? (
              <ErrorStateCard onRetry={runAnalysis} />
            ) : screenshot ? (
              <div className="w-full h-full">
                {result ? (
                  <ScreenshotAnnotations screenshot={screenshot} issues={result.issues} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center p-4">
                    <img
                      src={screenshot}
                      alt="UI Preview"
                      className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-zinc-700">
                <div className="w-24 h-24 rounded-full border-2 border-dashed border-zinc-800 flex items-center justify-center mb-4">
                  <ImageIcon className="w-10 h-10" />
                </div>
                <p className="font-medium">No screenshot selected</p>
              </div>
            )}

            {/* Decorative background elements */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden opacity-20">
              <div className="absolute -top-24 -left-24 w-64 h-64 bg-emerald-500/20 blur-[100px] rounded-full" />
              <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-blue-500/20 blur-[100px] rounded-full" />
            </div>
          </div>

          {/* AI Analysis Metrics Panel */}
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-zinc-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
            >
              <h2 className="text-sm font-bold text-white mb-6 uppercase tracking-widest flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-400" />
                AI Analysis Metrics
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-6">
                <MetricItem label="UX Score" value={result.uxScore} suffix="%" />
                <AIConfidenceIndicator confidence={metrics?.confidence || 0} />
                <MetricItem label="Accessibility" value={result.metrics.accessibility} suffix="%" />
                <MetricItem label="Mobile" value={result.metrics.mobile} suffix="%" />
                <MetricItem label="Hierarchy" value={result.metrics.hierarchy} suffix="%" />
                <MetricItem label="Consistency" value={result.metrics.consistency} suffix="%" />
              </div>
            </motion.div>
          )}

          <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <h2 className="text-sm font-bold text-white mb-4 uppercase tracking-widest flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              Suggested Improvements
            </h2>
            {result ? (
              <SuggestionsPanel suggestions={result.improvements} />
            ) : (
              <div className="py-8 text-center border border-dashed border-white/5 rounded-xl">
                <p className="text-xs text-zinc-600">AI suggestions will appear here after analysis</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Issues */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          <div className="flex-1 bg-zinc-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex flex-col">
            <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-400" />
              Detected UX Issues
            </h2>

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <p className="text-xs text-red-400 font-medium leading-relaxed">{error}</p>
              </div>
            )}

            {result ? (
              <IssuesPanel issues={result.issues} />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border border-dashed border-white/5 rounded-xl">
                <p className="text-sm text-zinc-600">No issues detected yet. Run the AI review to start auditing.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer Metrics */}
      <footer className="h-12">
        {metrics && <MetricsFooter metrics={metrics} />}
      </footer>
    </div>
  );
}

export function IndicatorBar({ label, score }: { label: string; score: number }) {
  const percentage = score;
  const getColor = (s: number) => {
    if (s >= 80) return 'bg-emerald-400';
    if (s >= 50) return 'bg-yellow-400';
    return 'bg-red-400';
  };

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
        <span className="text-zinc-400">{label}</span>
        <span className="text-zinc-300">{score}%</span>
      </div>
      <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
        <motion.div
          className={`h-full ${getColor(score)}`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, delay: 0.5 }}
        />
      </div>
    </div>
  );
}

function MetricItem({ label, value, suffix = "" }: { label: string; value: number; suffix?: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">{label}</span>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold text-white">{Math.round(value)}</span>
        <span className="text-xs text-zinc-500 font-medium">{suffix}</span>
      </div>
    </div>
  );
}
