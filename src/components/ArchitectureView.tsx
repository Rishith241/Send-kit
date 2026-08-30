import React, { useState } from 'react';
import { SENDKIT_SOURCE_FILES } from '../data/sendkit-source';
import { 
  Layers, 
  Terminal, 
  Cpu, 
  Globe, 
  FileText, 
  Copy, 
  Check, 
  ArrowRight, 
  ShieldCheck, 
  Code2, 
  CheckCircle2, 
  Sparkles,
  Workflow
} from 'lucide-react';

export const ArchitectureView: React.FC = () => {
  const [activeFile, setActiveFile] = useState<keyof typeof SENDKIT_SOURCE_FILES>('coreSchemas');
  const [copied, setCopied] = useState(false);

  const copyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const fileDetails = {
    coreSchemas: {
      title: 'packages/core/src/schemas.ts',
      badge: 'Core Schemas',
      tagline: 'Single source of truth Zod validation schemas for inputs, outputs, and Telegram requests.',
      color: 'from-blue-500 to-sky-500',
    },
    coreOperations: {
      title: 'packages/core/src/operations.ts',
      badge: 'Core Operations',
      tagline: 'Pure business logic calling Telegram Bot API. No CLI prompts, no MCP SDK, no side-effects.',
      color: 'from-sky-500 to-cyan-500',
    },
    cliIndex: {
      title: 'packages/cli/src/index.ts',
      badge: 'CLI Adapter',
      tagline: 'Human & script adapter with Commander. Reads ~/.config/sendkit/config.json and supports --json.',
      color: 'from-amber-500 to-orange-500',
    },
    localMcpIndex: {
      title: 'packages/local-mcp/src/index.ts',
      badge: 'Local MCP Server (Stdio)',
      tagline: 'Stdio MCP server for Claude Desktop / Cursor. Reads TELEGRAM_BOT_TOKEN from MCP client env.',
      color: 'from-purple-500 to-indigo-500',
    },
    remoteMcpIndex: {
      title: 'apps/remote-mcp/src/index.ts',
      badge: 'Remote MCP Server (HTTP)',
      tagline: 'HTTP Hono MCP endpoint with Clerk OAuth auth and URL path bot token injection.',
      color: 'from-emerald-500 to-teal-500',
    },
    skillMd: {
      title: 'skills/sendkit/SKILL.md',
      badge: 'Skill Specification',
      tagline: 'Agent-facing instructions detailing when to prefer MCP tool vs fallback CLI.',
      color: 'from-rose-500 to-pink-500',
    },
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner / Philosophy */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-sky-950/40 border border-slate-800 p-6 sm:p-8 shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>The Single-Core Pattern</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
            One shared TypeScript core for MCP, CLI, and Agent Skills
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed">
            SendKit establishes a unified architecture where reusable schemas and operations live exclusively in <code className="px-1.5 py-0.5 rounded bg-slate-800 text-sky-300 font-mono text-xs">packages/core</code>. Every other package is an adapter—preventing code drift across agents, scripts, and human developers.
          </p>
        </div>
      </div>

      {/* Interactive Visual Graph */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <Workflow className="w-4 h-4 text-sky-400" />
              <span>Interactive Architecture Flow</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Click any node to view its implementation and adapter details</p>
          </div>
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-400"></span>
            <span>Core Logic</span>
            <span className="w-2.5 h-2.5 rounded-full bg-slate-500 ml-2"></span>
            <span>Adapters</span>
          </div>
        </div>

        {/* Graph Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-stretch">
          {/* Core Card */}
          <div 
            onClick={() => setActiveFile('coreOperations')}
            className={`cursor-pointer md:col-span-4 lg:col-span-1 rounded-xl p-5 border transition-all duration-200 ${
              activeFile === 'coreSchemas' || activeFile === 'coreOperations'
                ? 'bg-sky-950/40 border-sky-500 shadow-md shadow-sky-500/10'
                : 'bg-slate-800/60 border-slate-700 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold">
                <Layers className="w-4 h-4" />
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-sky-500/20 text-sky-300">
                Core Engine
              </span>
            </div>
            <h3 className="text-sm font-bold text-white">packages/core</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Zod schemas & pure async operations (<code className="text-sky-300">sendTelegramMessage</code>). No side-effects or process exits.
            </p>
            <div className="mt-4 pt-3 border-t border-slate-800 flex gap-2">
              <button
                onClick={(e) => { e.stopPropagation(); setActiveFile('coreSchemas'); }}
                className={`text-[11px] px-2.5 py-1 rounded font-mono ${activeFile === 'coreSchemas' ? 'bg-sky-500 text-white font-bold' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
              >
                schemas.ts
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setActiveFile('coreOperations'); }}
                className={`text-[11px] px-2.5 py-1 rounded font-mono ${activeFile === 'coreOperations' ? 'bg-sky-500 text-white font-bold' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
              >
                operations.ts
              </button>
            </div>
          </div>

          {/* CLI Adapter */}
          <div 
            onClick={() => setActiveFile('cliIndex')}
            className={`cursor-pointer rounded-xl p-5 border transition-all duration-200 ${
              activeFile === 'cliIndex'
                ? 'bg-amber-950/40 border-amber-500 shadow-md shadow-amber-500/10'
                : 'bg-slate-800/60 border-slate-700 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                <Terminal className="w-4 h-4" />
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
                CLI Adapter
              </span>
            </div>
            <h3 className="text-sm font-bold text-white">packages/cli</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Command-line interface with Commander. Reads token from <code className="text-amber-300">~/.config/sendkit/config.json</code>.
            </p>
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center text-[11px] text-amber-400 font-mono">
              <span>sendkit telegram &lt;chatId&gt;</span>
            </div>
          </div>

          {/* Local MCP Server */}
          <div 
            onClick={() => setActiveFile('localMcpIndex')}
            className={`cursor-pointer rounded-xl p-5 border transition-all duration-200 ${
              activeFile === 'localMcpIndex'
                ? 'bg-purple-950/40 border-purple-500 shadow-md shadow-purple-500/10'
                : 'bg-slate-800/60 border-slate-700 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
                <Cpu className="w-4 h-4" />
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-purple-500/20 text-purple-300">
                Local MCP (Stdio)
              </span>
            </div>
            <h3 className="text-sm font-bold text-white">packages/local-mcp</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Stdio JSON-RPC MCP server for Claude Desktop / Cursor. Token supplied via <code className="text-purple-300">TELEGRAM_BOT_TOKEN</code> env.
            </p>
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center text-[11px] text-purple-400 font-mono">
              <span>tool: "telegram"</span>
            </div>
          </div>

          {/* Remote MCP / Skill */}
          <div 
            onClick={() => setActiveFile('remoteMcpIndex')}
            className={`cursor-pointer rounded-xl p-5 border transition-all duration-200 ${
              activeFile === 'remoteMcpIndex'
                ? 'bg-emerald-950/40 border-emerald-500 shadow-md shadow-emerald-500/10'
                : 'bg-slate-800/60 border-slate-700 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                <Globe className="w-4 h-4" />
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                Remote MCP (HTTP)
              </span>
            </div>
            <h3 className="text-sm font-bold text-white">apps/remote-mcp</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Hono HTTP Streamable MCP endpoint. Protected by Clerk OAuth at <code className="text-emerald-300">POST /:botToken/mcp</code>.
            </p>
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center text-[11px] text-emerald-400 font-mono">
              <span>OAuth 2.0 Protected</span>
            </div>
          </div>
        </div>
      </div>

      {/* Code Inspector */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-xl">
        {/* Code Header Tabs */}
        <div className="border-b border-slate-800 bg-slate-950/70 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar">
            {(Object.keys(fileDetails) as (keyof typeof SENDKIT_SOURCE_FILES)[]).map((key) => {
              const file = fileDetails[key];
              const isActive = activeFile === key;
              return (
                <button
                  key={key}
                  onClick={() => setActiveFile(key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition ${
                    isActive
                      ? 'bg-slate-800 text-sky-400 border border-slate-700 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80 border border-transparent'
                  }`}
                >
                  {file.badge}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => copyCode(SENDKIT_SOURCE_FILES[activeFile])}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition text-xs font-medium border border-slate-700"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Source</span>
              </>
            )}
          </button>
        </div>

        {/* File description banner */}
        <div className="px-5 py-3 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <Code2 className="w-4 h-4 text-sky-400" />
            <span className="font-mono font-bold text-slate-200">{fileDetails[activeFile].title}</span>
          </div>
          <span className="text-slate-400 hidden sm:inline">{fileDetails[activeFile].tagline}</span>
        </div>

        {/* Syntax container */}
        <div className="p-4 sm:p-6 bg-[#080d16] overflow-x-auto max-h-[500px]">
          <pre className="font-mono text-xs text-slate-300 leading-relaxed">
            <code>{SENDKIT_SOURCE_FILES[activeFile]}</code>
          </pre>
        </div>
      </div>

      {/* Comparison Matrix */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6">
        <h3 className="text-base font-bold text-white mb-4 flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Credential Pattern Matrix (DRY & Secure)</span>
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="pb-3 font-semibold">Interface</th>
                <th className="pb-3 font-semibold">Target Audience</th>
                <th className="pb-3 font-semibold">Credential Storage</th>
                <th className="pb-3 font-semibold">Execution Command</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              <tr>
                <td className="py-3 font-medium text-white flex items-center space-x-2">
                  <Terminal className="w-3.5 h-3.5 text-amber-400" />
                  <span>CLI</span>
                </td>
                <td className="py-3 text-slate-400">Human developer & local scripts</td>
                <td className="py-3 font-mono text-amber-300">~/.config/sendkit/config.json</td>
                <td className="py-3 font-mono text-slate-400">sendkit telegram &lt;chatId&gt; &lt;msg&gt;</td>
              </tr>
              <tr>
                <td className="py-3 font-medium text-white flex items-center space-x-2">
                  <Cpu className="w-3.5 h-3.5 text-purple-400" />
                  <span>Local MCP</span>
                </td>
                <td className="py-3 text-slate-400">Claude Desktop, Cursor, OpenCode</td>
                <td className="py-3 font-mono text-purple-300">env: TELEGRAM_BOT_TOKEN</td>
                <td className="py-3 font-mono text-slate-400">MCP tool call `telegram`</td>
              </tr>
              <tr>
                <td className="py-3 font-medium text-white flex items-center space-x-2">
                  <Globe className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Remote MCP</span>
                </td>
                <td className="py-3 text-slate-400">Deployed agents & web clients</td>
                <td className="py-3 font-mono text-emerald-300">POST /:botToken/mcp + Clerk OAuth</td>
                <td className="py-3 font-mono text-slate-400">HTTP JSON-RPC Stream</td>
              </tr>
              <tr>
                <td className="py-3 font-medium text-white flex items-center space-x-2">
                  <FileText className="w-3.5 h-3.5 text-rose-400" />
                  <span>Skill</span>
                </td>
                <td className="py-3 text-slate-400">Autonomous LLM agent reasoning</td>
                <td className="py-3 font-mono text-rose-300">Agent env context</td>
                <td className="py-3 font-mono text-slate-400">Instructs fallback to CLI or MCP</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
