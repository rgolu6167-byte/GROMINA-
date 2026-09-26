import React, { useState, useRef, useEffect } from 'react';
import {
  Briefcase,
  Bot,
  User,
  MessageCircle,
  Share2,
  CheckCircle,
  Building2,
  Edit3
} from 'lucide-react';
import { BusinessConfig, ChatMessage, ChatAttachment, SocialConnection } from '../types';
import BottomInputBar from '../components/BottomInputBar';
import { generateBusinessResponse } from '../utils/aiGenerators';
import { UserMessageActions, AiMessageActions } from '../components/MessageActions';

interface BusinessViewProps {
  businessConfig: BusinessConfig;
  onUpdateConfig: (config: BusinessConfig) => void;
  isCreated: boolean;
  setIsCreated: (created: boolean) => void;
  messages: ChatMessage[];
  onSendMessage: (msg: ChatMessage) => void;
  onUpdateMessage?: (msgId: string, newText: string) => void;
  onOpenVoiceOverlay: () => void;
  onOpenCamModal: () => void;
}

export default function BusinessView({
  businessConfig,
  onUpdateConfig,
  isCreated,
  setIsCreated,
  messages,
  onSendMessage,
  onUpdateMessage,
  onOpenVoiceOverlay,
  onOpenCamModal
}: BusinessViewProps) {
  const [editingMsgId, setEditingMsgId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  // Form fields
  const [form, setForm] = useState<BusinessConfig>({
    name: businessConfig.name || '',
    category: businessConfig.category || '',
    description: businessConfig.description || ''
  });

  // Social connections
  const [connections, setConnections] = useState<SocialConnection[]>([
    { platform: 'whatsapp', name: 'WhatsApp', status: 'not_connected' },
    { platform: 'facebook', name: 'Facebook', status: 'not_connected' },
    { platform: 'instagram', name: 'Instagram', status: 'not_connected' }
  ]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const isFormValid =
    form.name.trim().length > 0 &&
    form.category.trim().length > 0 &&
    form.description.trim().length > 0;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    onUpdateConfig({
      ...form,
      createdAt: new Date().toISOString()
    });
    setIsCreated(true);
  };

  const toggleConnection = (index: number) => {
    setConnections(prev =>
      prev.map((c, i) => {
        if (i === index) {
          const newStatus = c.status === 'connected' ? 'not_connected' : 'connected';
          return { ...c, status: newStatus };
        }
        return c;
      })
    );
  };

  const handleSend = (text: string, attachments: ChatAttachment[]) => {
    const userMsg: ChatMessage = {
      id: 'b_usr_' + Date.now(),
      sender: 'user',
      text,
      attachments,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    onSendMessage(userMsg);

    // Business AI response simulation
    setTimeout(() => {
      const reply = generateBusinessResponse(text, businessConfig);
      const botMsg: ChatMessage = {
        id: 'b_bot_' + Date.now(),
        sender: 'assistant',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      onSendMessage(botMsg);
    }, 600);
  };

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

    setTimeout(() => {
      const reply = generateBusinessResponse(trimmed, businessConfig);
      const botMsg: ChatMessage = {
        id: 'b_bot_' + Date.now(),
        sender: 'assistant',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      onSendMessage(botMsg);
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
    if (!prompt) return;

    const reply = generateBusinessResponse(prompt, businessConfig);
    if (onUpdateMessage) {
      onUpdateMessage(aiMsgId, reply);
    } else {
      const botMsg: ChatMessage = {
        id: 'b_bot_' + Date.now(),
        sender: 'assistant',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      onSendMessage(botMsg);
    }
  };

  // State 1: Not Created (New User setup screen)
  if (!isCreated) {
    return (
      <div className="flex-1 overflow-y-auto min-h-0 bg-[#212121] p-6 flex flex-col justify-center [touch-action:pan-y_pinch-zoom] [-webkit-overflow-scrolling:touch]">
        <div className="w-full max-w-[560px] mx-auto mt-4 mb-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-full bg-[#2f2f2f] border border-white/10 flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Briefcase className="w-8 h-8 text-sky-400" />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight mb-1">
              Grow your Business with AI
            </h2>
            <p className="text-zinc-400 text-xs">
              Create AI employees that handle customers 24/7
            </p>
          </div>

          {/* Form Card */}
          <form
            onSubmit={handleCreate}
            className="bg-[#2f2f2f] border border-white/10 rounded-2xl p-6 space-y-5 shadow-2xl"
          >
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                Business Name
              </label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="Enter business name"
                className="w-full bg-[#1f1f1f] border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-zinc-500 text-sm outline-none focus:border-white/30 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                Business Categories
              </label>
              <input
                type="text"
                value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}
                placeholder="Enter business categories"
                className="w-full bg-[#1f1f1f] border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-zinc-500 text-sm outline-none focus:border-white/30 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                Business Description
              </label>
              <textarea
                rows={4}
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="Enter business description"
                className="w-full bg-[#1f1f1f] border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-zinc-500 text-sm outline-none resize-none focus:border-white/30 transition"
              />
            </div>

            <button
              type="submit"
              disabled={!isFormValid}
              className={`w-full rounded-full py-3.5 font-semibold text-sm transition-all duration-200 ${
                isFormValid
                  ? 'bg-white text-black hover:bg-zinc-200 cursor-pointer shadow-lg'
                  : 'bg-[#3f3f3f] text-zinc-500 cursor-not-allowed'
              }`}
            >
              Create your AI Employee
            </button>
          </form>
        </div>
      </div>
    );
  }

  // State 2: Created (Testing & Channel integrations)
  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#212121] relative [touch-action:pan-x_pan-y_pinch-zoom]">
      <div className="flex-1 overflow-y-auto px-4 py-6 pb-4 min-h-0 [touch-action:pan-y_pinch-zoom] [-webkit-overflow-scrolling:touch]">
        <div className="max-w-3xl mx-auto space-y-8 pb-10">
          {/* Summary Card */}
          <div className="bg-[#2f2f2f] border border-white/10 rounded-2xl p-5 shadow-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-sky-400" />
                <h3 className="text-lg font-bold text-white tracking-tight">{businessConfig.name}</h3>
                <span className="text-[11px] bg-sky-500/15 text-sky-300 border border-sky-500/30 px-2 py-0.5 rounded-full font-medium">
                  {businessConfig.category}
                </span>
              </div>
              <p className="text-xs text-zinc-400 max-w-xl line-clamp-2">
                {businessConfig.description}
              </p>
            </div>
            <button
              onClick={() => setIsCreated(false)}
              className="px-4 py-2 rounded-full border border-white/10 text-zinc-300 hover:text-white hover:bg-white/10 text-xs font-medium flex items-center gap-1.5 transition flex-shrink-0"
            >
              <Edit3 className="w-3.5 h-3.5" /> Edit Config
            </button>
          </div>

          {/* Section: Test your AI Employees */}
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Test your AI Employees</h3>
              <p className="text-xs text-zinc-400">Ask as your customer would</p>
            </div>

            {/* Chat List */}
            <div className="bg-[#1b1b1b] border border-white/10 rounded-2xl p-4 min-h-[260px] max-h-[380px] chat-scroll overflow-x-auto overflow-y-auto space-y-4">
              {messages.length === 0 ? (
                <div className="h-44 flex flex-col items-center justify-center text-center text-zinc-500 text-xs">
                  <Bot className="w-8 h-8 text-zinc-600 mb-2" />
                  <span>Your AI employee is active. Send a message to test how it answers customers.</span>
                </div>
              ) : (
                messages.map(msg => (
                  <div
                    key={msg.id}
                    className={`group relative flex gap-3 ${
                      msg.sender === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {msg.sender === 'assistant' && (
                      <div className="w-7 h-7 rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center flex-shrink-0 text-xs font-bold">
                        AI
                      </div>
                    )}
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-[#2f2f2f] text-white border border-white/10'
                          : 'bg-[#262626] text-zinc-200 border border-white/10'
                      }`}
                    >
                      {/* Message content or inline editor */}
                      {msg.sender === 'user' && editingMsgId === msg.id ? (
                        <div className="mt-1 space-y-2">
                          <textarea
                            value={editText}
                            onChange={e => setEditText(e.target.value)}
                            className="w-full bg-[#1e1e1e] border border-white/20 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-white/40 resize-none min-h-[60px] leading-relaxed"
                            rows={2}
                            autoFocus
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={handleCancelEdit}
                              className="px-2.5 py-0.5 text-[11px] text-zinc-300 hover:text-white rounded-full border border-white/10 hover:bg-white/10 transition cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSaveEdit(msg.id)}
                              className="px-3 py-0.5 text-[11px] font-semibold text-black bg-white hover:bg-zinc-200 rounded-full transition cursor-pointer shadow-xs"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="whitespace-pre-wrap">{msg.text}</p>
                          <span className="block text-[10px] text-zinc-500 text-right mt-1.5">
                            {msg.timestamp}
                          </span>
                          {msg.sender === 'user' ? (
                            <UserMessageActions
                              text={msg.text}
                              onEdit={() => handleStartEdit(msg)}
                              onRetry={() => handleRetryUserPrompt(msg.text)}
                            />
                          ) : (
                            <AiMessageActions
                              text={msg.text}
                              onRetry={() => handleRetryAiResponse(msg.id)}
                            />
                          )}
                        </>
                      )}
                    </div>
                    {msg.sender === 'user' && (
                      <div className="w-7 h-7 rounded-full bg-zinc-700 text-white flex items-center justify-center flex-shrink-0 text-xs">
                        <User className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Section: Connect with your profile */}
          <div className="border-t border-white/10 pt-6 space-y-4">
            <h3 className="text-base font-bold text-white tracking-tight">Connect with your profile</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* WhatsApp Card */}
              <div className="bg-[#2f2f2f] border border-white/10 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                      <MessageCircle className="w-5 h-5 fill-emerald-400/20" />
                    </div>
                    <span className="font-semibold text-white text-sm">WhatsApp</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs">
                  {connections[0].status === 'connected' ? (
                    <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" /> Connected
                    </span>
                  ) : (
                    <span className="text-zinc-400">Not connected</span>
                  )}
                </div>

                <button
                  onClick={() => toggleConnection(0)}
                  className={`w-full py-2 rounded-full border text-xs font-semibold transition ${
                    connections[0].status === 'connected'
                      ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20'
                      : 'border-white/15 text-white hover:bg-white/10'
                  }`}
                >
                  {connections[0].status === 'connected' ? 'Disconnect' : 'Connect'}
                </button>
              </div>

              {/* Facebook Card */}
              <div className="bg-[#2f2f2f] border border-white/10 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/20 flex items-center justify-center text-blue-400">
                      <Share2 className="w-5 h-5" />
                    </div>
                    <span className="font-semibold text-white text-sm">Facebook</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs">
                  {connections[1].status === 'connected' ? (
                    <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" /> Connected
                    </span>
                  ) : (
                    <span className="text-zinc-400">Not connected</span>
                  )}
                </div>

                <button
                  onClick={() => toggleConnection(1)}
                  className={`w-full py-2 rounded-full border text-xs font-semibold transition ${
                    connections[1].status === 'connected'
                      ? 'border-blue-500/30 bg-blue-500/10 text-blue-300 hover:bg-blue-500/20'
                      : 'border-white/15 text-white hover:bg-white/10'
                  }`}
                >
                  {connections[1].status === 'connected' ? 'Disconnect' : 'Connect'}
                </button>
              </div>

              {/* Instagram Card */}
              <div className="bg-[#2f2f2f] border border-white/10 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500/20 via-pink-500/20 to-purple-500/20 border border-pink-500/20 flex items-center justify-center text-pink-400">
                      <span className="font-bold text-sm">IG</span>
                    </div>
                    <span className="font-semibold text-white text-sm">Instagram</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs">
                  {connections[2].status === 'connected' ? (
                    <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" /> Connected
                    </span>
                  ) : (
                    <span className="text-zinc-400">Not connected</span>
                  )}
                </div>

                <button
                  onClick={() => toggleConnection(2)}
                  className={`w-full py-2 rounded-full border text-xs font-semibold transition ${
                    connections[2].status === 'connected'
                      ? 'border-pink-500/30 bg-pink-500/10 text-pink-300 hover:bg-pink-500/20'
                      : 'border-white/15 text-white hover:bg-white/10'
                  }`}
                >
                  {connections[2].status === 'connected' ? 'Disconnect' : 'Connect'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Same Bottom Input Bar for test chat */}
      <BottomInputBar
        onSendMessage={handleSend}
        onOpenVoiceOverlay={onOpenVoiceOverlay}
        onOpenCamModal={onOpenCamModal}
        placeholder="Ask anything"
      />
    </div>
  );
}
