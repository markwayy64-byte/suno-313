import React from 'react';
import { ChatSession } from '../types';
import { X, MessageSquare, Trash2, Plus } from 'lucide-react';

interface ChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: ChatSession[];
  currentSessionId: string | null;
  onSelectSession: (session: ChatSession) => void;
  onNewSession: () => void;
  onDeleteSession: (e: React.MouseEvent, id: string) => void;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  isOpen,
  onClose,
  sessions,
  currentSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession
}) => {
  return (
    <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-detroit-dark border-r border-gray-800 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="p-4 border-b border-gray-800 flex justify-between items-center">
        <h2 className="text-sm font-mono font-bold text-detroit-neon">SESSION_LOGS</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-white">
          <X className="w-5 h-5" />
        </button>
      </div>
      
      <div className="p-4">
        <button 
          onClick={onNewSession}
          className="w-full flex items-center justify-center gap-2 bg-detroit-steel hover:bg-gray-700 text-white p-2 rounded text-xs font-mono mb-4 transition-colors"
        >
          <Plus className="w-4 h-4" /> NEW OPERATION
        </button>

        <div className="space-y-2 overflow-y-auto max-h-[calc(100vh-180px)]">
          {sessions.map(session => (
            <div 
              key={session.id}
              onClick={() => onSelectSession(session)}
              className={`group flex items-center justify-between p-3 rounded cursor-pointer border transition-all ${
                session.id === currentSessionId 
                  ? 'bg-gray-900 border-detroit-neon/50 text-detroit-neon' 
                  : 'bg-transparent border-transparent hover:bg-gray-900/50 hover:border-gray-800 text-gray-400'
              }`}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <MessageSquare className="w-3 h-3 flex-shrink-0" />
                <div className="flex flex-col overflow-hidden">
                    <span className="text-xs font-mono truncate">{session.title}</span>
                    <span className="text-[10px] text-gray-600">{new Date(session.timestamp).toLocaleDateString()}</span>
                </div>
              </div>
              <button 
                onClick={(e) => {
                    e.stopPropagation();
                    onDeleteSession(e, session.id);
                }}
                className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-500 transition-opacity"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
          
          {sessions.length === 0 && (
            <div className="text-center text-gray-600 text-[10px] font-mono mt-4">
                NO LOGS FOUND
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
