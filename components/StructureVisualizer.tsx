import React from 'react';
import { ArrowRight } from 'lucide-react';
import { STRUCTURE_TOOLTIPS } from '../constants';

interface StructureVisualizerProps {
  content: string;
}

export const StructureVisualizer: React.FC<StructureVisualizerProps> = ({ content }) => {
  // Regex to match structural tags like [Intro], [Verse 1], [Chorus], etc.
  // We look for text inside brackets that matches typical structure keywords
  const structureRegex = /\[(Intro|Verse|Chorus|Bridge|Outro|Drop|Hook|Pre-Chorus|Build|Break|Interlude|Solo|Instrumental)[^\]]*\]/gi;
  const matches = content.match(structureRegex);

  if (!matches || matches.length < 2) return null;

  return (
    <div className="mt-4 p-4 bg-black/40 border border-gray-800 rounded-lg overflow-x-auto">
      <div className="text-[10px] font-mono text-gray-500 uppercase mb-2 tracking-widest">Structure Flow Analysis</div>
      <div className="flex items-center gap-2 min-w-max pb-4"> {/* Added padding bottom for tooltip space */}
        {matches.map((tag, index) => {
          const cleanTag = tag.replace(/[\[\]]/g, '').trim();
          let colorClass = "border-gray-600 text-gray-400";
          let bgClass = "bg-gray-900";

          // Color coding based on section type
          if (/Chorus|Hook|Drop/i.test(cleanTag)) {
            colorClass = "border-detroit-neon text-detroit-neon";
            bgClass = "bg-detroit-neon/10";
          } else if (/Verse/i.test(cleanTag)) {
            colorClass = "border-blue-500 text-blue-400";
            bgClass = "bg-blue-900/20";
          } else if (/Intro|Outro/i.test(cleanTag)) {
            colorClass = "border-purple-500 text-purple-400";
            bgClass = "bg-purple-900/20";
          }

          // Find tooltip text
          const tooltipKey = Object.keys(STRUCTURE_TOOLTIPS).find(k => cleanTag.includes(k));
          const tooltipText = tooltipKey ? STRUCTURE_TOOLTIPS[tooltipKey] : "Song structure element";

          return (
            <React.Fragment key={index}>
              <div className="group relative flex flex-col items-center justify-center">
                 {/* Tooltip */}
                 <div className="absolute bottom-full mb-2 w-48 p-2 bg-gray-900 border border-gray-700 rounded text-[10px] text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 shadow-xl">
                    <div className="font-bold text-detroit-neon mb-1">{cleanTag}</div>
                    {tooltipText}
                    <div className="absolute bottom-[-4px] left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 border-b border-r border-gray-700 rotate-45"></div>
                 </div>

                 <div className={`flex flex-col items-center justify-center px-3 py-2 rounded border ${colorClass} ${bgClass} shadow-sm transition-transform hover:scale-105 cursor-help`}>
                    <span className="text-xs font-mono font-bold whitespace-nowrap">{cleanTag}</span>
                 </div>
              </div>
              {index < matches.length - 1 && (
                <ArrowRight className="w-4 h-4 text-gray-700 flex-shrink-0" />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
