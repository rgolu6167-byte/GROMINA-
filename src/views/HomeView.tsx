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
  const prevMessagesLengthRef = useRef(messages.length);

  // Auto-scroll logic like ChatGPT:
  // When user sends a message, scroll so the question is visible.
  // When AI answers, scroll to TOP of that assistant message to show where answer starts.
  useEffect(() => {
    if (messages.length === 0) {
      prevMessagesLengthRef.current = 0;
      return;
    }

    const isNew = messages.length > prevMessagesLengthRef.current;
    prevMessagesLengthRef.current = messages.length;

    if (isNew) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.sender === 'assistant') {
        const el = document.getElementById(`msg-${lastMsg.id}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          setTimeout(() => {
            document.getElementById(`msg-${lastMsg.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 60);
        }
      } else {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }
    }
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
    <div className="flex-1 flex flex-col h-full min-h-0 bg-[#212121] relative [touch-action:pan-x_pan-y_pinch-zoom]">
      {/* Top bar with Compare button */}
      <header className="h-14 bg-[#171717] border-b border-white/10 flex justify-between items-center px-4 flex-shrink-0 z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center font-bold text-white text-xs shadow-xs">
            G
          </div>
          <span className="font-bold text-white text-sm tracking-tight">Gromina</span>
        </div>

        {/* Right side: Compare button */}
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
      <div ref={homeScrollRef} className="chat-scroll flex-1 overflow-y-auto overflow-x-auto [touch-action:pan-x_pan-y_pinch-zoom] [-webkit-overflow-scrolling:touch] scroll-smooth overscroll-contain px-4 py-4 pb-4 flex flex-col min-h-0">
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
          <div className="max-w-3xl w-full mx-auto space-y-4 pb-6">
            {messages.map(msg => (
              <div
                key={msg.id}
                id={`msg-${msg.id}`}
                className={`group w-full flex ${
                  msg.sender === 'user' ? 'justify-end' : 'justify-start'
                } scroll-mt-4`}
              >
                {msg.sender === 'user' ? (
                  /* USER MESSAGE: Right side like ChatGPT */
                  <div className="w-full flex justify-end items-start gap-2.5">
                    <div className="flex flex-col items-end max-w-[70%] md:max-w-[60%]">
                      {/* Timestamp above bubble right aligned */}
                      <span className="text-[11px] text-zinc-500 mb-1 pr-1 font-normal select-none">
                        You {msg.timestamp}
                      </span>

                      {/* User bubble: thin patla like ChatGPT */}
                      <div className="w-fit max-w-[70%] md:max-w-[60%] bg-[#2f2f2f] text-white rounded-2xl rounded-br-sm px-3 py-2 text-sm leading-5 font-normal break-words border border-white/10 shadow-xs space-y-1.5">
                        {/* Attachment chips if any */}
                        {msg.attachments && msg.attachments.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-0.5">
                            {msg.attachments.map(att => (
                              <div
                                key={att.id}
                                className="rounded-lg bg-black/40 border border-white/10 p-1 flex items-center gap-1.5 text-xs"
                              >
                                {att.type === 'image' && att.url ? (
                                  <img
                                    src={att.url}
                                    alt={att.name}
                                    className="w-10 h-10 rounded object-cover"
                                  />
                                ) : (
                                  <span className="text-sky-400 font-mono text-[10px]">FILE</span>
                                )}
                                <span className="text-zinc-300 truncate max-w-[120px] text-[11px]">{att.name}</span>
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
                              className="w-full bg-[#1e1e1e] border border-white/20 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-white/40 resize-none min-h-[60px] leading-relaxed [touch-action:manipulation]"
                              rows={2}
                              autoFocus
                            />
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={handleCancelEdit}
                                className="px-2.5 py-1 text-xs text-zinc-300 hover:text-white rounded-full border border-white/10 hover:bg-white/10 transition cursor-pointer"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSaveEdit(msg.id)}
                                className="px-3 py-1 text-xs font-semibold text-black bg-white hover:bg-zinc-200 rounded-full transition cursor-pointer shadow-xs"
                              >
                                Save
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="whitespace-pre-wrap">{msg.text}</p>
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
                    {/* G logo avatar on left */}
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center font-bold text-white text-xs flex-shrink-0 mt-0.5 shadow-xs">
                      G
                    </div>

                    <div className="flex flex-col items-start max-w-[82%] md:max-w-[75%]">
                      {/* Timestamp above bubble left aligned */}
                      <span className="text-[11px] text-zinc-500 mb-1 pl-1 font-normal select-none">
                        Gromina {msg.timestamp}
                      </span>

                      {/* AI bubble */}
                      <div className="w-fit max-w-[82%] md:max-w-[75%] bg-[#2f2f2f]/60 border border-white/5 rounded-2xl rounded-bl-sm px-3.5 py-2.5 text-sm leading-6 whitespace-pre-wrap break-words text-left text-zinc-100 shadow-xs space-y-2">
                        <p className="whitespace-pre-wrap">{msg.text}</p>
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
