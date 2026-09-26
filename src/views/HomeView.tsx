import React, { useRef, useEffect } from 'react';
import { Columns, Bot, User } from 'lucide-react';
import { ChatMessage, ChatAttachment } from '../types';
import BottomInputBar from '../components/BottomInputBar';
import CompareGrid from '../components/CompareGrid';
import { generateGeneralHomeResponse, generateCompareResponses } from '../utils/aiGenerators';

interface HomeViewProps {
  messages: ChatMessage[];
  onSendMessage: (msg: ChatMessage) => void;
  onOpenVoiceOverlay: () => void;
  onOpenCamModal: () => void;
  compareMode: boolean;
  onToggleCompare: () => void;
  comparePrompt: string | null;
  compareResponses: Record<string, string> | null;
  onUpdateCompareResponses: (prompt: string, responses: Record<string, string>) => void;
}

export default function HomeView({
  messages,
  onSendMessage,
  onOpenVoiceOverlay,
  onOpenCamModal,
  compareMode,
  onToggleCompare,
  comparePrompt,
  compareResponses,
  onUpdateCompareResponses
}: HomeViewProps) {
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const compareEnabled = messages.some(m => m.sender === 'user') || messages.length > 0;
  const lastUserPrompt = [...messages].reverse().find(m => m.sender === 'user')?.text || null;

  const handleToggle = () => {
    if (!compareEnabled) return;
    if (!compareMode && lastUserPrompt && (!comparePrompt || comparePrompt !== lastUserPrompt)) {
      const responses = generateCompareResponses(lastUserPrompt);
      onUpdateCompareResponses(lastUserPrompt, responses);
    }
    onToggleCompare();
  };

  const handleSend = (text: string, attachments: ChatAttachment[]) => {
    if (compareMode) {
      // In compare mode, generate responses for all 5 models simultaneously
      const responses = generateCompareResponses(text);
      onUpdateCompareResponses(text, responses);
      return;
    }

    // Normal chat mode
    const userMsg: ChatMessage = {
      id: 'h_usr_' + Date.now(),
      sender: 'user',
      text,
      attachments,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    onSendMessage(userMsg);

    // Prepare compare responses for this question so it's ready when Compare is clicked
    const responses = generateCompareResponses(text);
    onUpdateCompareResponses(text, responses);

    setTimeout(() => {
      const reply = generateGeneralHomeResponse(text);
      const assistantMsg: ChatMessage = {
        id: 'h_ast_' + Date.now(),
        sender: 'assistant',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      onSendMessage(assistantMsg);
    }, 600);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#212121] overflow-hidden relative">
      {/* Top bar with Compare button */}
      <header className="h-14 bg-[#171717] border-b border-white/10 flex justify-between items-center px-4 flex-shrink-0 z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center font-bold text-white text-xs">
            G
          </div>
          <span className="font-bold text-white text-sm tracking-tight">Gromina</span>
        </div>

        {/* Right side: Compare button AI Fiesta style */}
        <button
          onClick={handleToggle}
          disabled={!compareEnabled}
          className={`border border-white/10 rounded-full px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5 transition shadow-xs ${
            !compareEnabled
              ? 'opacity-50 pointer-events-none cursor-not-allowed bg-[#2f2f2f] text-zinc-400'
              : compareMode
              ? 'bg-white text-black cursor-pointer'
              : 'bg-[#2f2f2f] text-zinc-300 hover:text-white hover:bg-white/10 cursor-pointer'
          }`}
          title={compareEnabled ? 'Compare AI models' : 'Ask a question first to enable Compare'}
        >
          <Columns className="w-3.5 h-3.5" />
          <span>Compare</span>
        </button>
      </header>

      {/* Main Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col">
        {compareMode ? (
          /* Compare Grid mode */
          <CompareGrid currentPrompt={comparePrompt} responses={compareResponses} />
        ) : messages.length === 0 ? (
          /* Clean Empty State - No example cards, no suggestion chips */
          <div className="m-auto flex flex-col items-center justify-center text-center p-6 max-w-lg select-none">
            <div className="w-16 h-16 rounded-full bg-[#2f2f2f] border border-white/10 flex items-center justify-center mb-5 shadow-lg">
              <span className="text-2xl font-bold text-white">G</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight mb-2">Gromina</h2>
            <p className="text-zinc-400 text-sm leading-relaxed max-w-md">
              How can I help you today?
            </p>
          </div>
        ) : (
          /* Normal Chat Messages Stream */
          <div className="max-w-3xl w-full mx-auto space-y-6 pb-6">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex gap-3.5 ${
                  msg.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.sender === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-[#2f2f2f] border border-white/10 flex items-center justify-center flex-shrink-0 mt-0.5 text-sky-400">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-4.5 space-y-2 text-sm leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-[#2f2f2f] text-white border border-white/10'
                      : 'bg-[#282828] text-zinc-100 border border-white/10 shadow-md'
                  }`}
                >
                  {/* Sender & timestamp */}
                  <div className="flex items-center justify-between text-xs text-zinc-400 pb-1 border-b border-white/5">
                    <span className="font-semibold text-zinc-300">
                      {msg.sender === 'user' ? 'You' : 'Gromina'}
                    </span>
                    <span className="text-[11px]">{msg.timestamp}</span>
                  </div>

                  {/* Attachment chips if any */}
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {msg.attachments.map(att => (
                        <div
                          key={att.id}
                          className="rounded-lg bg-black/40 border border-white/10 p-1.5 flex items-center gap-2 text-xs"
                        >
                          {att.type === 'image' && att.url ? (
                            <img
                              src={att.url}
                              alt={att.name}
                              className="w-12 h-12 rounded object-cover"
                            />
                          ) : (
                            <span className="text-sky-400 font-mono text-[10px]">FILE</span>
                          )}
                          <span className="text-zinc-300 truncate max-w-[120px]">{att.name}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>

                {msg.sender === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center flex-shrink-0 mt-0.5 text-white">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Shared Bottom Input Bar */}
      <BottomInputBar
        onSendMessage={handleSend}
        onOpenVoiceOverlay={onOpenVoiceOverlay}
        onOpenCamModal={onOpenCamModal}
        placeholder={compareMode ? 'Ask to compare...' : 'Ask anything'}
      />
    </div>
  );
}
