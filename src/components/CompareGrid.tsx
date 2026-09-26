import React, { useState } from 'react';
import { Columns, Copy, Check, Sparkles } from 'lucide-react';
import { CompareModel } from '../types';

export const AI_COMPARE_MODELS: CompareModel[] = [
  { id: 'chatgpt', name: 'ChatGPT', color: '#10a37f', badge: 'GPT-4o' },
  { id: 'meta', name: 'Meta AI', color: '#0081FB', badge: 'Llama 3.3' },
  { id: 'groq', name: 'Groq', color: '#F55036', badge: '⚡ 840 T/s' },
  { id: 'gemini', name: 'Gemini', color: '#8E75FF', badge: 'Flash 2.5' },
  { id: 'claude', name: 'Claude', color: '#D4A574', badge: 'Sonnet 3.7' },
];

interface CompareGridProps {
  currentPrompt: string | null;
  responses: Record<string, string> | null;
}

export default function CompareGrid({ currentPrompt, responses }: CompareGridProps) {
  const [copiedModel, setCopiedModel] = useState<string | null>(null);

  const handleCopy = (modelId: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedModel(modelId);
    setTimeout(() => setCopiedModel(null), 2000);
  };

  if (!responses || !currentPrompt) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-8 max-w-lg mx-auto select-none">
        <div className="w-16 h-16 rounded-full bg-[#2f2f2f] border border-white/10 flex items-center justify-center mb-4 shadow-lg">
          <Columns className="w-8 h-8 text-sky-400" />
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight mb-2">Compare AI Models</h2>
        <p className="text-zinc-400 text-sm leading-relaxed max-w-md">
          Ask a question below to compare responses across ChatGPT, Meta AI, Groq, Gemini, and Claude side-by-side in real-time.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-4 space-y-4">
      {/* Current Query Banner */}
      <div className="bg-[#2a2a2a] border border-white/10 rounded-xl px-4 py-3 flex items-center gap-2.5">
        <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Prompt:</span>
        <span className="text-sm font-medium text-white truncate">{currentPrompt}</span>
      </div>

      {/* Grid with 5 model cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {AI_COMPARE_MODELS.map(model => {
          const responseText = responses[model.id] || 'Generating response...';
          const isCopied = copiedModel === model.id;

          return (
            <div
              key={model.id}
              className="bg-[#2f2f2f] border border-white/10 rounded-2xl p-4 min-h-[220px] flex flex-col justify-between shadow-lg transition hover:border-white/20"
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-xs"
                      style={{ backgroundColor: model.color }}
                    >
                      {model.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white leading-tight">{model.name}</h4>
                      <span className="text-[10px] text-zinc-400 font-mono">{model.badge}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleCopy(model.id, responseText)}
                    className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition"
                    title="Copy response"
                  >
                    {isCopied ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                {/* Content */}
                <div className="text-xs text-zinc-200 leading-relaxed whitespace-pre-wrap">
                  {responseText}
                </div>
              </div>

              {/* Footer status */}
              <div className="pt-3 border-t border-white/5 mt-4 flex items-center justify-between text-[11px] text-zinc-500">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: model.color }} />
                  Completed
                </span>
                <span className="font-mono text-[10px] text-zinc-500">AI Fiesta Mode</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
