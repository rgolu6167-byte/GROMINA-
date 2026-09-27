import React, { useState, useEffect, useRef } from 'react';
import {
  GraduationCap,
  CheckCircle2,
  XCircle,
  Sparkles,
  User,
  Radio,
  Columns
} from 'lucide-react';
import { ChatMessage, ChatAttachment } from '../types';
import BottomInputBar from '../components/BottomInputBar';
import CompareGrid from '../components/CompareGrid';
import { generateTeacherResponse, generateCompareResponses } from '../utils/aiGenerators';
import { UserMessageActions, AiMessageActions } from '../components/MessageActions';

interface TeacherViewProps {
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

export default function TeacherView({
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
}: TeacherViewProps) {
  const [activeTab, setActiveTab] = useState<'text' | 'voice'>('text');
  const [currentlySpeakingId, setCurrentlySpeakingId] = useState<string | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [editingMsgId, setEditingMsgId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const teacherScrollRef = useRef<HTMLDivElement | null>(null);
  const prevMessagesLengthRef = useRef(messages.length);

  // Auto-scroll logic like ChatGPT:
  // When user sends a message, scroll to bottom.
  // When AI answers, scroll to TOP of that assistant message so answer starts in view.
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

    // Retrigger AI teacher response
    setTimeout(() => {
      const teacherData = generateTeacherResponse(trimmed);
      const assistantText = `${teacherData.overview}\n\n` +
        teacherData.steps.map(s => `Step ${s.step}: ${s.title}\n${s.content}`).join('\n\n') +
        `\n\n🎯 Trick: ${teacherData.proTip}\n\n❓ Question: ${teacherData.checkQuestion.question}`;

      const assistantMsg: ChatMessage = {
        id: 'ast_' + Date.now(),
        sender: 'assistant',
        text: assistantText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        teacherData
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

    const teacherData = generateTeacherResponse(prompt);
    const assistantText = `${teacherData.overview}\n\n` +
      teacherData.steps.map(s => `Step ${s.step}: ${s.title}\n${s.content}`).join('\n\n') +
      `\n\n🎯 Trick: ${teacherData.proTip}\n\n❓ Question: ${teacherData.checkQuestion.question}`;

    if (onUpdateMessage) {
      onUpdateMessage(aiMsgId, assistantText);
    } else {
      const assistantMsg: ChatMessage = {
        id: 'ast_' + Date.now(),
        sender: 'assistant',
        text: assistantText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        teacherData
      };
      onSendMessage(assistantMsg);
    }
  };

  // Clean speech synthesis when leaving or tab change
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speakMessage = (msgId: string, text: string) => {
    if (!('speechSynthesis' in window)) return;

    if (currentlySpeakingId === msgId) {
      window.speechSynthesis.cancel();
      setCurrentlySpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    setCurrentlySpeakingId(msgId);

    const cleanSpeech = text
      .replace(/[#*`_~[\]]/g, '')
      .replace(/https?:\/\/\S+/g, '')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanSpeech);
    utterance.rate = 1.0;
    utterance.pitch = 1.05;

    utterance.onend = () => {
      setCurrentlySpeakingId(null);
    };
    utterance.onerror = () => {
      setCurrentlySpeakingId(null);
    };

    window.speechSynthesis.speak(utterance);
  };

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
      const responses = generateCompareResponses(text);
      onUpdateCompareResponses(text, responses);
      return;
    }

    const userMsg: ChatMessage = {
      id: 'usr_' + Date.now(),
      sender: 'user',
      text,
      attachments,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    onSendMessage(userMsg);

    // Prepare compare responses for this question so it's ready when Compare is clicked
    const responses = generateCompareResponses(text);
    onUpdateCompareResponses(text, responses);

    // Simulate smart structured teacher response
    setTimeout(() => {
      const teacherData = generateTeacherResponse(text);
      const assistantText = `${teacherData.overview}\n\n` +
        teacherData.steps.map(s => `Step ${s.step}: ${s.title}\n${s.content}`).join('\n\n') +
        `\n\n🎯 Trick: ${teacherData.proTip}\n\n❓ Question: ${teacherData.checkQuestion.question}`;

      const assistantMsg: ChatMessage = {
        id: 'ast_' + Date.now(),
        sender: 'assistant',
        text: assistantText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        teacherData
      };
      onSendMessage(assistantMsg);

      // If voice tab is active, trigger auto TTS!
      if (activeTab === 'voice') {
        const voiceText = `${teacherData.topic}. ${teacherData.overview} ${teacherData.steps[0].title}. ${teacherData.steps[0].content} Pro Tip: ${teacherData.proTip}`;
        speakMessage(assistantMsg.id, voiceText);
      }
    }, 600);
  };

  const handleAnswerSelect = (msgId: string, optionIndex: number) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [msgId]: optionIndex
    }));
  };

  return (
    <div className="flex-1 flex flex-col h-full min-h-0 bg-[#212121] relative [touch-action:pan-x_pan-y_pinch-zoom]">
      {/* Top bar with Gromina header (Fix 6), centered pill toggle and right-side Compare button */}
      <header className="h-14 bg-[#171717] border-b border-white/10 flex justify-between items-center px-4 flex-shrink-0 z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center font-bold text-white text-xs shadow-xs">
            G
          </div>
          <span className="font-bold text-white text-sm tracking-tight">Gromina</span>
        </div>

        {/* Center pill toggle */}
        <div className="bg-[#2f2f2f] rounded-full p-1 w-fit border border-white/10 flex items-center shadow-md">
          <button
            onClick={() => {
              setActiveTab('text');
              if ('speechSynthesis' in window) window.speechSynthesis.cancel();
              setCurrentlySpeakingId(null);
            }}
            className={`rounded-full px-4 py-1 text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'text'
                ? 'bg-white text-black shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Text
          </button>
          <button
            onClick={() => setActiveTab('voice')}
            className={`rounded-full px-4 py-1 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'voice'
                ? 'bg-white text-black shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            Voice
          </button>
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

      {/* Main chat stream area or Compare Grid */}
      <div ref={teacherScrollRef} className="chat-scroll flex-1 overflow-y-auto overflow-x-auto [touch-action:pan-x_pan-y_pinch-zoom] [-webkit-overflow-scrolling:touch] scroll-smooth overscroll-contain px-4 py-4 pb-4 flex flex-col min-h-0">
        {compareMode ? (
          <CompareGrid currentPrompt={comparePrompt} responses={compareResponses} />
        ) : messages.length === 0 ? (
          /* Empty state center */
          <div className="m-auto flex flex-col items-center justify-center text-center p-6 max-w-lg">
            <div className="w-16 h-16 rounded-full bg-[#2f2f2f] border border-white/10 flex items-center justify-center mb-5 shadow-lg">
              <GraduationCap className="w-8 h-8 text-sky-400" />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight mb-2">My Teacher</h2>
            <p className="text-zinc-400 text-sm leading-relaxed max-w-md">
              Ask any topic, I'll explain step-by-step like a teacher. In both Text and Voice.
            </p>
          </div>
        ) : (
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
                  /* USER MESSAGE: Right side thin bubble like ChatGPT */
                  <div className="w-full flex justify-end items-start gap-2.5">
                    <div className="flex flex-col items-end max-w-[70%] md:max-w-[60%]">
                      {/* Timestamp above bubble right aligned */}
                      <span className="text-[11px] text-zinc-500 mb-1 pr-1 font-normal select-none">
                        You {msg.timestamp}
                      </span>

                      {/* User bubble: thin patla like ChatGPT */}
                      <div className="w-fit max-w-full bg-[#2f2f2f] text-white rounded-2xl rounded-br-sm px-3 py-2 text-[14px] leading-5 font-normal break-words border border-white/10 shadow-xs space-y-1.5">
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

                        {/* User message edit mode vs normal text */}
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

                      {/* Below user bubble: compact action row Copy, Edit, Retry */}
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
                  /* AI MESSAGE: Left side thin bubble like ChatGPT */
                  <div className="w-full flex justify-start items-start gap-2.5">
                    {/* Avatar G logo w-7 h-7 left */}
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center font-bold text-white text-xs flex-shrink-0 mt-0.5 shadow-xs">
                      G
                    </div>

                    <div className="flex flex-col items-start max-w-[82%] md:max-w-[75%]">
                      {/* Timestamp above bubble left aligned */}
                      <span className="text-[11px] text-zinc-500 mb-1 pl-1 font-normal select-none">
                        Gromina {msg.timestamp}
                      </span>

                      {/* AI bubble */}
                      <div className="w-fit max-w-full bg-[#2f2f2f]/60 border border-white/5 rounded-2xl rounded-bl-sm px-3.5 py-2.5 text-[14px] leading-6 text-left text-zinc-100 shadow-xs space-y-3">
                        {msg.teacherData ? (
                          <div className="space-y-3 text-[14px] leading-relaxed">
                            {/* Topic Title */}
                            <div className="flex items-center gap-2 text-sm font-bold text-sky-300">
                              <Sparkles className="w-4 h-4 text-sky-400 flex-shrink-0" />
                              <span>{msg.teacherData.topic}</span>
                            </div>

                            {/* Overview */}
                            <p className="text-zinc-200 text-xs leading-5">{msg.teacherData.overview}</p>

                            {/* Steps */}
                            <div className="space-y-2 pt-1">
                              {msg.teacherData.steps.map(s => (
                                <div
                                  key={s.step}
                                  className="bg-[#212121] rounded-xl p-2.5 border border-white/5"
                                >
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="w-4 h-4 rounded-full bg-sky-500/20 text-sky-400 text-[10px] font-bold flex items-center justify-center">
                                      {s.step}
                                    </span>
                                    <h4 className="font-semibold text-white text-xs uppercase tracking-wide">
                                      {s.title}
                                    </h4>
                                  </div>
                                  <p className="text-zinc-300 text-xs leading-5 pl-6">{s.content}</p>
                                </div>
                              ))}
                            </div>

                            {/* Pro Tip / Trick */}
                            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-2.5 text-xs text-amber-200/90 flex gap-2">
                              <span className="text-sm flex-shrink-0">🎯</span>
                              <div>
                                <strong className="block text-amber-300 font-semibold mb-0.5 text-xs">
                                  Exam / Pro Trick
                                </strong>
                                <span className="leading-5">{msg.teacherData.proTip}</span>
                              </div>
                            </div>

                            {/* Question at End */}
                            <div className="bg-[#1c1c1c] border border-white/10 rounded-xl p-2.5 space-y-2">
                              <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300">
                                <span className="text-sky-400 font-bold">❓</span>
                                <span>{msg.teacherData.checkQuestion.question}</span>
                              </div>

                              <div className="space-y-1">
                                {msg.teacherData.checkQuestion.options.map((option, idx) => {
                                  const isAnswered = selectedAnswers[msg.id] !== undefined;
                                  const isSelected = selectedAnswers[msg.id] === idx;
                                  const isCorrect = idx === msg.teacherData?.checkQuestion.correctIndex;

                                  let btnStyle = 'bg-[#282828] hover:bg-white/10 text-zinc-300 border-transparent';
                                  if (isAnswered) {
                                    if (isCorrect) {
                                      btnStyle = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-medium';
                                    } else if (isSelected) {
                                      btnStyle = 'bg-red-500/20 text-red-300 border-red-500/40';
                                    } else {
                                      btnStyle = 'bg-[#222] text-zinc-500 border-transparent opacity-60';
                                    }
                                  }

                                  return (
                                    <button
                                      key={idx}
                                      disabled={isAnswered}
                                      onClick={() => handleAnswerSelect(msg.id, idx)}
                                      className={`w-full text-left p-2 rounded-lg border text-xs flex items-center justify-between transition ${btnStyle}`}
                                    >
                                      <span>{option}</span>
                                      {isAnswered && isCorrect && (
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 ml-2" />
                                      )}
                                      {isAnswered && isSelected && !isCorrect && (
                                        <XCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0 ml-2" />
                                      )}
                                    </button>
                                  );
                                })}
                              </div>

                              {selectedAnswers[msg.id] !== undefined && (
                                <p className="text-[11px] text-zinc-400 italic pt-1 border-t border-white/5">
                                  💡 {msg.teacherData.checkQuestion.explanation}
                                </p>
                              )}
                            </div>
                          </div>
                        ) : (
                          <p className="whitespace-pre-wrap">{msg.text}</p>
                        )}
                      </div>

                      {/* Below AI bubble: action row Copy, Read Aloud, Retry, Download, Like, Dislike */}
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
        placeholder={compareMode ? 'Ask to compare...' : 'Ask any topic...'}
      />
    </div>
  );
}
