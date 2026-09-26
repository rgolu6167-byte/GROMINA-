import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, X } from 'lucide-react';

interface VoiceOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onSpeechTranscribed: (text: string) => void;
  initialSpeakingText?: string;
}

export default function VoiceOverlay({
  isOpen,
  onClose,
  onSpeechTranscribed,
  initialSpeakingText
}: VoiceOverlayProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [status, setStatus] = useState<'idle' | 'listening' | 'speaking'>('idle');
  const [hasSpeechSupport, setHasSpeechSupport] = useState(true);

  // Auto handle voice overlay when opened
  useEffect(() => {
    if (!isOpen) {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsListening(false);
      setTranscript('');
      setStatus('idle');
      return;
    }

    if (initialSpeakingText) {
      speakAloud(initialSpeakingText);
    } else {
      startListening();
    }

    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isOpen, initialSpeakingText]);

  const speakAloud = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    // Clean markdown symbols for speech
    const cleanSpeech = text
      .replace(/[#*`_~[\]]/g, '')
      .replace(/https?:\/\/\S+/g, '')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanSpeech);
    utterance.rate = 1.0;
    utterance.pitch = 1.05;

    // Pick best English voice if available
    const voices = window.speechSynthesis.getVoices();
    const naturalVoice = voices.find(v => v.lang.includes('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha')));
    if (naturalVoice) {
      utterance.voice = naturalVoice;
    }

    setStatus('speaking');
    utterance.onend = () => {
      setStatus('idle');
      startListening();
    };
    utterance.onerror = () => {
      setStatus('idle');
    };

    window.speechSynthesis.speak(utterance);
  };

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setHasSpeechSupport(false);
      setStatus('idle');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setStatus('listening');
        setTranscript('');
      };

      recognition.onresult = (event: any) => {
        const current = event.resultIndex;
        const text = event.results[current][0].transcript;
        setTranscript(text);
      };

      recognition.onend = () => {
        setIsListening(false);
        setStatus('idle');
      };

      recognition.onerror = (e: any) => {
        console.warn('Speech recognition error:', e);
        setIsListening(false);
        setStatus('idle');
      };

      recognition.start();
    } catch (e) {
      console.warn('Speech recognition start failed:', e);
      setIsListening(false);
      setStatus('idle');
    }
  };

  const handleSendTranscript = () => {
    if (transcript.trim()) {
      onSpeechTranscribed(transcript.trim());
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#171717]/95 backdrop-blur-md flex flex-col items-center justify-between p-8 text-white select-none">
      {/* Top Header */}
      <div className="w-full max-w-xl flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-sm font-medium tracking-wide text-zinc-300">Gromina Voice Mode</span>
        </div>
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-zinc-300 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Center Animated Orb */}
      <div className="flex flex-col items-center justify-center my-auto relative">
        {/* Glow rings */}
        <div
          className={`absolute w-72 h-72 rounded-full transition-all duration-700 blur-2xl ${
            status === 'listening'
              ? 'bg-gradient-to-r from-sky-500/40 via-indigo-500/30 to-purple-500/40 scale-125 animate-pulse'
              : status === 'speaking'
              ? 'bg-gradient-to-r from-emerald-500/40 via-teal-500/30 to-cyan-500/40 scale-125 animate-pulse'
              : 'bg-white/10 scale-90'
          }`}
        />

        {/* Central Orb */}
        <div
          className={`relative w-48 h-48 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 ${
            status === 'listening'
              ? 'bg-gradient-to-tr from-sky-600 via-indigo-500 to-purple-600 scale-105 shadow-sky-500/30 ring-4 ring-sky-400/40'
              : status === 'speaking'
              ? 'bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-600 scale-105 shadow-emerald-500/30 ring-4 ring-emerald-400/40'
              : 'bg-[#2a2a2a] ring-1 ring-white/15'
          }`}
        >
          {status === 'speaking' ? (
            <Volume2 className="w-16 h-16 text-white animate-bounce" />
          ) : (
            <Mic className={`w-16 h-16 ${status === 'listening' ? 'text-white' : 'text-zinc-400'}`} />
          )}

          {/* Sound waves visualization simulation */}
          {(status === 'listening' || status === 'speaking') && (
            <div className="absolute -bottom-8 flex items-center gap-1.5 h-6">
              <span className="w-1 bg-white rounded-full animate-bounce h-3" style={{ animationDelay: '0ms' }} />
              <span className="w-1 bg-white rounded-full animate-bounce h-6" style={{ animationDelay: '150ms' }} />
              <span className="w-1 bg-white rounded-full animate-bounce h-4" style={{ animationDelay: '300ms' }} />
              <span className="w-1 bg-white rounded-full animate-bounce h-7" style={{ animationDelay: '75ms' }} />
              <span className="w-1 bg-white rounded-full animate-bounce h-5" style={{ animationDelay: '220ms' }} />
            </div>
          )}
        </div>

        {/* Status text */}
        <div className="mt-12 text-center max-w-md">
          <p className="text-xl font-medium tracking-tight text-white mb-2">
            {status === 'listening'
              ? 'Listening...'
              : status === 'speaking'
              ? 'Gromina is speaking...'
              : 'Tap to speak'}
          </p>
          <p className="text-sm text-zinc-400 min-h-[48px] px-4 font-normal">
            {transcript ? `"${transcript}"` : status === 'listening' ? 'Speak naturally in English, Hindi, or Hinglish' : ''}
          </p>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="w-full max-w-md flex items-center justify-center gap-4">
        {status === 'listening' ? (
          <button
            onClick={() => {
              setIsListening(false);
              setStatus('idle');
            }}
            className="px-6 py-3 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30 flex items-center gap-2 text-sm font-semibold transition"
          >
            <MicOff className="w-4 h-4" /> Stop Listening
          </button>
        ) : (
          <button
            onClick={startListening}
            className="px-6 py-3 rounded-full bg-white text-black hover:bg-zinc-200 flex items-center gap-2 text-sm font-semibold transition shadow-lg"
          >
            <Mic className="w-4 h-4" /> Start Speaking
          </button>
        )}

        {transcript && (
          <button
            onClick={handleSendTranscript}
            className="px-6 py-3 rounded-full bg-sky-500 hover:bg-sky-400 text-black font-semibold text-sm transition"
          >
            Send Question
          </button>
        )}
      </div>
    </div>
  );
}
