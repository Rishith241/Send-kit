import React, { useState } from 'react';
import { ActiveTab, TelegramBotInfo } from '../types';
import { 
  Send, 
  Layers, 
  Terminal, 
  Cpu, 
  Globe, 
  Sparkles, 
  BookOpen, 
  Github, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink,
  Sliders,
  Share2
} from 'lucide-react';
import { TestbenchWebpageModal } from './TestbenchWebpageModal';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  botInfo: TelegramBotInfo | null;
  botToken: string;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  botInfo,
  botToken,
}) => {
  const [showWebpageModal, setShowWebpageModal] = useState(false);

  const tabs = [
    { id: 'overview' as ActiveTab, label: 'Architecture & Core', icon: Layers },
    { id: 'github-issues' as ActiveTab, label: 'GitHub Issue Lab', icon: Github },
    { id: 'telegram' as ActiveTab, label: 'Telegram Test Lab', icon: Send },
    { id: 'mcp-inspector' as ActiveTab, label: 'MCP Protocol Inspector', icon: Cpu },
    { id: 'terminal' as ActiveTab, label: 'CLI Terminal', icon: Terminal },
    { id: 'remote-mcp' as ActiveTab, label: 'Remote MCP & Clerk', icon: Globe },
    { id: 'custom-builder' as ActiveTab, label: 'Tool Generator', icon: Sliders },
    { id: 'skill-agent' as ActiveTab, label: 'Agent & Skill', icon: Sparkles },
    { id: 'github-deploy' as ActiveTab, label: 'Deploy & Publish', icon: BookOpen },
  ];

  return (
    <>
      <header className="border-b border-slate-800 bg-[#0d131f]/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Brand */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-blue-500 p-0.5 shadow-lg shadow-sky-500/20 flex items-center justify-center">
                <img src="/logo.svg" alt="SendKit" className="w-9 h-9 rounded-lg" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-extrabold text-lg tracking-tight text-white flex items-center">
                    SendKit
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/30">
                    Testbench Studio
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-normal hidden sm:block">
                  Visual Webpage & Multi-Interface Testing Lab
                </p>
              </div>
            </div>

            {/* Testbench Webpage Button, Bot Status & External Links */}
            <div className="flex items-center space-x-2.5">
              {/* Cool Webpage / Testbench Link Button */}
              <button
                onClick={() => setShowWebpageModal(true)}
                className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-sky-500/20 to-indigo-500/20 hover:from-sky-500/30 hover:to-indigo-500/30 text-sky-300 hover:text-white border border-sky-500/40 shadow-sm shadow-sky-500/10 transition text-xs font-semibold"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
                </span>
                <Globe className="w-3.5 h-3.5" />
                <span>Testbench Webpage</span>
              </button>

              {botInfo ? (
                <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-emerald-950/50 border border-emerald-500/30 text-emerald-300 text-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="font-medium">Bot:</span>
                  <span className="font-mono font-semibold">@{botInfo.username || botInfo.first_name}</span>
                </div>
              ) : null}

              <a
                href="https://github.com/Rishith241/sendkit"
                target="_blank"
                rel="noreferrer"
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition text-xs font-medium border border-slate-700"
              >
                <Github className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">GitHub Repo</span>
              </a>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex space-x-1 overflow-x-auto no-scrollbar py-2 -mb-px border-t border-slate-800/60">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`tab-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-150 ${
                    isActive
                      ? 'bg-sky-500/15 text-sky-300 border border-sky-500/30 shadow-sm shadow-sky-500/10'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-sky-400' : 'text-slate-500'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Webpage Link & Visualizer Modal */}
      <TestbenchWebpageModal
        isOpen={showWebpageModal}
        onClose={() => setShowWebpageModal(false)}
      />
    </>
  );
};

