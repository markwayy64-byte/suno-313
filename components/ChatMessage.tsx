import React, { useState, useEffect } from 'react';
import { Message } from '../types';
import { Typewriter } from './Typewriter';
import { Copy, Terminal, Zap, Volume2, Loader2, Globe, AlertTriangle, Download, Reply } from 'lucide-react';
import { generateSpeech } from '../services/gemini';
import { StructureVisualizer } from './StructureVisualizer';

interface ChatMessageProps {
  message: Message;
  onReply: (message: Message) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, onReply }) => {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';
  const isDHz = message.role === 'assistant';
  const isError = message.type === 'error';

  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (audio) {
        audio.pause();
        audio.src = '';
      }
    };
  }, [audio]);

  const extractCode = (content: string) => {
    const codeBlockRegex = /```(?:text|markdown)?\s*([\s\S]*?)\s*```/;
    const match = content.match(codeBlockRegex);
    return match ? match[1].trim() : null;
  };

  const code = extractCode(message.content);
  const displayContent = message.content.replace(/```(?:text|markdown)?\s*([\s\S]*?)\s*```/, '').trim();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const downloadPrompt = (text: string) => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `D-Hz_Vector_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePlayAudio = async () => {
    if (isPlaying && audio) {
      audio.pause();
      setIsPlaying(false);
      return;
    }

    if (audio) {
      audio.play();
      setIsPlaying(true);
      return;
    }

    setIsLoadingAudio(true);
    try {
      // If message already has audio data, use it. Otherwise generate it.
      let audioData = message.audioData;
      if (!audioData) {
        audioData = await generateSpeech(displayContent.substring(0, 500)); // Limit TTS to 500 chars for speed
      }

      if (audioData) {
        const audioSrc = `data:audio/mp3;base64,${audioData}`;
        const newAudio = new Audio(audioSrc);
        newAudio.onended = () => setIsPlaying(false);
        newAudio.play();
        setAudio(newAudio);
        setIsPlaying(true);
      }
    } catch (e) {
      console.error("Audio playback failed", e);
    } finally {
      setIsLoadingAudio(false);
    }
  };

  const sources = message.groundingMetadata?.groundingChunks?.filter(c => c.web).map(c => c.web);

  // Error Message Styling
  if (isError) {
    return (
      <div className="flex w-full mb-6 justify-center">
        <div className="max-w-[85%] rounded-lg p-3 bg-red-900/20 border border-red-500/50 text-red-400 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <div className="text-xs font-mono whitespace-pre-wrap">{message.content}</div>
        </div>
      </div>
    );
  }

  // System Message Styling (Non-error)
  if (isSystem) {
      return (
        <div className="flex w-full mb-4 justify-center">
             <div className="text-xs font-mono text-gray-500 bg-gray-900/50 px-3 py-1 rounded-full border border-gray-800">
                 {message.content}
             </div>
        </div>
      )
  }

  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[85%] sm:max-w-[75%] rounded-lg p-4 border ${
        isUser 
          ? 'bg-detroit-steel border-detroit-neon/30 text-detroit-text' 
          : 'bg-detroit-dark border-detroit-alert/30 text-detroit-text'
      }`}>
        <div className="flex items-center justify-between mb-2 border-b border-gray-800 pb-2">
            <div className="flex items-center gap-2">
                {isDHz ? <Terminal className="w-4 h-4 text-detroit-alert" /> : <div className="w-4 h-4 rounded-full bg-detroit-neon"></div>}
                <span className={`text-xs font-mono font-bold ${isDHz ? 'text-detroit-alert' : 'text-detroit-neon'}`}>
                    {isDHz ? 'D-Hz // ARCHITECT' : 'USER // OPERATOR'}
                </span>
            </div>
            
            <div className="flex items-center gap-3">
                <button 
                    onClick={() => onReply(message)}
                    className="text-gray-500 hover:text-detroit-neon transition-colors"
                    title="Branch Thread from this Message"
                >
                    <Reply className="w-4 h-4" />
                </button>

                {isDHz && (
                    <button 
                        onClick={handlePlayAudio}
                        className="text-gray-500 hover:text-detroit-neon transition-colors"
                        title="Play Audio (TTS)"
                    >
                        {isLoadingAudio ? <Loader2 className="w-4 h-4 animate-spin" /> : <Volume2 className={`w-4 h-4 ${isPlaying ? 'text-detroit-neon animate-pulse' : ''}`} />}
                    </button>
                )}
            </div>
        </div>

        <div className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
            {isDHz ? displayContent : message.content}
        </div>

        {sources && sources.length > 0 && (
          <div className="mt-3 text-xs font-mono border-t border-gray-800 pt-2">
            <div className="flex items-center gap-1 text-gray-500 mb-1">
               <Globe className="w-3 h-3" />
               <span>SEARCH SOURCES:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {sources.map((source, idx) => (
                <a 
                  key={idx} 
                  href={source?.uri} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-gray-900 text-blue-400 hover:text-blue-300 px-2 py-1 rounded border border-gray-800 hover:border-blue-500 truncate max-w-[200px]"
                >
                  {source?.title || 'Source'}
                </a>
              ))}
            </div>
          </div>
        )}

        {code && (
            <div className="mt-4">
                <StructureVisualizer content={code} />
                <div className="mt-4 bg-black border border-detroit-neon/50 rounded-md overflow-hidden relative group">
                    <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                         <button 
                            onClick={() => downloadPrompt(code)}
                            className="bg-detroit-steel hover:bg-gray-700 text-white p-1 rounded"
                            title="Download .txt"
                         >
                            <Download className="w-4 h-4" />
                         </button>
                         <button 
                            onClick={() => copyToClipboard(code)}
                            className="bg-detroit-steel hover:bg-gray-700 text-white p-1 rounded"
                            title="Copy Prompt"
                         >
                            <Copy className="w-4 h-4" />
                         </button>
                    </div>
                    <div className="bg-gray-900 px-3 py-1 border-b border-gray-800 flex items-center gap-2">
                        <Zap className="w-3 h-3 text-yellow-400" />
                        <span className="text-[10px] font-mono text-gray-400 uppercase">Engineered_Vector.txt</span>
                    </div>
                    <pre className="p-4 overflow-x-auto text-detroit-neon font-mono text-xs">
                        {code}
                    </pre>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};
