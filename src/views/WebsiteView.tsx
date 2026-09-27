import React, { useState } from 'react';
import {
  Code,
  Eye,
  Monitor,
  Smartphone,
  Copy,
  Check,
  Sparkles,
  Loader2
} from 'lucide-react';
import { generateWebsiteContent } from '../utils/aiGenerators';
import GitHubModal from '../components/GitHubModal';
import DeployModal from '../components/DeployModal';

export default function WebsiteView() {
  const [prompt, setPrompt] = useState('');
  const [isBuilding, setIsBuilding] = useState(false);
  const [isBuilt, setIsBuilt] = useState(false);
  const [siteData, setSiteData] = useState<{
    html: string;
    css: string;
    js: string;
    title: string;
  } | null>(null);

  // View toggles
  const [viewMode, setViewMode] = useState<'preview' | 'code'>('preview');
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'mobile'>('desktop');
  const [codeTab, setCodeTab] = useState<'html' | 'css' | 'js'>('html');
  const [copiedCode, setCopiedCode] = useState(false);

  // Modals
  const [isGithubOpen, setIsGithubOpen] = useState(false);
  const [isDeployOpen, setIsDeployOpen] = useState(false);

  const handleBuild = () => {
    if (!prompt.trim()) return;
    setIsBuilding(true);

    setTimeout(() => {
      const generated = generateWebsiteContent(prompt);
      setSiteData(generated);
      setIsBuilt(true);
      setIsBuilding(false);
    }, 1200);
  };

  const handleCopyCode = () => {
    if (!siteData) return;
    const content =
      codeTab === 'html' ? siteData.html : codeTab === 'css' ? siteData.css : siteData.js;
    navigator.clipboard.writeText(content);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#212121] [touch-action:pan-x_pan-y_pinch-zoom]">
      {/* Top bar h-14 bg #171717 border-b white/10 */}
      <header className="h-14 bg-[#171717] border-b border-white/10 flex justify-between items-center px-4 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <h2 className="font-bold text-white text-base tracking-tight">
            Build your website with AI
          </h2>
          <span className="bg-white/10 text-zinc-300 text-xs font-semibold px-2.5 py-0.5 rounded-full">
            AI Studio
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

      {/* Main flex flex-col md:flex-row */}
      <div className="flex-1 flex flex-col md:flex-row chat-scroll overflow-x-auto overflow-y-auto min-h-0 [touch-action:pan-x_pan-y_pinch-zoom] [-webkit-overflow-scrolling:touch]">
        {/* Left panel w-380px border-r white/10 bg #1e1e1e flex flex-col */}
        <div className="w-full md:w-[380px] border-r border-white/10 bg-[#1e1e1e] flex flex-col flex-shrink-0">
          <label className="px-4 pt-4 text-sm text-zinc-400 font-medium">
            Describe your website
          </label>
          <textarea
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            placeholder="Describe your website..."
            className="bg-[#2f2f2f] border border-white/10 rounded-xl m-4 p-4 min-h-[160px] flex-1 text-white placeholder:text-zinc-500 text-sm outline-none resize-none focus:border-white/30 transition leading-relaxed"
          />
          <button
            onClick={handleBuild}
            disabled={isBuilding || !prompt.trim()}
            className={`rounded-full mx-4 mb-4 py-3 font-semibold text-sm transition flex items-center justify-center gap-2 ${
              prompt.trim() && !isBuilding
                ? 'bg-white text-black hover:bg-zinc-200 cursor-pointer shadow-md'
                : 'bg-[#333] text-zinc-500 cursor-not-allowed'
            }`}
          >
            {isBuilding ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-black" />
                <span>Generating Website...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Build Website</span>
              </>
            )}
          </button>
        </div>

        {/* Right panel flex-1 bg #0a0a0a flex flex-col */}
        <div className="flex-1 bg-[#0a0a0a] flex flex-col overflow-y-auto overflow-x-auto">
          {/* Toolbar h-12 bg #171717 border-b white/10 flex justify-between px-4 */}
          <div className="h-12 bg-[#171717] border-b border-white/10 flex justify-between items-center px-4 flex-shrink-0">
            {/* Left pill with Preview and Code */}
            <div className="bg-[#2f2f2f] rounded-full p-1 border border-white/10 flex items-center shadow-xs">
              <button
                onClick={() => setViewMode('preview')}
                className={`rounded-full px-3.5 py-1 text-xs font-semibold flex items-center gap-1.5 transition ${
                  viewMode === 'preview'
                    ? 'bg-white text-black shadow-xs'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5" /> Preview
              </button>
              <button
                onClick={() => setViewMode('code')}
                className={`rounded-full px-3.5 py-1 text-xs font-semibold flex items-center gap-1.5 transition ${
                  viewMode === 'code'
                    ? 'bg-white text-black shadow-xs'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Code className="w-3.5 h-3.5" /> Code
              </button>
            </div>

            {/* Right pill with Desktop and Mobile */}
            {viewMode === 'preview' && (
              <div className="bg-[#2f2f2f] rounded-full p-1 border border-white/10 flex items-center shadow-xs">
                <button
                  onClick={() => setDeviceMode('desktop')}
                  className={`rounded-full p-1.5 transition ${
                    deviceMode === 'desktop'
                      ? 'bg-white text-black shadow-xs'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                  title="Desktop Preview"
                >
                  <Monitor className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setDeviceMode('mobile')}
                  className={`rounded-full p-1.5 transition ${
                    deviceMode === 'mobile'
                      ? 'bg-white text-black shadow-xs'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                  title="Mobile Preview"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Content flex-1 overflow-auto p-4 flex justify-center bg #0f0f0f */}
          <div className="flex-1 chat-scroll overflow-x-auto overflow-y-auto p-4 flex justify-center items-start bg-[#0f0f0f]">
            {!isBuilt ? (
              /* If not built center empty icon code + Your website preview will appear here zinc-500 */
              <div className="m-auto flex flex-col items-center justify-center text-center p-8">
                <div className="w-16 h-16 rounded-full bg-[#1e1e1e] border border-white/10 flex items-center justify-center mb-4">
                  <Code className="w-8 h-8 text-zinc-500" />
                </div>
                <p className="text-sm font-medium text-zinc-500">
                  Your website preview will appear here
                </p>
              </div>
            ) : viewMode === 'preview' ? (
              deviceMode === 'desktop' ? (
                /* Desktop preview div max-w-5xl w-full bg white rounded-xl min-h-600px shadow-2xl */
                <div className="max-w-5xl w-full bg-white rounded-xl min-h-[600px] shadow-2xl overflow-hidden flex flex-col border border-zinc-200 text-zinc-900">
                  {/* Browser simulated top bar */}
                  <div className="bg-zinc-100 border-b border-zinc-300 px-4 py-2 flex items-center gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-red-400 inline-block" />
                      <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />
                      <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block" />
                    </div>
                    <div className="flex-1 max-w-md mx-auto bg-white rounded-md px-3 py-1 text-[11px] text-zinc-600 border border-zinc-200 text-center font-mono">
                      https://preview.gromina.app/{siteData?.title.toLowerCase().replace(/\s+/g, '-')}
                    </div>
                  </div>

                  {/* Rendered Live Preview IFrame */}
                  <div className="flex-1 min-h-[650px] bg-slate-900">
                    <iframe
                      title="Website Desktop Preview"
                      srcDoc={`
                        ${siteData?.html}
                        <style>${siteData?.css}</style>
                      `}
                      className="w-full h-full min-h-[650px] border-0"
                      sandbox="allow-scripts"
                    />
                  </div>
                </div>
              ) : (
                /* Mobile preview div w-390px h-800px border-8 border-zinc-800 rounded-36px bg white */
                <div className="w-[390px] h-[800px] border-8 border-zinc-800 rounded-[36px] bg-white overflow-hidden shadow-2xl flex flex-col my-4">
                  {/* Phone notch */}
                  <div className="h-6 bg-zinc-900 w-full flex items-center justify-center">
                    <div className="w-24 h-4 bg-zinc-800 rounded-full" />
                  </div>
                  {/* Mobile content iframe */}
                  <iframe
                    title="Website Mobile Preview"
                    srcDoc={`
                      ${siteData?.html}
                      <style>
                        ${siteData?.css}
                        .navbar { padding: 1rem; }
                        .nav-links { display: none; }
                        .hero { padding: 2.5rem 1rem 2rem; }
                        .hero-stats { flex-direction: column; gap: 1rem; }
                        .cta-banner { padding: 2rem 1rem; margin: 2rem 1rem; }
                      </style>
                    `}
                    className="w-full flex-1 border-0 bg-slate-900"
                    sandbox="allow-scripts"
                  />
                  <div className="h-4 bg-zinc-900 w-full flex items-center justify-center">
                    <div className="w-32 h-1 bg-zinc-700 rounded-full" />
                  </div>
                </div>
              )
            ) : (
              /* Code view bg #1e1e1e rounded-xl p-4 with tabs HTML CSS JS and pre code and copy button */
              <div className="w-full max-w-5xl bg-[#1e1e1e] border border-white/10 rounded-xl p-4 flex flex-col h-full overflow-hidden shadow-2xl">
                {/* Code sub tabs */}
                <div className="flex items-center justify-between pb-3 border-b border-white/10 flex-shrink-0">
                  <div className="flex items-center gap-2">
                    {(['html', 'css', 'js'] as const).map(tab => (
                      <button
                        key={tab}
                        onClick={() => setCodeTab(tab)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition ${
                          codeTab === tab
                            ? 'bg-[#2f2f2f] text-white border border-white/10'
                            : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        {tab.toUpperCase()}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={handleCopyCode}
                    className="px-3 py-1.5 rounded-lg bg-[#2a2a2a] hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white text-xs flex items-center gap-1.5 transition"
                  >
                    {copiedCode ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Preformatted Code Content */}
                <div className="flex-1 overflow-auto pt-3">
                  <pre className="text-xs font-mono text-zinc-300 leading-relaxed overflow-x-auto">
                    <code>
                      {codeTab === 'html'
                        ? siteData?.html
                        : codeTab === 'css'
                        ? siteData?.css
                        : siteData?.js}
                    </code>
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* GitHub Connect Modal */}
      <GitHubModal
        isOpen={isGithubOpen}
        onClose={() => setIsGithubOpen(false)}
        projectName={siteData?.title || 'gromina-website'}
      />

      {/* Deploy Modal */}
      <DeployModal
        isOpen={isDeployOpen}
        onClose={() => setIsDeployOpen(false)}
        projectName={siteData?.title || 'gromina-website'}
      />
    </div>
  );
}
