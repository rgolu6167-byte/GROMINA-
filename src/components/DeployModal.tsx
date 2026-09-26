import React, { useState } from 'react';
import { Rocket, X, Copy, Check, ExternalLink, Globe, ShieldCheck } from 'lucide-react';

interface DeployModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectName?: string;
}

export default function DeployModal({ isOpen, onClose, projectName = 'gromina-app' }: DeployModalProps) {
  const [copied, setCopied] = useState(false);
  const liveUrl = `https://${projectName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-live.gromina.app`;

  const handleCopy = () => {
    navigator.clipboard.writeText(liveUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#2f2f2f] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Rocket className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-base">Project Deployed</h3>
              <p className="text-xs text-zinc-400">Live on Global Edge CDN</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 text-zinc-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="bg-[#1f1f1f] border border-white/10 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-400 font-medium flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-sky-400" /> Production URL
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Active
              </span>
            </div>

            <div className="flex items-center justify-between bg-[#141414] border border-white/5 rounded-lg px-3 py-2">
              <span className="text-xs text-white font-mono truncate mr-2">{liveUrl}</span>
              <button
                onClick={handleCopy}
                className="p-1.5 rounded hover:bg-white/10 text-zinc-300 hover:text-white transition flex-shrink-0"
                title="Copy URL"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2 text-xs text-zinc-400 bg-[#252525] p-3 rounded-xl border border-white/5">
            <div className="flex items-center justify-between py-1">
              <span>SSL / HTTPS</span>
              <span className="text-emerald-400 flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5" /> Enforced</span>
            </div>
            <div className="flex items-center justify-between py-1 border-t border-white/5">
              <span>Edge Locations</span>
              <span className="text-zinc-200">300+ Cities</span>
            </div>
            <div className="flex items-center justify-between py-1 border-t border-white/5">
              <span>Latency</span>
              <span className="text-emerald-400">&lt; 18ms</span>
            </div>
          </div>
        </div>

        <div className="p-4 bg-[#262626] border-t border-white/10 flex items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-full border border-white/10 text-zinc-300 hover:text-white hover:bg-white/10 text-xs font-medium transition"
          >
            Close
          </button>
          <button
            onClick={() => {
              window.open(liveUrl, '_blank');
              onClose();
            }}
            className="px-5 py-2 rounded-full bg-white text-black text-xs font-semibold hover:bg-zinc-200 transition flex items-center gap-1.5"
          >
            Open Live App <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
