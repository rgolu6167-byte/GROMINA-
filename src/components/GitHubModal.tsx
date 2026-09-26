import React, { useState } from 'react';
import { Github, X, GitBranch, Check, ExternalLink } from 'lucide-react';

interface GitHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectName?: string;
}

export default function GitHubModal({ isOpen, onClose, projectName = 'gromina-project' }: GitHubModalProps) {
  const [repoName, setRepoName] = useState(projectName.toLowerCase().replace(/\s+/g, '-'));
  const [branch, setBranch] = useState('main');
  const [isPrivate, setIsPrivate] = useState(false);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleConnect = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setConnected(true);
    }, 900);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#2f2f2f] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white">
              <Github className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-base">GitHub Connect</h3>
              <p className="text-xs text-zinc-400">Sync & push changes automatically</p>
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
          {connected ? (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                <Check className="w-5 h-5" />
              </div>
              <p className="font-medium text-emerald-300 text-sm">Repository Connected Successfully!</p>
              <p className="text-xs text-zinc-400 font-mono">github.com/developer/{repoName}</p>
              <div className="pt-2">
                <a
                  href={`https://github.com`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-white hover:underline font-medium"
                >
                  View on GitHub <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">Repository Name</label>
                <div className="flex items-center bg-[#1f1f1f] border border-white/10 rounded-xl px-3 py-2.5">
                  <span className="text-xs text-zinc-500 mr-1 font-mono">github.com/user/</span>
                  <input
                    type="text"
                    value={repoName}
                    onChange={e => setRepoName(e.target.value)}
                    className="bg-transparent border-none outline-none text-white text-xs font-mono flex-1"
                    placeholder="repository-name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">Target Branch</label>
                <div className="flex items-center gap-2 bg-[#1f1f1f] border border-white/10 rounded-xl px-3 py-2.5">
                  <GitBranch className="w-4 h-4 text-zinc-400" />
                  <input
                    type="text"
                    value={branch}
                    onChange={e => setBranch(e.target.value)}
                    className="bg-transparent border-none outline-none text-white text-xs font-mono flex-1"
                    placeholder="main"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-[#242424] rounded-xl border border-white/5">
                <div>
                  <p className="text-xs font-medium text-white">Private Repository</p>
                  <p className="text-[11px] text-zinc-400">Only authorized team members can view</p>
                </div>
                <input
                  type="checkbox"
                  checked={isPrivate}
                  onChange={e => setIsPrivate(e.target.checked)}
                  className="w-4 h-4 accent-white rounded"
                />
              </div>
            </>
          )}
        </div>

        <div className="p-4 bg-[#262626] border-t border-white/10 flex items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-full border border-white/10 text-zinc-300 hover:text-white hover:bg-white/10 text-xs font-medium transition"
          >
            {connected ? 'Done' : 'Cancel'}
          </button>
          {!connected && (
            <button
              onClick={handleConnect}
              disabled={loading || !repoName.trim()}
              className="px-5 py-2 rounded-full bg-white text-black text-xs font-semibold hover:bg-zinc-200 transition disabled:opacity-50"
            >
              {loading ? 'Connecting...' : 'Connect to GitHub'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
