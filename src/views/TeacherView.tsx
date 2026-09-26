import React, { useState, useEffect, useRef } from 'react';
import {
  GraduationCap,
  Volume2,
  VolumeX,
  CheckCircle2,
  XCircle,
  Sparkles,
  Bot,
  User,
  Radio,
  Columns
} from 'lucide-react';
import { ChatMessage, ChatAttachment } from '../types';
import BottomInputBar from '../components/BottomInputBar';
import CompareGrid from '../components/CompareGrid';
import { generateTeacherResponse, generateCompareResponses } from '../utils/aiGenerators';

interface TeacherViewProps {
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

export default function TeacherView({
  messages,
  onSendMessage,
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
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
    <div className="flex-1 flex flex-col h-full bg-[#212121] overflow-hidden relative">
      {/* Top bar with centered pill toggle and right-side Compare button */}
      <div className="pt-3 pb-2 px-4 flex items-center justify-between z-10">
        <div className="w-24" />

        {/* Center pill toggle */}
        <div className="bg-[#2f2f2f] rounded-full p-1 w-fit border border-white/10 flex items-center shadow-md">
          <button
            onClick={() => {
              setActiveTab('text');
              if ('speechSynthesis' in window) window.speechSynthesis.cancel();
              setCurrentlySpeakingId(null);
            }}
            className={`rounded-full px-5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'text'
                ? 'bg-white text-black shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Text
          </button>
          <button
            onClick={() => setActiveTab('voice')}
            className={`rounded-full px-5 py-1.5 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
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
        <div className="w-24 flex justify-end">
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
        </div>
      </div>

      {/* Main chat stream area or Compare Grid */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col">
        {compareMode ? (
          <CompareGrid currentPrompt={comparePrompt} responses={compareResponses} />
        ) : messages.length === 0 ? (
          /* Empty state center */
          <div className="m-auto flex flex-col items-center justify-center text-center p-6 max-w-lg select-none">
            <div className="w-16 h-16 rounded-full bg-[#2f2f2f] border border-white/10 flex items-center justify-center mb-5 shadow-lg">
              <GraduationCap className="w-8 h-8 text-sky-400" />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight mb-2">My Teacher</h2>
            <p className="text-zinc-400 text-sm leading-relaxed max-w-md">
              Koi bhi topic pucho, teacher ki tarah step-by-step samjhaunga. Text aur Voice dono me.
            </p>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-6 pb-6">
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
                  className={`max-w-[85%] rounded-2xl p-4.5 space-y-3 ${
                    msg.sender === 'user'
                      ? 'bg-[#2f2f2f] text-white border border-white/10'
                      : 'bg-[#292929] text-zinc-100 border border-white/10 shadow-md'
                  }`}
                >
                  {/* Sender & Controls header */}
                  <div className="flex items-center justify-between text-xs text-zinc-400 pb-1 border-b border-white/5">
                    <span className="font-semibold text-zinc-300">
                      {msg.sender === 'user' ? 'You' : 'Teacher Persona'}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px]">{msg.timestamp}</span>
                      {msg.sender === 'assistant' && (
                        <button
                          onClick={() => speakMessage(msg.id, msg.text)}
                          className={`p-1 rounded-full hover:bg-white/10 transition ${
                            currentlySpeakingId === msg.id
                              ? 'text-sky-400 bg-sky-500/20 ring-1 ring-sky-400 animate-pulse'
                              : 'text-zinc-400 hover:text-white'
                          }`}
                          title={currentlySpeakingId === msg.id ? 'Stop speaking' : 'Read aloud'}
                        >
                          {currentlySpeakingId === msg.id ? (
                            <VolumeX className="w-3.5 h-3.5" />
                          ) : (
                            <Volume2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                      )}
                    </div>
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
                            <div className="p-2 bg-white/5 rounded">
                              <span className="text-sky-400 font-mono text-[10px]">FILE</span>
                            </div>
                          )}
                          <span className="text-zinc-300 truncate max-w-[120px]">{att.name}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Teacher structured output */}
                  {msg.teacherData ? (
                    <div className="space-y-4 text-sm leading-relaxed">
                      {/* Topic Title */}
                      <div className="flex items-center gap-2 text-base font-bold text-sky-300">
                        <Sparkles className="w-4 h-4 text-sky-400 flex-shrink-0" />
                        <span>{msg.teacherData.topic}</span>
                      </div>

                      {/* Overview */}
                      <p className="text-zinc-200">{msg.teacherData.overview}</p>

                      {/* Steps */}
                      <div className="space-y-3 pt-2">
                        {msg.teacherData.steps.map(s => (
                          <div
                            key={s.step}
                            className="bg-[#212121] rounded-xl p-3.5 border border-white/5"
                          >
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 text-xs font-bold flex items-center justify-center">
                                {s.step}
                              </span>
                              <h4 className="font-semibold text-white text-xs uppercase tracking-wide">
                                {s.title}
                              </h4>
                            </div>
                            <p className="text-zinc-300 text-xs pl-7">{s.content}</p>
                          </div>
                        ))}
                      </div>

                      {/* Pro Tip / Trick */}
                      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-xs text-amber-200/90 flex gap-2.5">
                        <span className="text-base flex-shrink-0">🎯</span>
                        <div>
                          <strong className="block text-amber-300 font-semibold mb-0.5">
                            Exam / Pro Trick
                          </strong>
                          <span>{msg.teacherData.proTip}</span>
                        </div>
                      </div>

                      {/* Question at End */}
                      <div className="bg-[#1c1c1c] border border-white/10 rounded-xl p-3.5 space-y-3">
                        <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300">
                          <span className="text-sky-400 font-bold">❓</span>
                          <span>{msg.teacherData.checkQuestion.question}</span>
                        </div>

                        <div className="space-y-1.5">
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
                                className={`w-full text-left p-2.5 rounded-lg border text-xs flex items-center justify-between transition ${btnStyle}`}
                              >
                                <span>{option}</span>
                                {isAnswered && isCorrect && (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 ml-2" />
                                )}
                                {isAnswered && isSelected && !isCorrect && (
                                  <XCircle className="w-4 h-4 text-red-400 flex-shrink-0 ml-2" />
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
                    <p className="whitespace-pre-wrap text-sm">{msg.text}</p>
                  )}
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
