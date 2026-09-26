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
    <div className="flex items-center justify-end gap-2 mt-2 opacity-80 md:opacity-0 md:group-hover:opacity-100 transition-opacity select-none">
      {/* Copy button */}
      <button
        type="button"
        onClick={handleCopy}
        className="bg-transparent border border-white/10 rounded-full px-2.5 py-1 text-xs text-zinc-400 hover:text-white hover:bg-[#2f2f2f] transition flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
        title={copied ? 'Copied to clipboard' : 'Copy'}
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[11px] text-emerald-400 font-medium">Copied</span>
          </>
        ) : (
          <>
            <Copy className="w-3.5 h-3.5" />
            <span className="text-[11px]">Copy</span>
          </>
        )}
      </button>

      {/* Edit button */}
      <button
        type="button"
        onClick={onEdit}
        className="bg-transparent border border-white/10 rounded-full px-2.5 py-1 text-xs text-zinc-400 hover:text-white hover:bg-[#2f2f2f] transition flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
        title="Edit message"
      >
        <Pencil className="w-3.5 h-3.5" />
        <span className="text-[11px]">Edit</span>
      </button>

      {/* Retry button */}
      <button
        type="button"
        onClick={onRetry}
        className="bg-transparent border border-white/10 rounded-full px-2.5 py-1 text-xs text-zinc-400 hover:text-white hover:bg-[#2f2f2f] transition flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
        title="Retry prompt"
      >
        <RefreshCw className="w-3.5 h-3.5" />
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
    <div className="flex flex-wrap items-center justify-start gap-2 mt-3 opacity-80 md:opacity-0 md:group-hover:opacity-100 transition-opacity select-none">
      {/* Copy button */}
      <button
        type="button"
        onClick={handleCopy}
        className="bg-transparent border border-white/10 rounded-full px-2.5 py-1 text-xs text-zinc-400 hover:text-white hover:bg-[#2f2f2f] transition flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
        title={copied ? 'Copied' : 'Copy answer'}
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[11px] text-emerald-400 font-medium">Copied</span>
          </>
        ) : (
          <>
            <Copy className="w-3.5 h-3.5" />
            <span className="text-[11px]">Copy</span>
          </>
        )}
      </button>

      {/* Read Aloud button */}
      <button
        type="button"
        onClick={handleSpeak}
        className={`bg-transparent border border-white/10 rounded-full px-2.5 py-1 text-xs transition flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 ${
          isSpeaking
            ? 'text-sky-400 bg-sky-500/10 border-sky-500/30'
            : 'text-zinc-400 hover:text-white hover:bg-[#2f2f2f]'
        }`}
        title={isSpeaking ? 'Stop reading' : 'Read aloud'}
      >
        {isSpeaking ? (
          <>
            <Square className="w-3.5 h-3.5 fill-sky-400 text-sky-400" />
            <span className="text-[11px] text-sky-400 font-medium">Stop</span>
          </>
        ) : (
          <>
            <Volume2 className="w-3.5 h-3.5" />
            <span className="text-[11px]">Read</span>
          </>
        )}
      </button>

      {/* Retry / Regenerate button */}
      <button
        type="button"
        onClick={onRetry}
        className="bg-transparent border border-white/10 rounded-full px-2.5 py-1 text-xs text-zinc-400 hover:text-white hover:bg-[#2f2f2f] transition flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
        title="Regenerate response"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        <span className="text-[11px]">Retry</span>
      </button>

      {/* Download button */}
      <button
        type="button"
        onClick={handleDownload}
        className="bg-transparent border border-white/10 rounded-full px-2.5 py-1 text-xs text-zinc-400 hover:text-white hover:bg-[#2f2f2f] transition flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
        title="Download response as .txt"
      >
        <Download className="w-3.5 h-3.5" />
        <span className="text-[11px]">Download</span>
      </button>

      {/* Thumbs up */}
      <button
        type="button"
        onClick={handleLike}
        className={`p-1.5 rounded-full border border-white/10 transition cursor-pointer active:scale-95 ${
          liked === true
            ? 'text-emerald-400 bg-emerald-500/20 border-emerald-500/40'
            : 'text-zinc-400 hover:text-white hover:bg-[#2f2f2f]'
        }`}
        title="Good response"
      >
        <ThumbsUp className="w-3.5 h-3.5" />
      </button>

      {/* Thumbs down */}
      <button
        type="button"
        onClick={handleDislike}
        className={`p-1.5 rounded-full border border-white/10 transition cursor-pointer active:scale-95 ${
          liked === false
            ? 'text-red-400 bg-red-500/20 border-red-500/40'
            : 'text-zinc-400 hover:text-white hover:bg-[#2f2f2f]'
        }`}
        title="Bad response"
      >
        <ThumbsDown className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
