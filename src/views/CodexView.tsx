import React, { useState, useRef, useEffect } from 'react';
import {
  Code2,
  Play,
  Rocket,
  FileCode,
  FileText,
  Terminal as TerminalIcon,
  Eye,
  CheckCircle,
  Check,
  Copy,
  Smartphone,
  Monitor,
  Loader2,
  Bot,
  User,
  Sparkles
} from 'lucide-react';
import { CodexFile, ChatMessage, ChatAttachment } from '../types';
import BottomInputBar from '../components/BottomInputBar';
import { generateCodexFiles } from '../utils/aiGenerators';
import GitHubModal from '../components/GitHubModal';
import DeployModal from '../components/DeployModal';
import { UserMessageActions, AiMessageActions } from '../components/MessageActions';

interface CodexViewProps {
  messages: ChatMessage[];
  onSendMessage: (msg: ChatMessage) => void;
  onUpdateMessage?: (msgId: string, newText: string) => void;
  onOpenVoiceOverlay: () => void;
  onOpenCamModal: () => void;
}

export default function CodexView({
  messages,
  onSendMessage,
  onUpdateMessage,
  onOpenVoiceOverlay,
  onOpenCamModal
}: CodexViewProps) {
  const [files, setFiles] = useState<CodexFile[]>([]);
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isBuilt, setIsBuilt] = useState(false);
  const [editingMsgId, setEditingMsgId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  // Right panel states
  const [activeTab, setActiveTab] = useState<'code' | 'preview' | 'terminal'>('code');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Modals
  const [isGithubOpen, setIsGithubOpen] = useState(false);
  const [isDeployOpen, setIsDeployOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendPrompt = (text: string, attachments: ChatAttachment[]) => {
    const userMsg: ChatMessage = {
      id: 'cdx_usr_' + Date.now(),
      sender: 'user',
      text,
      attachments,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    onSendMessage(userMsg);

    setIsGenerating(true);

    // Mock files generation after 1.5s
    setTimeout(() => {
      const generated = generateCodexFiles(text);
      setFiles(generated);
      setSelectedFileIndex(0);
      setIsBuilt(true);
      setIsGenerating(false);

      const logs = [
        `[codex-core] Initializing build context for "${text.slice(0, 30)}..."`,
        `[1/4] Resolving npm dependencies & types...`,
        `[2/4] Parsing TypeScript AST & optimizing imports`,
        `[3/4] Compiling JSX modules with Vite 8.3`,
        `[4/4] Generating bundle: dist/assets/index.js (14.2 kB)`,
        `✓ Build successful in 420ms`,
        `[vite] Local development server running at: http://localhost:5173/`,
        `[vite] Ready for hot module replacement.`
      ];
      setTerminalLogs(logs);

      const assistantMsg: ChatMessage = {
        id: 'cdx_ast_' + Date.now(),
        sender: 'assistant',
        text: `I've architected and generated the complete codebase for your request. Created ${generated.length} files: ${generated.map(f => f.name).join(', ')}. All strict TypeScript compilation passed.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        codexData: {
          summary: `Successfully generated ${generated.length} production files.`,
          generatedFiles: generated.map(f => f.name),
          terminalCommand: 'npm run build && vite preview'
        }
      };
      onSendMessage(assistantMsg);
    }, 1500);
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

    setIsGenerating(true);
    setTimeout(() => {
      const generated = generateCodexFiles(trimmed);
      setFiles(generated);
      setSelectedFileIndex(0);
      setIsBuilt(true);
      setIsGenerating(false);

      const assistantMsg: ChatMessage = {
        id: 'cdx_ast_' + Date.now(),
        sender: 'assistant',
        text: `I've updated the codebase for: "${trimmed.slice(0, 30)}...". Generated ${generated.length} files: ${generated.map(f => f.name).join(', ')}.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        codexData: {
          summary: `Successfully generated ${generated.length} files.`,
          generatedFiles: generated.map(f => f.name),
          terminalCommand: 'npm run build'
        }
      };
      onSendMessage(assistantMsg);
    }, 1200);
  };

  const handleRetryUserPrompt = (prompt: string) => {
    handleSendPrompt(prompt, []);
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

    setIsGenerating(true);
    setTimeout(() => {
      const generated = generateCodexFiles(prompt);
      setFiles(generated);
      setSelectedFileIndex(0);
      setIsBuilt(true);
      setIsGenerating(false);

      const assistantMsg: ChatMessage = {
        id: 'cdx_ast_' + Date.now(),
        sender: 'assistant',
        text: `Regenerated codebase for "${prompt.slice(0, 30)}...". Generated ${generated.length} files: ${generated.map(f => f.name).join(', ')}.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        codexData: {
          summary: `Re-generated ${generated.length} files.`,
          generatedFiles: generated.map(f => f.name),
          terminalCommand: 'npm run build'
        }
      };
      if (onUpdateMessage) {
        onUpdateMessage(aiMsgId, assistantMsg.text);
      } else {
        onSendMessage(assistantMsg);
      }
    }, 1200);
  };

  const handleRun = () => {
    setIsRunning(true);
    setActiveTab('terminal');
    setTerminalLogs(prev => [
      ...prev,
      `--- Triggered manual rebuild [${new Date().toLocaleTimeString()}] ---`,
      `[esbuild] Transforming modules...`,
      `✓ Re-compilation complete with 0 errors.`
    ]);
    setTimeout(() => setIsRunning(false), 800);
  };

  const handleCopyCode = () => {
    if (files[selectedFileIndex]) {
      navigator.clipboard.writeText(files[selectedFileIndex].content);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const currentFile = files[selectedFileIndex] || null;

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#212121] [touch-action:pan-x_pan-y_pinch-zoom]">
      {/* Top bar h-14 bg #171717 border-b white/10 flex justify-between px-4 */}
      <header className="h-14 bg-[#171717] border-b border-white/10 flex justify-between items-center px-4 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <span className="font-bold text-white text-base tracking-tight">Gromina Codex</span>
          <span className="bg-[#2f2f2f] text-zinc-300 text-xs px-2.5 py-0.5 rounded-full font-mono border border-white/5">
            Coder
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsGithubOpen(true)}
            className="border border-white/10 hover:bg-white/10 text-zinc-300 hover:text-white rounded-full px-4 py-1.5 text-xs font-medium transition"
          >
            GitHub Connect
          </button>
          <button
            onClick={handleRun}
            disabled={!isBuilt || isRunning}
            className={`bg-[#2f2f2f] hover:bg-white/10 border border-white/10 rounded-full px-4 py-1.5 text-xs font-medium flex items-center gap-1.5 text-zinc-200 transition ${
              !isBuilt ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
            }`}
          >
            <Play className={`w-3.5 h-3.5 text-emerald-400 ${isRunning ? 'animate-spin' : ''}`} />
            <span>{isRunning ? 'Running...' : 'Run'}</span>
          </button>
          <button
            onClick={() => setIsDeployOpen(true)}
            disabled={!isBuilt}
            className={`rounded-full px-5 py-1.5 text-xs font-semibold transition ${
              isBuilt
                ? 'bg-white text-black hover:bg-zinc-200 cursor-pointer shadow-sm'
                : 'bg-white/20 text-zinc-500 cursor-not-allowed'
            }`}
          >
            Deploy
          </button>
        </div>
      </header>

      {/* Main flex lg:flex-row flex-col */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-auto min-h-0 [touch-action:pan-x_pan-y_pinch-zoom] [-webkit-overflow-scrolling:touch]">
        {/* Left file explorer w-240px bg #1e1e1e border-r white/10 */}
        <div className="w-full lg:w-[240px] bg-[#1e1e1e] border-r border-white/10 flex flex-col flex-shrink-0">
          <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
            <span className="text-[11px] font-semibold tracking-wider text-zinc-500 uppercase">
              Explorer
            </span>
            {isBuilt && (
              <span className="text-[10px] text-zinc-400 font-mono">
                {files.length} files
              </span>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {!isBuilt ? (
              <div className="h-32 flex items-center justify-center text-xs text-zinc-600">
                No files yet
              </div>
            ) : (
              <div className="space-y-0.5">
                {files.map((file, idx) => (
                  <button
                    key={file.path}
                    onClick={() => {
                      setSelectedFileIndex(idx);
                      setActiveTab('code');
                    }}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-mono text-left transition ${
                      selectedFileIndex === idx
                        ? 'bg-white/10 text-white font-medium shadow-xs'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
                    }`}
                  >
                    <FileCode className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
                    <span className="truncate">{file.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Center chat flex-1 bg #212121 flex flex-col border-r border-white/10 */}
        <div className="flex-1 bg-[#212121] flex flex-col border-r border-white/10 min-w-0 min-h-0 relative [touch-action:pan-x_pan-y_pinch-zoom]">
          <div className="flex-1 chat-scroll overflow-x-auto overflow-y-auto p-4 pb-4 min-h-0 [touch-action:pan-x_pan-y_pinch-zoom] [-webkit-overflow-scrolling:touch]">
            {messages.length === 0 ? (
              /* Chat empty state */
              <div className="h-full min-h-[340px] flex flex-col items-center justify-center text-center p-6 max-w-md mx-auto">
                <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-4 shadow-lg">
                  <Code2 className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white tracking-tight mb-2">Gromina Codex</h2>
                <p className="text-zinc-400 text-xs leading-relaxed max-w-sm">
                  Describe what you want to build, I'll code it, run it and deploy it.
                </p>
              </div>
            ) : (
              <div className="max-w-2xl mx-auto space-y-5 pb-6">
                {messages.map(msg => (
                  <div
                    key={msg.id}
                    className={`group relative flex gap-3 ${
                      msg.sender === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {msg.sender === 'assistant' && (
                      <div className="w-7 h-7 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5">
                        <Code2 className="w-3.5 h-3.5" />
                      </div>
                    )}
                    <div
                      className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-[#2f2f2f] text-white border border-white/10'
                          : 'bg-[#262626] text-zinc-200 border border-white/10 shadow-md space-y-3'
                      }`}
                    >
                      {/* User message edit mode vs normal content */}
                      {msg.sender === 'user' && editingMsgId === msg.id ? (
                        <div className="space-y-2">
                          <textarea
                            value={editText}
                            onChange={e => setEditText(e.target.value)}
                            className="w-full bg-[#1e1e1e] border border-white/20 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-white/40 resize-none min-h-[60px] leading-relaxed"
                            rows={2}
                            autoFocus
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={handleCancelEdit}
                              className="px-2.5 py-1 text-[11px] text-zinc-300 hover:text-white rounded-full border border-white/10 hover:bg-white/10 transition cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSaveEdit(msg.id)}
                              className="px-3.5 py-1 text-[11px] font-semibold text-black bg-white hover:bg-zinc-200 rounded-full transition cursor-pointer shadow-xs"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="whitespace-pre-wrap">{msg.text}</p>

                          {msg.codexData && (
                            <div className="bg-[#1b1b1b] rounded-xl p-3 border border-white/5 space-y-2">
                              <div className="flex items-center gap-1.5 text-emerald-400 text-[11px] font-semibold">
                                <CheckCircle className="w-3.5 h-3.5" />
                                <span>{msg.codexData.summary}</span>
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                {msg.codexData.generatedFiles.map(fn => (
                                  <span
                                    key={fn}
                                    className="bg-white/5 border border-white/5 text-zinc-300 font-mono text-[10px] px-2 py-0.5 rounded"
                                  >
                                    {fn}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          <span className="block text-[10px] text-zinc-500 text-right">
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
                      <div className="w-7 h-7 rounded-full bg-zinc-700 text-white flex items-center justify-center flex-shrink-0 text-xs mt-0.5">
                        <User className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>
                ))}

                {isGenerating && (
                  <div className="flex items-center gap-2 p-3 bg-[#262626] border border-white/10 rounded-xl text-xs text-zinc-400 max-w-sm">
                    <Loader2 className="w-4 h-4 text-sky-400 animate-spin" />
                    <span>Codex is compiling codebase & AST...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Bottom input bar with codex placeholder */}
          <BottomInputBar
            onSendMessage={handleSendPrompt}
            onOpenVoiceOverlay={onOpenVoiceOverlay}
            onOpenCamModal={onOpenCamModal}
            placeholder="Describe what you want to code..."
            disabled={isGenerating}
          />
        </div>

        {/* Right panel w-520px bg #0a0a0a flex flex-col */}
        <div className="w-full lg:w-[520px] bg-[#0a0a0a] flex flex-col flex-shrink-0 min-h-0 overflow-hidden">
          {/* Toolbar h-11 bg #171717 border-b white/10 */}
          <div className="h-11 bg-[#171717] border-b border-white/10 flex justify-between items-center px-3 flex-shrink-0">
            <div className="bg-[#2f2f2f] rounded-full p-1 border border-white/10 flex items-center shadow-xs">
              {(['code', 'preview', 'terminal'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold capitalize transition ${
                    activeTab === tab
                      ? 'bg-white text-black shadow-xs'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {activeTab === 'preview' && isBuilt && (
              <div className="bg-[#2f2f2f] rounded-full p-1 border border-white/10 flex items-center">
                <button
                  onClick={() => setPreviewDevice('desktop')}
                  className={`rounded-full p-1 transition ${
                    previewDevice === 'desktop'
                      ? 'bg-white text-black'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                  title="Desktop Preview"
                >
                  <Monitor className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setPreviewDevice('mobile')}
                  className={`rounded-full p-1 transition ${
                    previewDevice === 'mobile'
                      ? 'bg-white text-black'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                  title="Mobile Preview"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {activeTab === 'code' && isBuilt && currentFile && (
              <button
                onClick={handleCopyCode}
                className="p-1.5 rounded hover:bg-white/10 text-zinc-400 hover:text-white transition"
                title="Copy code"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto p-4 flex justify-center items-start bg-[#0a0a0a]">
            {!isBuilt ? (
              /* Center: Code, preview and terminal will appear here zinc-500 No examples */
              <div className="m-auto flex flex-col items-center justify-center text-center p-8 select-none">
                <TerminalIcon className="w-12 h-12 text-zinc-600 mb-3" />
                <p className="text-xs text-zinc-500 font-medium">
                  Code, preview and terminal will appear here
                </p>
              </div>
            ) : activeTab === 'code' ? (
              /* Code view bg #1e1e1e rounded-xl p-4 pre mono */
              <div className="w-full h-full bg-[#1e1e1e] border border-white/10 rounded-xl p-4 flex flex-col overflow-hidden">
                <div className="flex items-center justify-between pb-2 border-b border-white/5 mb-2">
                  <span className="text-xs font-mono text-zinc-400">{currentFile?.path}</span>
                  <span className="text-[10px] text-zinc-500 uppercase">{currentFile?.language}</span>
                </div>
                <pre className="flex-1 overflow-auto font-mono text-xs text-zinc-300 leading-relaxed scrollbar-none">
                  <code>{currentFile?.content}</code>
                </pre>
              </div>
            ) : activeTab === 'preview' ? (
              /* Preview desktop full width white rounded-xl min-h-500px or mobile frame */
              previewDevice === 'desktop' ? (
                <div className="w-full bg-white rounded-xl min-h-[500px] shadow-2xl p-6 text-zinc-900 border border-zinc-200 overflow-y-auto">
                  <div className="flex items-center justify-between pb-4 border-b border-zinc-200">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-sky-600" />
                      <span className="font-bold text-base">Codex Live Application</span>
                    </div>
                    <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-medium">
                      Port: 5173
                    </span>
                  </div>
                  <div className="mt-6 space-y-4">
                    <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200">
                      <h4 className="font-bold text-sm text-zinc-800">Production Build Deployed</h4>
                      <p className="text-xs text-zinc-600 mt-1">
                        Compiled with TypeScript 7 and Tailwind v4. Responsive interactive state running.
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-zinc-100 rounded-lg text-center">
                        <span className="text-xs text-zinc-500 block">Total Requests</span>
                        <span className="text-lg font-bold text-zinc-900">1,420</span>
                      </div>
                      <div className="p-3 bg-zinc-100 rounded-lg text-center">
                        <span className="text-xs text-zinc-500 block">Response Latency</span>
                        <span className="text-lg font-bold text-emerald-600">8ms</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w-[320px] h-[580px] border-8 border-zinc-800 rounded-[32px] bg-white overflow-hidden shadow-2xl flex flex-col p-4 text-zinc-900">
                  <div className="w-16 h-3 bg-zinc-800 rounded-full mx-auto mb-4" />
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-sky-600" />
                    <span className="font-bold text-sm">Codex Mobile</span>
                  </div>
                  <div className="p-3 bg-zinc-100 rounded-xl text-xs space-y-2">
                    <p className="font-medium">Vite + React 19 Mobile</p>
                    <p className="text-zinc-600 text-[11px]">All components responsive on viewport 320x580.</p>
                  </div>
                </div>
              )
            ) : (
              /* Terminal bg black rounded-xl p-4 font-mono text-xs green-400 with logs Build successful */
              <div className="w-full h-full bg-black border border-white/10 rounded-xl p-4 font-mono text-xs text-green-400 overflow-auto space-y-1.5 shadow-2xl">
                <div className="flex items-center justify-between pb-2 border-b border-white/10 text-zinc-500 text-[11px]">
                  <span>bash - gromina-dev: 5173</span>
                  <span>node v22.14.0</span>
                </div>
                {terminalLogs.map((log, index) => (
                  <div
                    key={index}
                    className={`${
                      log.includes('successful')
                        ? 'text-emerald-300 font-semibold'
                        : log.includes('error')
                        ? 'text-red-400'
                        : 'text-green-400/90'
                    }`}
                  >
                    {log}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* GitHub Modal */}
      <GitHubModal
        isOpen={isGithubOpen}
        onClose={() => setIsGithubOpen(false)}
        projectName="gromina-codex"
      />

      {/* Deploy Modal */}
      <DeployModal
        isOpen={isDeployOpen}
        onClose={() => setIsDeployOpen(false)}
        projectName="gromina-codex"
      />
    </div>
  );
}
