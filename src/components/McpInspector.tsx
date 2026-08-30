import React, { useState, useEffect } from 'react';
import { executeMcpJsonRpc } from '../lib/api';
import { MCP_CLIENT_CONFIGS } from '../data/sendkit-source';
import { 
  Cpu, 
  Play, 
  Copy, 
  Check, 
  Download, 
  Terminal, 
  Code2, 
  Settings, 
  Layers, 
  CheckCircle2, 
  AlertCircle,
  RefreshCw,
  Sparkles,
  ExternalLink
} from 'lucide-react';

interface McpInspectorProps {
  botToken: string;
}

export const McpInspector: React.FC<McpInspectorProps> = ({ botToken }) => {
  const [selectedMethod, setSelectedMethod] = useState<'initialize' | 'tools/list' | 'tools/call'>('tools/list');
  const [chatId, setChatId] = useState('123456789');
  const [message, setMessage] = useState('Build completed successfully on SendKit MCP server');
  const [loading, setLoading] = useState(false);
  const [rpcResponse, setRpcResponse] = useState<any>(null);
  const [latency, setLatency] = useState<number | null>(null);
  const [selectedClient, setSelectedClient] = useState<keyof typeof MCP_CLIENT_CONFIGS>('claudeDesktop');
  const [copiedConfig, setCopiedConfig] = useState(false);

  const runRpcCall = async (method = selectedMethod) => {
    setLoading(true);
    const start = performance.now();
    let params: Record<string, any> = {};

    if (method === 'tools/call') {
      params = {
        name: 'telegram',
        arguments: {
          chatId,
          message,
        },
      };
    }

    const res = await executeMcpJsonRpc(method, params, botToken || 'demo_bot_token');
    const end = performance.now();
    setLatency(Math.round(end - start));
    setRpcResponse(res);
    setLoading(false);
  };

  useEffect(() => {
    runRpcCall('tools/list');
  }, []);

  const copyConfigText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedConfig(true);
    setTimeout(() => setCopiedConfig(false), 2000);
  };

  const downloadConfigFile = (clientKey: keyof typeof MCP_CLIENT_CONFIGS) => {
    const config = MCP_CLIENT_CONFIGS[clientKey];
    const blob = new Blob([config.content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = config.filename.split('/').pop() || 'mcp-config.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 to-purple-950/30 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-purple-400 uppercase tracking-wider mb-1">
            <Cpu className="w-3.5 h-3.5" />
            <span>Model Context Protocol (MCP)</span>
          </div>
          <h2 className="text-xl font-bold text-white">Local Stdio Protocol Inspector & Client Exporter</h2>
          <p className="text-xs text-slate-400 mt-1">
            Simulate how Claude Desktop, Cursor, and OpenCode interact with SendKit over the JSON-RPC 2.0 protocol.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs text-slate-400 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Protocol: <strong>2024-11-05</strong></span>
        </div>
      </div>

      {/* Two Column Playground */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Method Selector & Parameters */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Play className="w-4 h-4 text-purple-400" />
              <span>JSON-RPC Request Builder</span>
            </h3>

            {/* Method Tabs */}
            <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800">
              {[
                { id: 'initialize', label: 'initialize' },
                { id: 'tools/list', label: 'tools/list' },
                { id: 'tools/call', label: 'tools/call' },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => {
                    setSelectedMethod(m.id as any);
                    runRpcCall(m.id as any);
                  }}
                  className={`py-2 text-xs font-mono font-medium rounded-lg transition ${
                    selectedMethod === m.id
                      ? 'bg-purple-600 text-white font-bold shadow-md shadow-purple-600/20'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {/* If tools/call is selected, show arguments */}
            {selectedMethod === 'tools/call' ? (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Tool: <strong className="text-white font-mono">telegram</strong></span>
                  <span className="text-[10px] text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-500/20">
                    Schema Enforced
                  </span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400">arguments.chatId</label>
                  <input
                    type="text"
                    value={chatId}
                    onChange={(e) => setChatId(e.target.value)}
                    placeholder="123456789"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-100 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400">arguments.message</label>
                  <textarea
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Message payload"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-purple-500 resize-none"
                  />
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-400 space-y-1">
                  <div className="font-semibold text-slate-300">💡 Security Pattern:</div>
                  <p>
                    <code className="text-purple-300 font-mono">botToken</code> is <strong>NEVER</strong> exposed in the tool input schema. The MCP server reads it from the process environment (<code className="text-purple-300 font-mono">TELEGRAM_BOT_TOKEN</code>).
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-400">
                {selectedMethod === 'initialize' && (
                  <p>
                    Returns protocol version, server identity, and supported capabilities (<code className="text-purple-300">tools</code>, <code className="text-purple-300">resources</code>, <code className="text-purple-300">prompts</code>).
                  </p>
                )}
                {selectedMethod === 'tools/list' && (
                  <p>
                    Discovers all available agent tools and their strict JSON Schema definitions derived from Zod.
                  </p>
                )}
              </div>
            )}

            <button
              onClick={() => runRpcCall()}
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold transition flex items-center justify-center space-x-2 shadow-lg shadow-purple-600/20 disabled:opacity-50"
            >
              {loading ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Play className="w-3.5 h-3.5" />
              )}
              <span>Send JSON-RPC Request</span>
            </button>
          </div>
        </div>

        {/* Right Column: Raw JSON-RPC Response Inspector */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Code2 className="w-4 h-4 text-purple-400" />
                <h3 className="text-sm font-bold text-white">JSON-RPC 2.0 Response</h3>
              </div>

              {latency !== null && (
                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-500/30">
                  {latency}ms latency
                </span>
              )}
            </div>

            <div className="p-4 rounded-xl bg-[#080d16] border border-slate-800 text-xs font-mono text-slate-200 overflow-x-auto max-h-[420px]">
              {rpcResponse ? (
                <pre>{JSON.stringify(rpcResponse, null, 2)}</pre>
              ) : (
                <span className="text-slate-600">Waiting for request...</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Client Configuration Exporter Section */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Settings className="w-4 h-4 text-sky-400" />
              <span>1-Click MCP Client Config Exporter</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Add SendKit to your favorite AI IDEs and desktop clients with zero boilerplate.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => copyConfigText(MCP_CLIENT_CONFIGS[selectedClient].content)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition"
            >
              {copiedConfig ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Config</span>
                </>
              )}
            </button>
            <button
              onClick={() => downloadConfigFile(selectedClient)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-medium transition shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download File</span>
            </button>
          </div>
        </div>

        {/* Client Selection Tabs */}
        <div className="flex flex-wrap gap-2">
          {(Object.keys(MCP_CLIENT_CONFIGS) as (keyof typeof MCP_CLIENT_CONFIGS)[]).map((key) => {
            const cfg = MCP_CLIENT_CONFIGS[key];
            const isSelected = selectedClient === key;
            return (
              <button
                key={key}
                onClick={() => setSelectedClient(key)}
                className={`px-3.5 py-2 rounded-xl text-xs font-medium transition ${
                  isSelected
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {cfg.title}
              </button>
            );
          })}
        </div>

        {/* Config Viewer */}
        <div className="rounded-xl bg-[#080d16] border border-slate-800 overflow-hidden">
          <div className="px-4 py-2 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span className="font-mono text-slate-300">{MCP_CLIENT_CONFIGS[selectedClient].filename}</span>
            <span className="text-[11px]">{MCP_CLIENT_CONFIGS[selectedClient].path}</span>
          </div>
          <pre className="p-4 text-xs font-mono text-sky-200 overflow-x-auto">
            {MCP_CLIENT_CONFIGS[selectedClient].content}
          </pre>
        </div>
      </div>
    </div>
  );
};
