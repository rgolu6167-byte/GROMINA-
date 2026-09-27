import React, { useState, useEffect } from 'react';
import {
  Copy,
  Check,
  Pencil,
  RefreshCw,
  Volume2,
  Square,
  Download,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';

interface UserMessageActionsProps {
  text: string;
  onEdit: () => void;
  onRetry: () => void;
}

export function UserMessageActions({ text, onEdit, onRetry }: UserMessageActionsProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex items-center justify-end gap-1.5 mt-1.5 select-none">
      {/* Copy button */}
      <button
        type="button"
        onClick={handleCopy}
        className="px-2 py-1 rounded-full bg-[#2f2f2f] border border-white/10 text-xs text-zinc-400 hover:text-white hover:bg-[#3a3a3a] transition flex items-center gap-1 cursor-pointer shadow-xs active:scale-95"
        title={copied ? 'Copied' : 'Copy'}
      >
        {copied ? (
          <>
            <Check className="w-3 h-3 text-emerald-400" />
            <span className="text-[11px] text-emerald-400 font-medium">Copied</span>
          </>
        ) : (
          <>
            <Copy className="w-3 h-3" />
            <span className="text-[11px]">Copy</span>
          </>
        )}
      </button>

      {/* Edit button */}
      <button
        type="button"
        onClick={onEdit}
        className="px-2 py-1 rounded-full bg-[#2f2f2f] border border-white/10 text-xs text-zinc-400 hover:text-white hover:bg-[#3a3a3a] transition flex items-center gap-1 cursor-pointer shadow-xs active:scale-95"
        title="Edit message"
      >
        <Pencil className="w-3 h-3" />
        <span className="text-[11px]">Edit</span>
      </button>

      {/* Retry button */}
      <button
        type="button"
        onClick={onRetry}
        className="px-2 py-1 rounded-full bg-[#2f2f2f] border border-white/10 text-xs text-zinc-400 hover:text-white hover:bg-[#3a3a3a] transition flex items-center gap-1 cursor-pointer shadow-xs active:scale-95"
        title="Retry prompt"
      >
        <RefreshCw className="w-3 h-3" />
        <span className="text-[11px]">Retry</span>
      </button>
    </div>
  );
}

interface AiMessageActionsProps {
  text: string;
  onRetry: () => void;
}

export function AiMessageActions({ text, onRetry }: AiMessageActionsProps) {
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [liked, setLiked] = useState<boolean | null>(null);

  // Stop speaking on unmount
  useEffect(() => {
    return () => {
      if (isSpeaking && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isSpeaking]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSpeak = () => {
    if (!('speechSynthesis' in window)) {
      alert('Text-to-speech is not supported in this browser.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();

    // Clean markdown characters for spoken audio
    const cleanText = text
      .replace(/[#*`_~[\]]/g, '')
      .replace(/https?:\/\/\S+/g, '')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
    };

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleDownload = () => {
    try {
      const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'gromina-response.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Failed to download response', e);
    }
  };

  const handleLike = () => {
    setLiked(prev => (prev === true ? null : true));
  };

  const handleDislike = () => {
    setLiked(prev => (prev === false ? null : false));
  };

  return (
    <div className="flex items-center justify-start gap-1.5 mt-2 flex-wrap select-none">
      {/* Copy button */}
      <button
        type="button"
        onClick={handleCopy}
        className="w-7 h-7 rounded-full bg-[#2f2f2f] border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 flex items-center justify-center transition cursor-pointer shadow-xs active:scale-95"
        title={copied ? 'Copied' : 'Copy answer'}
      >
        {copied ? (
          <Check className="w-3.5 h-3.5 text-emerald-400" />
        ) : (
          <Copy className="w-3.5 h-3.5" />
        )}
      </button>

      {/* Read Aloud button */}
      <button
        type="button"
        onClick={handleSpeak}
        className={`w-7 h-7 rounded-full bg-[#2f2f2f] border border-white/10 flex items-center justify-center transition cursor-pointer shadow-xs active:scale-95 ${
          isSpeaking
            ? 'text-sky-400 bg-sky-500/20 border-sky-500/40'
            : 'text-zinc-400 hover:text-white hover:bg-white/10'
        }`}
        title={isSpeaking ? 'Stop reading' : 'Read aloud'}
      >
        {isSpeaking ? (
          <Square className="w-3 h-3 fill-sky-400 text-sky-400" />
        ) : (
          <Volume2 className="w-3.5 h-3.5" />
        )}
      </button>

      {/* Retry / Regenerate button */}
      <button
        type="button"
        onClick={onRetry}
        className="w-7 h-7 rounded-full bg-[#2f2f2f] border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 flex items-center justify-center transition cursor-pointer shadow-xs active:scale-95"
        title="Regenerate response"
      >
        <RefreshCw className="w-3.5 h-3.5" />
      </button>

      {/* Download button */}
      <button
        type="button"
        onClick={handleDownload}
        className="w-7 h-7 rounded-full bg-[#2f2f2f] border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 flex items-center justify-center transition cursor-pointer shadow-xs active:scale-95"
        title="Download response as .txt"
      >
        <Download className="w-3.5 h-3.5" />
      </button>

      {/* Thumbs up */}
      <button
        type="button"
        onClick={handleLike}
        className={`w-7 h-7 rounded-full border border-white/10 flex items-center justify-center transition cursor-pointer active:scale-95 ${
          liked === true
            ? 'text-emerald-400 bg-emerald-500/20 border-emerald-500/40'
            : 'bg-[#2f2f2f] text-zinc-400 hover:text-white hover:bg-white/10'
        }`}
        title="Good response"
      >
        <ThumbsUp className="w-3.5 h-3.5" />
      </button>

      {/* Thumbs down */}
      <button
        type="button"
        onClick={handleDislike}
        className={`w-7 h-7 rounded-full border border-white/10 flex items-center justify-center transition cursor-pointer active:scale-95 ${
          liked === false
            ? 'text-red-400 bg-red-500/20 border-red-500/40'
            : 'bg-[#2f2f2f] text-zinc-400 hover:text-white hover:bg-white/10'
        }`}
        title="Bad response"
      >
        <ThumbsDown className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
