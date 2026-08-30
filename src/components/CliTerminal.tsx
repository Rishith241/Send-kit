import React, { useState, useRef, useEffect } from 'react';
import { executeCliCommand } from '../lib/api';
import { CliLogEntry } from '../types';
import { 
  Terminal, 
  Play, 
  Trash2, 
  Copy, 
  Check, 
  CornerDownLeft, 
  Sparkles,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface CliTerminalProps {
  botToken: string;
}

export const CliTerminal: React.FC<CliTerminalProps> = ({ botToken }) => {
  const [inputCommand, setInputCommand] = useState('sendkit telegram "123456789" "Hello from SendKit CLI" --json');
  const [logs, setLogs] = useState<CliLogEntry[]>([
    {
      id: 'init-0',
      timestamp: new Date().toLocaleTimeString(),
      command: 'sendkit --help',
      output: `Usage: sendkit [options] [command]

SendKit CLI backed by @cwa-dev/sendkit-core

Options:
  -V, --version                         output the version number (0.1.4)
  -h, --help                            display help for command

Commands:
  init --telegram-bot-token <botToken>  Configure SendKit CLI local settings
  telegram [options] <chatId> <message> Send a Telegram message
  status                                Inspect active CLI configuration & bot info
  doctor                                Diagnose network, token permissions, and environment
  list-tools                            Display all registered Core tools and adapters
  help [command]                        display help for command`,
      exitCode: 0,
    },
  ]);
  const [history, setHistory] = useState<string[]>([
    'sendkit --help',
    'sendkit status',
    'sendkit doctor',
  ]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [executing, setExecuting] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleRunCommand = async (cmdToRun = inputCommand) => {
    const cmd = cmdToRun.trim();
    if (!cmd) return;

    if (cmd === 'clear' || cmd === 'cls') {
      setLogs([]);
      setInputCommand('');
      return;
    }

    setExecuting(true);
    setHistory((prev) => [...prev, cmd]);
    setHistoryIndex(-1);

    const res = await executeCliCommand(cmd);

    const isJson = cmd.includes('--json') || res.output.trim().startsWith('{');

    setLogs((prev) => [
      ...prev,
      {
        id: `cmd-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        command: cmd,
        output: res.output,
        exitCode: res.exitCode,
        isJson,
      },
    ]);

    setExecuting(false);
    setInputCommand('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleRunCommand();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length === 0) return;
      const nextIndex = historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(nextIndex);
      setInputCommand(history[nextIndex]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex === -1) return;
      const nextIndex = historyIndex + 1;
      if (nextIndex >= history.length) {
        setHistoryIndex(-1);
        setInputCommand('');
      } else {
        setHistoryIndex(nextIndex);
        setInputCommand(history[nextIndex]);
      }
    }
  };

  const copyLogOutput = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const quickCommands = [
    { label: 'sendkit doctor', cmd: 'sendkit doctor' },
    { label: 'sendkit status', cmd: 'sendkit status' },
    { label: 'sendkit init', cmd: `sendkit init --telegram-bot-token "${botToken || 'demo_bot_token'}"` },
    { label: 'sendkit telegram --json', cmd: 'sendkit telegram "123456789" "Build shipped successfully!" --json' },
    { label: 'sendkit list-tools', cmd: 'sendkit list-tools' },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 to-amber-950/30 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1">
            <Terminal className="w-3.5 h-3.5" />
            <span>Command-Line Interface</span>
          </div>
          <h2 className="text-xl font-bold text-white">Interactive CLI Emulator</h2>
          <p className="text-xs text-slate-400 mt-1">
            Test the <code className="text-amber-300">@cwa-dev/sendkit</code> binary with Commander argument parsing, local credential caching, and structured JSON output.
          </p>
        </div>

        <button
          onClick={() => setLogs([])}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition text-xs font-medium border border-slate-700 self-start sm:self-auto"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear Terminal</span>
        </button>
      </div>

      {/* Quick Command Chips */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-slate-400 flex items-center space-x-1 mr-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Quick Run:</span>
        </span>
        {quickCommands.map((qc, i) => (
          <button
            key={i}
            onClick={() => handleRunCommand(qc.cmd)}
            className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-amber-300 text-xs font-mono border border-slate-800 transition"
          >
            {qc.label}
          </button>
        ))}
      </div>

      {/* Terminal Window */}
      <div className="rounded-2xl bg-[#070b12] border border-slate-800 shadow-2xl overflow-hidden font-mono">
        {/* Terminal Title Bar */}
        <div className="px-4 py-3 bg-[#0d131f] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
            <span className="ml-2 text-xs font-semibold text-slate-400">bash — sendkit v0.1.4</span>
          </div>

          <div className="text-[11px] text-slate-500">
            Type <code className="text-amber-400">help</code> or <code className="text-amber-400">clear</code>
          </div>
        </div>

        {/* Terminal Log Stream */}
        <div className="p-4 sm:p-6 space-y-4 max-h-[480px] overflow-y-auto">
          {logs.map((log) => (
            <div key={log.id} className="space-y-1.5 text-xs group">
              {/* Command input row */}
              <div className="flex items-center justify-between text-slate-400">
                <div className="flex items-center space-x-2">
                  <span className="text-emerald-400 font-bold">developer@sendkit</span>
                  <span className="text-slate-600">:</span>
                  <span className="text-sky-400 font-bold">~</span>
                  <span className="text-slate-600">$</span>
                  <span className="text-slate-100 font-semibold">{log.command}</span>
                </div>

                <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition">
                  <span className="text-[10px] text-slate-500">{log.timestamp}</span>
                  <button
                    onClick={() => copyLogOutput(log.id, log.output)}
                    className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                    title="Copy output"
                  >
                    {copiedId === log.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Command output */}
              <div className={`pl-4 border-l-2 ${log.exitCode === 0 ? 'border-sky-500/40' : 'border-rose-500/60'}`}>
                <pre className={`whitespace-pre-wrap ${log.exitCode === 0 ? 'text-slate-300' : 'text-rose-400'}`}>
                  {log.output}
                </pre>
              </div>
            </div>
          ))}
          <div ref={terminalEndRef} />
        </div>

        {/* Terminal Input Bar */}
        <div className="p-3 sm:p-4 bg-[#0a0f18] border-t border-slate-800/80 flex items-center space-x-2 text-xs">
          <span className="text-emerald-400 font-bold whitespace-nowrap">developer@sendkit:~$</span>
          <input
            type="text"
            value={inputCommand}
            onChange={(e) => setInputCommand(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={executing}
            placeholder="sendkit telegram <chatId> <message> --json"
            className="flex-1 bg-transparent text-slate-100 placeholder-slate-600 focus:outline-none font-mono"
            autoFocus
          />
          <button
            onClick={() => handleRunCommand()}
            disabled={executing || !inputCommand.trim()}
            className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center space-x-1 transition disabled:opacity-40"
          >
            <span>Execute</span>
            <CornerDownLeft className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
