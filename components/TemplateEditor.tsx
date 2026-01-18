
import React, { useState, useEffect, useRef } from 'react';
import { StructureTemplate, SongSection } from '../types';
import { ADVANCED_TEMPLATES, STRUCTURE_TOOLTIPS } from '../constants';
import { GripVertical, X, Plus, Play, Info, ArrowUp, ArrowDown, Layers } from 'lucide-react';

interface TemplateEditorProps {
  onApply: (structure: string) => void;
  analysisContext?: any;
}

export const TemplateEditor: React.FC<TemplateEditorProps> = ({ onApply, analysisContext }) => {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(ADVANCED_TEMPLATES[0].id);
  const [sections, setSections] = useState<SongSection[]>([]);
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Initialize sections when template changes
  useEffect(() => {
    const tpl = ADVANCED_TEMPLATES.find(t => t.id === selectedTemplateId);
    if (tpl) {
      // Deep copy to allow editing
      setSections(JSON.parse(JSON.stringify(tpl.sections)));
    }
  }, [selectedTemplateId]);

  // Context-aware suggestion logic
  useEffect(() => {
    if (analysisContext) {
      // Logic to auto-select template based on analysis
      if (analysisContext.transientDensity === 'High (Percussive)') {
          setSelectedTemplateId('edm_banger');
      } else if (analysisContext.transientDensity === 'Low (Ambient)') {
          setSelectedTemplateId('ambient_journey');
      }
    }
  }, [analysisContext]);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    // Optional: Set a drag image if desired, otherwise browser default
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault(); // Necessary to allow dropping
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) return;

    const newSections = [...sections];
    const itemToMove = newSections[draggedIndex];
    
    // Remove from old position
    newSections.splice(draggedIndex, 1);
    // Insert at new position
    newSections.splice(targetIndex, 0, itemToMove);
    
    setSections(newSections);
    setDraggedIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const removeSection = (index: number) => {
    setSections(prev => prev.filter((_, i) => i !== index));
  };

  const addSection = () => {
    const newId = (sections.length + 1).toString();
    const newSection: SongSection = { 
        id: `custom-${Date.now()}`, 
        name: "New Section", 
        bars: 8, 
        type: "verse", 
        description: "Custom added section." 
    };
    setSections(prev => [...prev, newSection]);
  };

  const updateSection = (index: number, field: keyof SongSection, value: any) => {
      const newSections = [...sections];
      newSections[index] = { ...newSections[index], [field]: value };
      setSections(newSections);
  };

  const generateOutput = () => {
    return sections.map(s => `[${s.name}: ${s.bars} Bars - ${s.description}]`).join('\n');
  };

  const currentTemplate = ADVANCED_TEMPLATES.find(t => t.id === selectedTemplateId);

  return (
    <div className="bg-[#0a0a0a] border border-gray-800 rounded-lg p-4 mt-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-mono font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-detroit-neon" />
            TEMPLATE MATRIX
        </h3>
        <select 
            value={selectedTemplateId}
            onChange={(e) => setSelectedTemplateId(e.target.value)}
            className="bg-gray-900 text-xs font-mono text-gray-300 border border-gray-700 rounded p-1 outline-none"
        >
            {ADVANCED_TEMPLATES.map(t => (
                <option key={t.id} value={t.id}>{t.label}</option>
            ))}
        </select>
      </div>

      <div className="text-[10px] text-gray-500 mb-4 italic">
          {currentTemplate?.description}
          {analysisContext && <span className="text-detroit-neon ml-2">(Recommended based on scan)</span>}
      </div>

      <div className="space-y-2 mb-4 max-h-60 overflow-y-auto pr-1">
        {sections.map((section, index) => (
          <div 
            key={section.id} 
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
            className={`flex items-center gap-2 bg-gray-900/50 p-2 rounded border group transition-colors cursor-move ${
                draggedIndex === index ? 'opacity-40 border-dashed border-gray-500' : 'border-gray-800 hover:border-gray-600'
            }`}
            onMouseEnter={() => setHoveredSection(section.type)}
            onMouseLeave={() => setHoveredSection(null)}
          >
            <GripVertical className="w-4 h-4 text-gray-600 flex-shrink-0" />
            
            <input 
                value={section.name}
                onChange={(e) => updateSection(index, 'name', e.target.value)}
                className="bg-transparent text-xs font-bold text-white w-24 outline-none border-b border-transparent focus:border-detroit-neon"
                onMouseDown={(e) => e.stopPropagation()} // Prevent drag start when clicking input
            />
            
            <div className="flex items-center gap-1 bg-black px-1 rounded">
                <input 
                    type="number"
                    value={section.bars}
                    onChange={(e) => updateSection(index, 'bars', parseInt(e.target.value))}
                    className="bg-transparent text-[10px] font-mono text-gray-400 w-6 outline-none text-center"
                    onMouseDown={(e) => e.stopPropagation()}
                />
                <span className="text-[10px] text-gray-600">bars</span>
            </div>

            <input 
                value={section.description}
                onChange={(e) => updateSection(index, 'description', e.target.value)}
                className="bg-transparent text-[10px] text-gray-400 flex-1 outline-none border-b border-transparent focus:border-detroit-neon"
                onMouseDown={(e) => e.stopPropagation()}
            />

            <div className="relative group/tooltip">
                 <Info className="w-3 h-3 text-gray-600" />
                 <div className="absolute right-0 bottom-full mb-2 w-48 p-2 bg-gray-800 border border-gray-600 rounded text-[10px] text-gray-300 hidden group-hover/tooltip:block z-50">
                     {STRUCTURE_TOOLTIPS[Object.keys(STRUCTURE_TOOLTIPS).find(k => section.type.includes(k.toLowerCase())) || "Intro"] || "Section element"}
                 </div>
            </div>

            <button 
                onClick={() => removeSection(index)} 
                className="text-gray-600 hover:text-red-500"
                onMouseDown={(e) => e.stopPropagation()}
            >
                <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
          <button 
            onClick={addSection}
            className="flex-1 py-2 rounded border border-dashed border-gray-700 text-gray-500 text-xs hover:border-gray-500 hover:text-gray-300 flex items-center justify-center gap-1"
          >
            <Plus className="w-3 h-3" /> ADD SECTION
          </button>
          <button 
            onClick={() => onApply(generateOutput())}
            className="flex-1 py-2 rounded bg-detroit-steel hover:bg-detroit-neon text-white hover:text-black text-xs font-bold flex items-center justify-center gap-2 transition-colors"
          >
            <Play className="w-3 h-3" /> INJECT STRUCTURE
          </button>
      </div>
    </div>
  );
};
