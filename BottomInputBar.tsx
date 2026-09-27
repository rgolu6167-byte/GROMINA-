import React, { useState, useRef, useEffect } from 'react';
import {
  Plus,
  Mic,
  MicOff,
  AudioLines,
  ArrowUp,
  FileText,
  Image as ImageIcon,
  Camera,
  X
} from 'lucide-react';
import { ChatAttachment } from '../types';

interface BottomInputBarProps {
  onSendMessage: (text: string, attachments: ChatAttachment[]) => void;
  onOpenVoiceOverlay: () => void;
  onOpenCamModal: () => void;
  placeholder?: string;
  disabled?: boolean;
}

export default function BottomInputBar({
  onSendMessage,
  onOpenVoiceOverlay,
  onOpenCamModal,
  placeholder = 'Ask anything',
  disabled = false
}: BottomInputBarProps) {
  const [text, setText] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [attachments, setAttachments] = useState<ChatAttachment[]>([]);
  const [isListening, setIsListening] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const photoInputRef = useRef<HTMLInputElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const recognitionRef = useRef<any>(null);

  // Dynamic typing state like ChatGPT
  const isTyping = text.trim().length > 0;
  const canSend = (text.trim().length > 0 || attachments.length > 0) && !disabled;

  // Close plus menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  // Auto-resize textarea min 24px max 120px
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '24px';
      const scrollH = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(Math.max(scrollH, 24), 120)}px`;
    }
  }, [text]);

  // Speech Recognition setup
  const toggleListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported by your browser.');
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setText(prev => {
          const space = prev && !prev.endsWith(' ') ? ' ' : '';
          return prev + space + transcript;
        });
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.warn('Speech recognition error:', e);
      setIsListening(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'file' | 'image') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const readableSize = file.size > 1024 * 1024
      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
      : `${Math.round(file.size / 1024)} KB`;

    if (type === 'image') {
      const reader = new FileReader();
      reader.onload = () => {
        setAttachments(prev => [
          ...prev,
          {
            id: 'att_' + Date.now(),
            name: file.name,
            size: readableSize,
            type: 'image',
            url: reader.result as string
          }
        ]);
      };
      reader.readAsDataURL(file);
    } else {
      setAttachments(prev => [
        ...prev,
        {
          id: 'att_' + Date.now(),
          name: file.name,
          size: readableSize,
          type: 'file'
        }
      ]);
    }

    // Reset input
    e.target.value = '';
    setIsMenuOpen(false);
  };

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(a => a.id !== id));
  };

  const handleSend = () => {
    if (disabled) return;
    if (!text.trim() && attachments.length === 0) return;

    onSendMessage(text.trim(), attachments);
    // After message send, clear input, set isTyping false, show all mic voice send again
    setText('');
    setAttachments([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = '24px';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      className="max-w-3xl mx-auto p-3 bg-[#212121] z-20 w-full shrink-0 [touch-action:manipulation]"
    >
      {/* File chips above bar */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2 px-1">
          {attachments.map(att => (
            <div
              key={att.id}
              className="flex items-center gap-2 bg-[#2f2f2f] border border-white/10 rounded-xl px-2.5 py-1.5 shadow-sm text-xs text-zinc-200"
            >
              {att.type === 'image' && att.url ? (
                <img src={att.url} alt={att.name} className="w-5 h-5 rounded object-cover" />
              ) : (
                <FileText className="w-4 h-4 text-sky-400" />
              )}
              <span className="max-w-[140px] truncate">{att.name}</span>
              {att.size && <span className="text-[10px] text-zinc-500">({att.size})</span>}
              <button
                type="button"
                onClick={() => removeAttachment(att.id)}
                className="w-4 h-4 rounded-full flex items-center justify-center hover:bg-white/10 text-zinc-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Inner Input Box */}
      <div className="bg-[#2f2f2f] border border-white/10 rounded-2xl px-3 py-2 flex items-end gap-2 w-full shadow-lg relative">
        {/* Left: Plus button with popup menu - always visible */}
        <div className="relative flex-shrink-0" ref={menuRef}>
          <button
            type="button"
            onClick={() => setIsMenuOpen(prev => !prev)}
            className="w-[36px] h-[36px] rounded-full hover:bg-white/10 flex items-center justify-center text-zinc-300 hover:text-white transition cursor-pointer"
            title="Attach file or photo"
          >
            <Plus className={`w-5 h-5 transition-transform duration-200 ${isMenuOpen ? 'rotate-45' : ''}`} />
          </button>

          {/* Plus popup menu */}
          {isMenuOpen && (
            <div className="absolute bottom-full left-0 mb-2 bg-[#2f2f2f] border border-white/10 rounded-2xl p-2 w-[220px] shadow-2xl z-30 space-y-1 animate-in fade-in slide-in-from-bottom-2 duration-150">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center gap-3 px-3 py-2 text-left text-sm text-zinc-200 hover:text-white hover:bg-white/10 rounded-xl transition cursor-pointer"
              >
                <FileText className="w-4 h-4 text-sky-400" />
                <span>Upload file</span>
              </button>
              <button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                className="w-full flex items-center gap-3 px-3 py-2 text-left text-sm text-zinc-200 hover:text-white hover:bg-white/10 rounded-xl transition cursor-pointer"
              >
                <ImageIcon className="w-4 h-4 text-emerald-400" />
                <span>Upload photo</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  onOpenCamModal();
                }}
                className="w-full flex items-center gap-3 px-3 py-2 text-left text-sm text-zinc-200 hover:text-white hover:bg-white/10 rounded-xl transition cursor-pointer"
              >
                <Camera className="w-4 h-4 text-amber-400" />
                <span>Take photo</span>
              </button>
            </div>
          )}

          {/* Hidden inputs */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={e => handleFileUpload(e, 'file')}
            className="hidden"
          />
          <input
            type="file"
            ref={photoInputRef}
            accept="image/*"
            onChange={e => handleFileUpload(e, 'image')}
            className="hidden"
          />
        </div>

        {/* Center: Auto-resizing textarea */}
        <div className="flex-1 pb-1">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            rows={1}
            disabled={disabled}
            className="w-full min-h-[24px] max-h-[120px] overflow-y-auto bg-transparent border-0 outline-none resize-none text-white text-sm placeholder:text-zinc-500 leading-6 px-1 scrollbar-none [touch-action:manipulation]"
          />
        </div>

        {/* Right side dynamic action area: ChatGPT style */}
        <div className="flex items-center flex-shrink-0 transition-all duration-200 ease-in-out">
          {isTyping ? (
            /* When isTyping true: hide mic & voice buttons, show ONLY send button */
            <button
              type="button"
              onClick={handleSend}
              disabled={disabled}
              className="w-[34px] h-[34px] rounded-full bg-white text-black hover:bg-zinc-200 flex items-center justify-center transition-all duration-150 cursor-pointer shadow-md active:scale-95 flex-shrink-0"
              title="Send message"
            >
              <ArrowUp className="w-4 h-4 text-black stroke-[2.5]" />
            </button>
          ) : (
            /* When isTyping false (empty): show 3 icons on right: mic, voice, send. Gap 8px (gap-2) */
            <div className="flex items-center gap-2 transition-all duration-200">
              {/* Mic button */}
              <button
                type="button"
                onClick={toggleListening}
                className={`w-[34px] h-[34px] rounded-full flex items-center justify-center transition cursor-pointer ${
                  isListening
                    ? 'bg-red-500/20 text-red-400 ring-2 ring-red-500/50 animate-pulse'
                    : 'hover:bg-white/10 text-zinc-300 hover:text-white'
                }`}
                title={isListening ? 'Listening... click to stop' : 'Use voice input'}
              >
                {isListening ? <MicOff className="w-4 h-4 text-red-400" /> : <Mic className="w-4 h-4" />}
              </button>

              {/* Voice button icon AudioLines */}
              <button
                type="button"
                onClick={onOpenVoiceOverlay}
                className="w-[34px] h-[34px] rounded-full hover:bg-white/10 flex items-center justify-center text-zinc-300 hover:text-white transition cursor-pointer"
                title="Voice mode"
              >
                <AudioLines className="w-4 h-4 text-sky-400" />
              </button>

              {/* Send button icon ArrowUp in circle bg white text black */}
              <button
                type="button"
                onClick={handleSend}
                disabled={!canSend}
                className={`w-[34px] h-[34px] rounded-full flex items-center justify-center transition-all duration-150 ${
                  canSend
                    ? 'bg-white text-black hover:bg-zinc-200 cursor-pointer shadow-sm active:scale-95'
                    : 'bg-white text-black opacity-35 cursor-not-allowed'
                }`}
                title="Send message"
              >
                <ArrowUp className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
