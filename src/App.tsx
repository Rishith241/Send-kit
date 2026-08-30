import React, { useState, useEffect } from 'react';
import { ActiveTab, TelegramBotInfo } from './types';
import { Header } from './components/Header';
import { ArchitectureView } from './components/ArchitectureView';
import { TelegramTester } from './components/TelegramTester';
import { McpInspector } from './components/McpInspector';
import { CliTerminal } from './components/CliTerminal';
import { RemoteMcpExplorer } from './components/RemoteMcpExplorer';
import { CustomOperationBuilder } from './components/CustomOperationBuilder';
import { SkillAgentSandbox } from './components/SkillAgentSandbox';
import { GitHubDeployGuide } from './components/GitHubDeployGuide';
import { testTelegramBot } from './lib/api';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [botToken, setBotToken] = useState<string>('demo_bot_token');
  const [chatId, setChatId] = useState<string>('123456789');
  const [botInfo, setBotInfo] = useState<TelegramBotInfo | null>({
    id: 7928349182,
    is_bot: true,
    first_name: 'SendKit Demo Bot',
    username: 'sendkit_demo_bot',
    can_join_groups: true,
    can_read_all_group_messages: false,
  });

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col selection:bg-sky-500/30 selection:text-sky-300">
      {/* Top Header Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        botInfo={botInfo}
        botToken={botToken}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        {activeTab === 'overview' && <ArchitectureView />}
        {activeTab === 'telegram' && (
          <TelegramTester
            botToken={botToken}
            setBotToken={setBotToken}
            chatId={chatId}
            setChatId={setChatId}
            botInfo={botInfo}
            setBotInfo={setBotInfo}
          />
        )}
        {activeTab === 'mcp-inspector' && <McpInspector botToken={botToken} />}
        {activeTab === 'terminal' && <CliTerminal botToken={botToken} />}
        {activeTab === 'remote-mcp' && <RemoteMcpExplorer botToken={botToken} />}
        {activeTab === 'custom-builder' && <CustomOperationBuilder />}
        {activeTab === 'skill-agent' && <SkillAgentSandbox />}
        {activeTab === 'github-deploy' && <GitHubDeployGuide />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#070a12] py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-300">SendKit Studio</span>
            <span>—</span>
            <span>One shared core for MCP, CLI & Agent Skills</span>
          </div>
          <div className="flex items-center space-x-4">
            <a
              href="https://github.com/Rishith241/sendkit"
              target="_blank"
              rel="noreferrer"
              className="text-slate-400 hover:text-sky-400 transition"
            >
              GitHub Repository
            </a>
            <span>•</span>
            <a
              href="https://modelcontextprotocol.io"
              target="_blank"
              rel="noreferrer"
              className="text-slate-400 hover:text-purple-400 transition"
            >
              MCP Specification
            </a>
            <span>•</span>
            <a
              href="https://core.telegram.org/bots/api"
              target="_blank"
              rel="noreferrer"
              className="text-slate-400 hover:text-blue-400 transition"
            >
              Telegram API
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
