import React, { useState } from 'react';
import { 
  Globe, 
  ExternalLink, 
  Copy, 
  Check, 
  X, 
  Sparkles, 
  Terminal, 
  Github, 
  Send, 
  Cpu, 
  ShieldCheck,
  Share2,
  Laptop,
  Smartphone
} from 'lucide-react';

interface TestbenchWebpageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TestbenchWebpageModal: React.FC<TestbenchWebpageModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copiedDev, setCopiedDev] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  if (!isOpen) return null;

  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://ais-dev-vtsqhtxer53shjgfqw5voa-531268848020.asia-southeast1.run.app';
  const sharedUrl = 'https://ais-pre-vtsqhtxer53shjgfqw5voa-531268848020.asia-southeast1.run.app';

  const copyToClipboard = (text: string, type: 'dev' | 'share') => {
    navigator.clipboard.writeText(text);
    if (type === 'dev') {
      setCopiedDev(true);
      setTimeout(() => setCopiedDev(false), 2000);
    } else {
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div 
        className="bg-[#0f172a] border border-slate-700/80 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with gradient */}
        <div className="p-6 bg-gradient-to-r from-sky-950/80 via-slate-900 to-indigo-950/80 border-b border-slate-800 flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
                <Globe className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-extrabold text-white tracking-tight">
                SendKit Testbench Webpage
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 uppercase tracking-wide">
                Live Studio
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Interactive standalone web lab for developers, QA, and AI Agent testing.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Main Launch Action */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-sky-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Laptop className="w-4 h-4 text-sky-400" />
                <span>Primary Testbench Webpage URL</span>
              </span>
              <span className="text-[11px] text-emerald-400 font-mono font-medium">Cloud Run • Online</span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={currentUrl}
                className="flex-1 bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-sky-300 font-mono focus:outline-none select-all"
              />
              <button
                onClick={() => copyToClipboard(currentUrl, 'dev')}
                className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-600 transition-colors"
              >
                {copiedDev ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>
            </div>

            <div className="pt-1 flex flex-wrap items-center justify-between gap-3">
              <a
                href={currentUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-sky-500/20 transition-all"
              >
                <span>Launch in Full Screen (New Tab)</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <span className="text-[11px] text-slate-400">Works in Chrome, Edge, Safari, & Mobile browsers</span>
            </div>
          </div>

          {/* Public / Shareable Webpage Link */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Share2 className="w-4 h-4 text-purple-400" />
                <span>Public Shareable Preview Link</span>
              </span>
              <span className="text-[11px] text-purple-400 font-mono">Shared URL</span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={sharedUrl}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-300 font-mono focus:outline-none select-all"
              />
              <button
                onClick={() => copyToClipboard(sharedUrl, 'share')}
                className="px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 border border-slate-700 transition-colors"
              >
                {copiedShare ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
              <a
                href={sharedUrl}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
                title="Open Shared Link"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Testbench Capabilities Grid */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              What you can test in this Testbench Webpage:
            </h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800 flex items-start gap-2.5">
                <Github className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-white">GitHub Issue Lab</div>
                  <div className="text-[11px] text-slate-400">File real/simulated issues with 1 click.</div>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800 flex items-start gap-2.5">
                <Send className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-white">Telegram Test Lab</div>
                  <div className="text-[11px] text-slate-400">Send HTML alerts, Markdown, and chats.</div>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800 flex items-start gap-2.5">
                <Cpu className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-white">MCP Inspector</div>
                  <div className="text-[11px] text-slate-400">JSON-RPC 2.0 debugger for AI models.</div>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800 flex items-start gap-2.5">
                <Terminal className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-white">CLI Emulator</div>
                  <div className="text-[11px] text-slate-400">Run PowerShell / Bash CLI commands.</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950/60 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Zero local installation required to test
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
