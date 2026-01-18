
import React, { useEffect, useState } from 'react';
import { AudioAnalysis } from '../types';
import { Activity, BarChart2, Zap, Radio, Layers, AlertCircle } from 'lucide-react';

interface AudioAnalysisPanelProps {
  analysis: AudioAnalysis | null;
  isAnalyzing: boolean;
}

export const AudioAnalysisPanel: React.FC<AudioAnalysisPanelProps> = ({ analysis, isAnalyzing }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isAnalyzing) {
      setProgress(0);
      const interval = setInterval(() => {
        setProgress(prev => Math.min(prev + 2, 99));
      }, 50);
      return () => clearInterval(interval);
    } else {
      setProgress(100);
    }
  }, [isAnalyzing]);

  if (isAnalyzing) {
    return (
      <div className="w-full bg-detroit-dark border border-detroit-neon/30 rounded-lg p-6 mb-4 animate-pulse">
        <div className="flex items-center gap-3 mb-4">
          <Activity className="w-5 h-5 text-detroit-neon animate-spin" />
          <span className="font-mono text-sm text-detroit-neon">RUNNING SPECTRAL ANALYSIS...</span>
        </div>
        <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-detroit-neon transition-all duration-75"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div className="flex justify-between mt-2 font-mono text-[10px] text-gray-500">
           <span>SCANNING TRANSIENTS</span>
           <span>CHECKING PHASE CORRELATION</span>
           <span>DETECTING KEY</span>
        </div>
      </div>
    );
  }

  if (!analysis) return null;

  return (
    <div className="w-full bg-[#080808] border border-gray-800 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-4 border-b border-gray-800 pb-2">
        <h3 className="text-xs font-mono font-bold text-gray-300 flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-detroit-neon" />
          ANALYSIS REPORT: {analysis.filename}
        </h3>
        <span className="text-[10px] font-mono text-gray-600">{analysis.sampleRate} // {analysis.duration}</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
        <div className="bg-gray-900/50 p-2 rounded border border-gray-800">
          <div className="text-[10px] text-gray-500 mb-1">DETECTED BPM</div>
          <div className="text-lg font-mono font-bold text-white">{analysis.detectedBpm}</div>
        </div>
        <div className="bg-gray-900/50 p-2 rounded border border-gray-800">
          <div className="text-[10px] text-gray-500 mb-1">KEY</div>
          <div className="text-lg font-mono font-bold text-detroit-neon">{analysis.detectedKey}</div>
        </div>
        <div className="bg-gray-900/50 p-2 rounded border border-gray-800">
          <div className="text-[10px] text-gray-500 mb-1">SPECTRAL BAL</div>
          <div className="text-xs font-mono font-bold text-blue-300">{analysis.spectralBalance}</div>
        </div>
        <div className="bg-gray-900/50 p-2 rounded border border-gray-800">
          <div className="text-[10px] text-gray-500 mb-1">STEREO IMG</div>
          <div className="text-xs font-mono font-bold text-purple-300">{analysis.stereoImage}</div>
        </div>
      </div>

      <div className="space-y-2">
         <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">D-Hz Engineering Suggestions</div>
         {analysis.suggestions.map((sug, i) => (
           <div key={i} className="flex items-start gap-2 text-xs text-gray-400 bg-gray-900/30 p-2 rounded">
             <AlertCircle className="w-3 h-3 text-yellow-500 mt-0.5 flex-shrink-0" />
             <span>{sug}</span>
           </div>
         ))}
      </div>
    </div>
  );
};
