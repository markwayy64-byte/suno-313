
import React, { useState, useRef, useEffect } from 'react';
import { Mic, Send, Disc, Activity, AlertCircle, Brain, Globe, StopCircle, Menu, Paperclip, Settings, Hash, LayoutTemplate, X } from 'lucide-react';
import { generateResponse, transcribeAudio, analyzeAudioContext } from './services/gemini';
import { Message, AppMode, Preset, ChatSession, AudioAnalysis } from './types';
import { ChatMessage } from './components/ChatMessage';
import { ChatSidebar } from './components/ChatSidebar';
import { AudioAnalysisPanel } from './components/AudioAnalysisPanel';
import { TemplateEditor } from './components/TemplateEditor';
import { PRESETS, AUTOSUGGEST_TAGS } from './constants';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<AppMode>(AppMode.GENERATOR);
  const [hasKey, setHasKey] = useState(!!process.env.API_KEY);
  
  // Feature Toggles & Settings
  const [useThinking, setUseThinking] = useState(false);
  const [useSearch, setUseSearch] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [sampleRate, setSampleRate] = useState<'44.1kHz' | '48kHz'>('44.1kHz');
  const [bitDepth, setBitDepth] = useState<'16-bit' | '24-bit'>('16-bit');
  
  // Autosuggest & Templates State
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionQuery, setSuggestionQuery] = useState('');
  const [showTemplateEditor, setShowTemplateEditor] = useState(false);
  
  // Analysis State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<AudioAnalysis | null>(null);

  // Recording State
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  
  // Sidebar & History State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [sessionId, setSessionId] = useState<string>('');

  // File Upload
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load Sessions from LocalStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('dhz_sessions');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSessions(parsed);
      } catch (e) {
        console.error("Failed to parse sessions", e);
      }
    }
    startNewSession();
  }, []);

  // Save Sessions to LocalStorage whenever they change
  useEffect(() => {
    if (sessions.length > 0) {
        localStorage.setItem('dhz_sessions', JSON.stringify(sessions));
    }
  }, [sessions]);

  // Autosuggest Logic
  useEffect(() => {
    const lastChar = input.slice(-1);
    const match = input.match(/\[([a-zA-Z0-9\s:_-]*)$/);
    
    if (match) {
        setShowSuggestions(true);
        setSuggestionQuery(match[1].toLowerCase());
    } else {
        setShowSuggestions(false);
    }
  }, [input]);

  // Auto-save current session
  useEffect(() => {
    if (!sessionId || messages.length === 0) return;
    
    setSessions(prev => {
        const index = prev.findIndex(s => s.id === sessionId);
        const title = messages.find(m => m.role === 'user')?.content.substring(0, 30) || "New Operation";
        
        const updatedSession = {
            id: sessionId,
            title: title,
            timestamp: Date.now(),
            messages: messages
        };

        if (index >= 0) {
            const newSessions = [...prev];
            newSessions[index] = updatedSession;
            return newSessions;
        } else {
            return [updatedSession, ...prev];
        }
    });
  }, [messages, sessionId]);

  const startNewSession = () => {
    const newId = Date.now().toString();
    setSessionId(newId);
    setMessages([
        {
          id: 'init',
          role: 'assistant',
          content: "What up doe? I'm D-Hz. We ain't guessin' today, we engineerin'. Tell me what you tryna build, or upload a sample description if you tryna beef up a beat. Let's stack this bread.",
          timestamp: Date.now()
        }
    ]);
    setIsSidebarOpen(false);
    setCurrentAnalysis(null);
  };

  const loadSession = (session: ChatSession) => {
      setSessionId(session.id);
      setMessages(session.messages);
      setIsSidebarOpen(false);
  };

  const deleteSession = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      setSessions(prev => {
          const newSessions = prev.filter(s => s.id !== id);
          localStorage.setItem('dhz_sessions', JSON.stringify(newSessions)); // Sync immediately for delete
          return newSessions;
      });
      if (id === sessionId) {
          startNewSession();
      }
  };

  const handleReply = (message: Message) => {
    const index = messages.findIndex(m => m.id === message.id);
    if (index === -1) return;

    // Slice history up to and including the selected message
    const newHistory = messages.slice(0, index + 1);
    const newId = Date.now().toString();
    
    // Create new branched session
    const newSession: ChatSession = {
        id: newId,
        title: `Branch: ${message.content.substring(0, 20)}...`,
        timestamp: Date.now(),
        messages: newHistory
    };

    setSessions(prev => [newSession, ...prev]);
    setSessionId(newId);
    setMessages(newHistory);
    setIsSidebarOpen(false); // Close sidebar if open to show the "new" chat
  };

  const insertTag = (tag: string) => {
      // Find the last '[' and replace everything after it with the tag
      const lastIndex = input.lastIndexOf('[');
      if (lastIndex !== -1) {
          const prefix = input.substring(0, lastIndex);
          setInput(`${prefix}[${tag}] `);
          setShowSuggestions(false);
          inputRef.current?.focus();
      }
  };

  const handleTemplateApply = (structure: string) => {
      setInput(prev => `${prev}\n\n${structure}`);
      setShowTemplateEditor(false);
      inputRef.current?.focus();
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    if (!hasKey) {
        const errorMsg: Message = {
            id: Date.now().toString(),
            role: 'system',
            type: 'error',
            content: 'SYSTEM ERROR: API_KEY MISSING. Check environment configuration.',
            timestamp: Date.now()
        };
        setMessages(prev => [...prev, errorMsg]);
        return;
    }

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const history = messages.filter(m => m.role !== 'system').map(m => `${m.role === 'user' ? 'User' : 'D-Hz'}: ${m.content}`);
      
      let promptToSend = `[Technical Specs: ${sampleRate}, ${bitDepth}] ${input}`;
      
      // Inject analysis context if available
      if (currentAnalysis) {
          promptToSend = `[AUDIO ANALYSIS CONTEXT: BPM=${currentAnalysis.detectedBpm}, Key=${currentAnalysis.detectedKey}, Balance=${currentAnalysis.spectralBalance}] ${promptToSend}`;
      }

      if (mode === AppMode.BEEF_UP) {
        promptToSend = `[CONTEXT: The user wants to "Beef Up" an uploaded sample. Treat the input as a description of the latent seed audio. Apply the signal chain protocol. Use granular exclusions if necessary.] ${promptToSend}`;
      }

      const response = await generateResponse(promptToSend, history, { useThinking, useSearch });
      
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.text,
        timestamp: Date.now(),
        groundingMetadata: response.groundingMetadata
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (error: any) {
      console.error(error);
      let errorMessage = "UNKNOWN SYSTEM FAILURE.";
      if (error.message?.includes('403') || error.message?.includes('API key')) errorMessage = "ACCESS DENIED: INVALID API KEY OR PERMISSIONS.";
      if (error.message?.includes('503') || error.message?.includes('Overloaded')) errorMessage = "SYSTEM OVERLOAD: THE ENGINE IS STALLED. TRY AGAIN.";
      if (error.message?.includes('404')) errorMessage = "RESOURCE NOT FOUND: MODEL OR ENDPOINT MISSING.";
      
      const errorMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: 'system',
          type: 'error',
          content: `ERROR: ${errorMessage}\nDetails: ${error.message || 'No details available.'}`,
          timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMsg]);

    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMode(AppMode.BEEF_UP);
    setIsAnalyzing(true);
    setCurrentAnalysis(null);

    // Get Audio Duration using Web Audio API
    let duration = 0;
    try {
        const arrayBuffer = await file.arrayBuffer();
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        duration = audioBuffer.duration;
        audioContext.close();
    } catch (e) {
        console.warn("Could not decode audio for duration", e);
    }

    try {
        // Trigger D-Hz "Analysis" based on file metadata
        const analysis = await analyzeAudioContext(file.name, duration);
        setCurrentAnalysis(analysis);
        
        const systemMsg: Message = {
            id: Date.now().toString(),
            role: 'assistant',
            content: `What up doe? I ran a spectral scan on "${file.name}". Check the specs above.\n\nBased on that ${analysis.spectralBalance} balance, I'm thinking we need to ${analysis.suggestions[0].toLowerCase()}.\n\nTell me exactly what you tryna construct, or pop open the TEMPLATES to structure this out.`,
            timestamp: Date.now()
        };
        setMessages(prev => [...prev, systemMsg]);
        setShowTemplateEditor(true); // Open editor immediately to encourage structure
    } catch (e) {
        console.error("Analysis failed", e);
    } finally {
        setIsAnalyzing(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
           const base64Audio = (reader.result as string).split(',')[1];
           setIsLoading(true);
           try {
               const transcription = await transcribeAudio(base64Audio);
               setInput(transcription);
           } catch (e) {
               console.error("Transcription failed", e);
               const errorMsg: Message = {
                   id: Date.now().toString(),
                   role: 'system',
                   type: 'error',
                   content: 'AUDIO TRANSCRIPTION FAILED.',
                   timestamp: Date.now()
               };
               setMessages(prev => [...prev, errorMsg]);
           } finally {
               setIsLoading(false);
           }
        };
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      const errorMsg: Message = {
        id: Date.now().toString(),
        role: 'system',
        type: 'error',
        content: 'MICROPHONE ACCESS DENIED.',
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMsg]);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !showSuggestions) {
      e.preventDefault();
      handleSend();
    }
  };

  const applyPreset = (preset: Preset) => {
      setInput(`I need a prompt for: ${preset.genre}. Vibe: ${preset.description}`);
  };

  const filteredSuggestions = AUTOSUGGEST_TAGS.filter(tag => tag.toLowerCase().includes(suggestionQuery));

  return (
    <div className="min-h-screen bg-[#050505] text-detroit-text font-sans flex flex-col items-center relative overflow-hidden">
      
      <ChatSidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)}
        sessions={sessions}
        currentSessionId={sessionId}
        onSelectSession={loadSession}
        onNewSession={startNewSession}
        onDeleteSession={deleteSession}
      />

      {/* Background Ambience */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-900/10 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-detroit-neon/5 blur-[120px] rounded-full pointer-events-none"></div>

      {/* Header */}
      <header className="w-full max-w-4xl p-6 border-b border-gray-900/50 backdrop-blur-md sticky top-0 z-20 flex flex-col sm:flex-row justify-between items-center bg-[#050505]/80 gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
            <button 
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 text-gray-500 hover:text-detroit-neon transition-colors"
            >
                <Menu className="w-6 h-6" />
            </button>
            <div className="relative">
                <Disc className={`w-8 h-8 text-detroit-neon ${isLoading || isAnalyzing ? 'animate-spin' : ''}`} />
                <div className="absolute top-0 right-0 w-2 h-2 bg-detroit-alert rounded-full animate-pulse"></div>
            </div>
            <div>
                <h1 className="text-xl font-bold font-mono tracking-tighter text-white glitch-text" data-text="D-Hz ARCHITECT">D-Hz ARCHITECT</h1>
                <p className="text-xs text-gray-500 font-mono tracking-widest">SUNO V5 ENGINEERING PROTOCOL</p>
            </div>
        </div>
        
        <div className="flex flex-wrap gap-2 justify-center">
            <button 
                onClick={() => setMode(AppMode.GENERATOR)}
                className={`px-3 py-1 text-xs font-mono border rounded transition-all ${mode === AppMode.GENERATOR ? 'bg-detroit-neon text-black border-detroit-neon' : 'border-gray-800 text-gray-500 hover:border-gray-600'}`}
            >
                GENERATOR
            </button>
            <button 
                 onClick={() => setMode(AppMode.BEEF_UP)}
                 className={`px-3 py-1 text-xs font-mono border rounded transition-all flex items-center gap-2 ${mode === AppMode.BEEF_UP ? 'bg-detroit-alert text-white border-detroit-alert' : 'border-gray-800 text-gray-500 hover:border-gray-600'}`}
            >
                <Activity className="w-3 h-3" /> BEEF_UP_AUDIO
            </button>
        </div>
      </header>

      {/* Main Chat Area */}
      <main className="flex-1 w-full max-w-4xl p-4 overflow-y-auto z-10 flex flex-col">
        {/* Audio Analysis Panel */}
        <AudioAnalysisPanel analysis={currentAnalysis} isAnalyzing={isAnalyzing} />

        {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} onReply={handleReply} />
        ))}
        {isLoading && (
            <div className="flex justify-start w-full mb-6">
                 <div className="bg-detroit-dark border border-detroit-alert/30 text-detroit-text rounded-lg p-4 flex items-center gap-2">
                    <span className="w-2 h-2 bg-detroit-alert rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-detroit-alert rounded-full animate-bounce delay-75"></span>
                    <span className="w-2 h-2 bg-detroit-alert rounded-full animate-bounce delay-150"></span>
                    <span className="text-xs font-mono text-gray-500 ml-2">
                      {isRecording ? "ANALYZING AUDIO WAVEFORM..." : useThinking ? "DEEP THINKING (GEMINI 3 PRO)..." : "CALCULATING LATENT VECTORS..."}
                    </span>
                 </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </main>

      {/* Input Area */}
      <footer className="w-full max-w-4xl p-4 sticky bottom-0 z-20 bg-[#050505]">
        
        {/* Controls Bar */}
        <div className="flex gap-4 mb-2 justify-end items-center">
            
           {showSettings && (
             <div className="flex items-center gap-2 bg-gray-900 p-1 rounded border border-gray-700 animate-in fade-in slide-in-from-bottom-2">
                <select 
                    value={sampleRate} 
                    onChange={(e) => setSampleRate(e.target.value as any)}
                    className="bg-black text-[10px] font-mono text-gray-300 border border-gray-700 rounded p-1 outline-none"
                >
                    <option value="44.1kHz">44.1kHz</option>
                    <option value="48kHz">48kHz</option>
                </select>
                <select 
                    value={bitDepth} 
                    onChange={(e) => setBitDepth(e.target.value as any)}
                    className="bg-black text-[10px] font-mono text-gray-300 border border-gray-700 rounded p-1 outline-none"
                >
                    <option value="16-bit">16-bit</option>
                    <option value="24-bit">24-bit</option>
                </select>
             </div>
           )}

           <button 
             onClick={() => setShowSettings(!showSettings)}
             className={`flex items-center gap-1 text-[10px] font-mono px-2 py-1 rounded border transition-colors ${showSettings ? 'bg-detroit-steel border-gray-500 text-white' : 'border-gray-800 text-gray-600 hover:border-gray-600'}`}
             title="Audio Fidelity Settings"
           >
             <Settings className="w-3 h-3" /> SPECS
           </button>

           <div className="w-[1px] h-4 bg-gray-800 mx-1"></div>

           <button 
             onClick={() => setShowTemplateEditor(!showTemplateEditor)}
             className={`flex items-center gap-1 text-[10px] font-mono px-2 py-1 rounded border transition-colors ${showTemplateEditor ? 'bg-detroit-steel border-gray-500 text-white' : 'border-gray-800 text-gray-600 hover:border-gray-600'}`}
             title="Structure Templates"
           >
             <LayoutTemplate className="w-3 h-3" /> TEMPLATES
           </button>

           <div className="w-[1px] h-4 bg-gray-800 mx-1"></div>

           <button 
             onClick={() => setUseThinking(!useThinking)}
             className={`flex items-center gap-1 text-[10px] font-mono px-2 py-1 rounded border transition-colors ${useThinking ? 'bg-purple-900/50 border-purple-500 text-purple-300' : 'border-gray-800 text-gray-600 hover:border-gray-600'}`}
             title="Use Gemini 3 Pro Reasoning"
           >
             <Brain className="w-3 h-3" /> DEEP THINK
           </button>
           <button 
             onClick={() => setUseSearch(!useSearch)}
             className={`flex items-center gap-1 text-[10px] font-mono px-2 py-1 rounded border transition-colors ${useSearch ? 'bg-blue-900/50 border-blue-500 text-blue-300' : 'border-gray-800 text-gray-600 hover:border-gray-600'}`}
             title="Use Google Search"
           >
             <Globe className="w-3 h-3" /> WEB SEARCH
           </button>
        </div>

        <div className="relative">
            
            {/* Template Editor Popup */}
            {showTemplateEditor && (
                <div className="absolute bottom-full right-0 mb-2 w-full max-w-md bg-detroit-dark border border-