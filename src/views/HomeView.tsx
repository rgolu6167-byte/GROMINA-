import React, { useState, useRef, useEffect } from 'react';
import { Columns, Bot, User } from 'lucide-react';
import { ChatMessage, ChatAttachment } from '../types';
import BottomInputBar from '../components/BottomInputBar';
import CompareGrid from '../components/CompareGrid';
import { UserMessageActions, AiMessageActions } from '../components/MessageActions';
import { generateGeneralHomeResponse, generateCompareResponses } from '../utils/aiGenerators';

interface HomeViewProps {
  messages: ChatMessage[];
  onSendMessage: (msg: ChatMessage) => void;
  onUpdateMessage?: (msgId: string, newText: string) => void;
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
  onUpdateMessage,
  onOpenVoiceOverlay,
  onOpenCamModal,
  compareMode,
  onToggleCompare,
  comparePrompt,
  compareResponses,
  onUpdateCompareResponses
}: HomeViewProps) {
  const [editingMsgId, setEditingMsgId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const homeScrollRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll like ChatGPT on new user message or AI answer
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages]);

  const compareEnabled = messages.some(m => m.sender === 'user') || messages.length > 0;
  const lastUserPrompt = [...messages].reverse().find(m => m.sender === 'user')?.text || null;

  const handleStartEdit = (msg: ChatMessage) => {
    setEditingMsgId(msg.id);
    setEditText(msg.text);
  };

  const handleCancelEdit = () => {
    setEditingMsgId(null);
    setEditText('');
  };

  const handleSaveEdit = (msgId: string) => {
    const trimmed = editText.trim();
    if (!trimmed) return;
    setEditingMsgId(null);

    if (onUpdateMessage) {
      onUpdateMessage(msgId, trimmed);
    }

    // Retrigger AI response
    setTimeout(() => {
      const reply = generateGeneralHomeResponse(trimmed);
      const assistantMsg: ChatMessage = {
        id: 'h_ast_' + Date.now(),
        sender: 'assistant',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      onSendMessage(assistantMsg);
    }, 500);
  };

  const handleRetryUserPrompt = (prompt: string) => {
    handleSend(prompt, []);
  };

  const handleRetryAiResponse = (aiMsgId: string) => {
    const msgIndex = messages.findIndex(m => m.id === aiMsgId);
    let prompt = '';
    for (let i = msgIndex - 1; i >= 0; i--) {
      if (messages[i].sender === 'user') {
        prompt = messages[i].text;
        break;
      }
    }
    if (!prompt && lastUserPrompt) prompt = lastUserPrompt;
    if (!prompt) return;

    const reply = generateGeneralHomeResponse(prompt);
    if (onUpdateMessage) {
      onUpdateMessage(aiMsgId, reply);
    } else {
      const assistantMsg: ChatMessage = {
        id: 'h_ast_' + Date.now(),
        sender: 'assistant',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      onSendMessage(assistantMsg);
    }
  };

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

    // Normal mode: append user message
    const userMsg: ChatMessage = {
      id: 'h_usr_' + Date.now(),
      sender: 'user',
      text,
      attachments,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    onSendMessage(userMsg);

    // Prepare compare responses in background so Compare is instant if clicked
    const responses = generateCompareResponses(text);
    onUpdateCompareResponses(text, responses);

    // Normal assistant reply after short realistic delay
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
    <div className="flex-1 flex flex-col min-h-0 bg-[#212121] relative [touch-action:pan-x_pan-y_pinch-zoom]">
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

      {/* Main Area: chat-scroll with zoom and scroll like ChatGPT */}
      <div ref={homeScrollRef} className="chat-scroll flex-1 overflow-y-auto overflow-x-auto [touch-action:pan-x_pan-y_pinch-zoom] [-webkit-overflow-scrolling:touch] scroll-smooth px-4 py-4 pb-4 flex flex-col min-h-0">
        {compareMode ? (
          /* Compare Grid mode */
          <CompareGrid currentPrompt={comparePrompt} responses={compareResponses} />
        ) : messages.length === 0 ? (
          /* Clean Empty State - No example chats */
          <div className="m-auto flex flex-col items-center justify-center text-center p-6 max-w-lg">
            <div className="w-16 h-16 rounded-full bg-[#2f2f2f] border border-white/10 flex items-center justify-center mb-5 shadow-lg">
              <span className="text-2xl font-bold text-white">G</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight mb-2">Gromina</h2>
            <p className="text-zinc-400 text-sm leading-relaxed max-w-md">
              How can I help you today?
            </p>
          </div>
        ) : (
          /* Normal Chat Messages Stream: ChatGPT style user right, AI left */
          <div className="max-w-3xl w-full mx-auto space-y-6 pb-6">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`group w-full flex ${
                  msg.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.sender === 'user' ? (
                  /* USER MESSAGE: Right side like ChatGPT */
                  <div className="w-full flex justify-end items-start gap-2.5">
                    <div className="max-w-[70%] ml-auto flex flex-col items-end">
                      {/* User bubble */}
                      <div className="bg-[#2f2f2f] text-white rounded-2xl rounded-br-xs px-4 py-2.5 text-left border border-white/10 shadow-sm w-fit space-y-2">
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

                        {/* User message or inline editor */}
                        {editingMsgId === msg.id ? (
                          <div className="mt-1 space-y-2 min-w-[220px]">
                            <textarea
                              value={editText}
                              onChange={e => setEditText(e.target.value)}
                              className="w-full bg-[#1e1e1e] border border-white/20 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-white/40 resize-none min-h-[70px] leading-relaxed [touch-action:manipulation]"
                              rows={2}
                              autoFocus
                            />
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={handleCancelEdit}
                                className="px-3 py-1 text-xs text-zinc-300 hover:text-white rounded-full border border-white/10 hover:bg-white/10 transition cursor-pointer"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSaveEdit(msg.id)}
                                className="px-3.5 py-1 text-xs font-semibold text-black bg-white hover:bg-zinc-200 rounded-full transition cursor-pointer shadow-xs"
                              >
                                Save
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.text}</p>
                        )}
                      </div>

                      {/* Below user bubble: action row Copy Edit Retry right aligned */}
                      {editingMsgId !== msg.id && (
                        <UserMessageActions
                          text={msg.text}
                          onEdit={() => handleStartEdit(msg)}
                          onRetry={() => handleRetryUserPrompt(msg.text)}
                        />
                      )}
                    </div>

                    {/* Small User avatar on right */}
                    <div className="w-7 h-7 rounded-full bg-zinc-700 text-white flex items-center justify-center flex-shrink-0 mt-0.5 text-xs">
                      <User className="w-3.5 h-3.5" />
                    </div>
                  </div>
                ) : (
                  /* AI MESSAGE: Left side like ChatGPT */
                  <div className="w-full flex justify-start items-start gap-2.5">
                    {/* Small AI avatar on left */}
                    <div className="w-7 h-7 rounded-full bg-[#2f2f2f] border border-white/10 flex items-center justify-center flex-shrink-0 mt-0.5 text-sky-400">
                      <Bot className="w-3.5 h-3.5" />
                    </div>

                    <div className="max-w-[80%] mr-auto flex flex-col items-start">
                      {/* AI bubble */}
                      <div className="bg-[#212121] text-white rounded-2xl rounded-bl-xs px-4 py-2.5 text-left border border-white/10 shadow-sm w-full space-y-2">
                        <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-100">{msg.text}</p>
                      </div>

                      {/* Below AI bubble: action row Copy Sound Retry Download left aligned */}
                      <AiMessageActions
                        text={msg.text}
                        onRetry={() => handleRetryAiResponse(msg.id)}
                      />
                    </div>
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
