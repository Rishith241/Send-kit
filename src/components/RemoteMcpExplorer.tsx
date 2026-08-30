import React, { useState } from 'react';
import { 
  Globe, 
  ShieldCheck, 
  Key, 
  Lock, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  Code2, 
  Copy, 
  Check,
  Zap,
  Layers,
  ArrowRight
} from 'lucide-react';

interface RemoteMcpExplorerProps {
  botToken: string;
}

export const RemoteMcpExplorer: React.FC<RemoteMcpExplorerProps> = ({ botToken }) => {
  const [activeEndpoint, setActiveEndpoint] = useState<'metadata' | 'postMcp'>('metadata');
  const [bearerToken, setBearerToken] = useState('clerk_oauth_test_token_valid');
  const [sendAuthHeader, setSendAuthHeader] = useState(true);
  const [loading, setLoading] = useState(false);
  const [responseOutput, setResponseOutput] = useState<any>(null);
  const [responseHeaders, setResponseHeaders] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  const effectiveBotToken = botToken || '123456789:ABCdefGHI_DemoToken';

  const testEndpoint = async () => {
    setLoading(true);
    try {
      if (activeEndpoint === 'metadata') {
        const res = await fetch(`/.well-known/oauth-protected-resource/${encodeURIComponent(effectiveBotToken)}/mcp`);
        const json = await res.json();
        setStatus(res.status);
        setResponseHeaders({
          'content-type': res.headers.get('content-type') || 'application/json',
          'access-control-allow-origin': '*',
        });
        setResponseOutput(json);
      } else {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        if (sendAuthHeader && bearerToken) {
          headers['Authorization'] = `Bearer ${bearerToken}`;
        }

        const res = await fetch(`/${encodeURIComponent(effectiveBotToken)}/mcp`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'tools/call',
            params: {
              name: 'telegram',
              arguments: {
                chatId: '123456789',
                message: 'Hello from Remote MCP HTTP Server with Clerk OAuth!',
              },
            },
          }),
        });

        setStatus(res.status);
        const headerObj: Record<string, string> = {};
        res.headers.forEach((val, key) => {
          headerObj[key] = val;
        });
        setResponseHeaders(headerObj);
        const json = await res.json();
        setResponseOutput(json);
      }
    } catch (err: any) {
      setStatus(500);
      setResponseOutput({ error: err.message });
    }
    setLoading(false);
  };

  const copyText = (t: string) => {
    navigator.clipboard.writeText(t);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 to-teal-950/30 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-teal-400 uppercase tracking-wider mb-1">
            <Globe className="w-3.5 h-3.5" />
            <span>Remote MCP & Clerk OAuth</span>
          </div>
          <h2 className="text-xl font-bold text-white">Remote HTTP MCP Endpoint & OAuth Protection</h2>
          <p className="text-xs text-slate-400 mt-1">
            Explore <code className="text-teal-300">apps/remote-mcp</code> with per-request Bot Token path routing (<code className="text-teal-300">POST /:botToken/mcp</code>) and Clerk OAuth RFC 9470 protected resource metadata.
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs text-slate-300">
          <Lock className="w-3.5 h-3.5 text-teal-400" />
          <span>Clerk Protected</span>
        </div>
      </div>

      {/* Interactive Tester */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Request Options */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Zap className="w-4 h-4 text-teal-400" />
              <span>HTTP Request Simulator</span>
            </h3>

            <div className="space-y-2">
              <label className="text-xs text-slate-400">Select Endpoint</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setActiveEndpoint('metadata');
                    setResponseOutput(null);
                  }}
                  className={`p-2.5 rounded-xl text-left text-xs font-medium border transition ${
                    activeEndpoint === 'metadata'
                      ? 'bg-teal-950/50 border-teal-500 text-teal-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="font-bold text-[11px] text-sky-400">GET Metadata</div>
                  <div className="font-mono text-[10px] truncate">/.well-known/oauth...</div>
                </button>

                <button
                  onClick={() => {
                    setActiveEndpoint('postMcp');
                    setResponseOutput(null);
                  }}
                  className={`p-2.5 rounded-xl text-left text-xs font-medium border transition ${
                    activeEndpoint === 'postMcp'
                      ? 'bg-teal-950/50 border-teal-500 text-teal-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="font-bold text-[11px] text-emerald-400">POST MCP Call</div>
                  <div className="font-mono text-[10px] truncate">/:botToken/mcp</div>
                </button>
              </div>
            </div>

            {activeEndpoint === 'postMcp' && (
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-slate-400">Include Authorization Header</label>
                  <input
                    type="checkbox"
                    checked={sendAuthHeader}
                    onChange={(e) => setSendAuthHeader(e.target.checked)}
                    className="w-4 h-4 accent-teal-500 rounded cursor-pointer"
                  />
                </div>

                {sendAuthHeader && (
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-500 font-mono">Authorization: Bearer &lt;token&gt;</label>
                    <input
                      type="text"
                      value={bearerToken}
                      onChange={(e) => setBearerToken(e.target.value)}
                      placeholder="OAuth token (try 'invalid_token' to test 401)"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 focus:outline-none focus:border-teal-500"
                    />
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => setBearerToken('clerk_oauth_test_token_valid')}
                        className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-emerald-300 hover:bg-slate-700"
                      >
                        Valid Token
                      </button>
                      <button
                        onClick={() => setBearerToken('invalid_token')}
                        className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-rose-300 hover:bg-slate-700"
                      >
                        Invalid (Test 401)
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={testEndpoint}
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition flex items-center justify-center space-x-2 shadow-lg shadow-teal-600/20 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Remote HTTP Request</span>
            </button>
          </div>
        </div>

        {/* Right: Response Inspector */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Code2 className="w-4 h-4 text-teal-400" />
                <h3 className="text-sm font-bold text-white">HTTP Response Inspector</h3>
              </div>

              {status !== null && (
                <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full ${
                  status === 200
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                    : 'bg-rose-950 text-rose-300 border border-rose-500/30'
                }`}>
                  HTTP {status} {status === 200 ? 'OK' : status === 401 ? 'Unauthorized' : ''}
                </span>
              )}
            </div>

            {/* Response Headers */}
            {Object.keys(responseHeaders).length > 0 && (
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-[11px] font-mono text-slate-400">
                {Object.entries(responseHeaders).map(([k, v]) => (
                  <div key={k} className="truncate">
                    <span className="text-slate-500 font-semibold">{k}:</span> <span className="text-teal-300">{v}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Response Body */}
            <div className="p-4 rounded-xl bg-[#080d16] border border-slate-800 text-xs font-mono text-slate-200 overflow-x-auto max-h-[340px]">
              {responseOutput ? (
                <pre>{JSON.stringify(responseOutput, null, 2)}</pre>
              ) : (
                <span className="text-slate-600">Click "Send Remote HTTP Request" to test endpoint response.</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Claude Web vs ChatGPT OAuth Integration Guide */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-6">
        <h3 className="text-base font-bold text-white flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Client OAuth Behavior: Claude Web vs. ChatGPT</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center space-x-2">
              <span className="w-6 h-6 rounded-md bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xs">
                C
              </span>
              <h4 className="text-sm font-bold text-white">Claude Web Integration</h4>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Connects seamlessly out of the box using <strong>OAuth Dynamic Client Registration (RFC 7591)</strong>.
            </p>
            <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
              <li>Enable Dynamic Client Registration in Clerk Dashboard.</li>
              <li>Claude queries <code className="text-purple-300 font-mono">/.well-known/oauth-protected-resource</code>.</li>
              <li>Registers its client credentials automatically.</li>
              <li>No manual Client ID / Secret copying required!</li>
            </ul>
          </div>

          <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center space-x-2">
              <span className="w-6 h-6 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                G
              </span>
              <h4 className="text-sm font-bold text-white">ChatGPT Connectors Integration</h4>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              ChatGPT does not support automatic dynamic registration; configure a manual OAuth Client in Clerk.
            </p>
            <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
              <li>Create OAuth Application in Clerk Dashboard.</li>
              <li>Add ChatGPT's redirect/callback URI to Allowed Redirects.</li>
              <li>Provide resulting <strong>Client ID</strong> & <strong>Client Secret</strong> in ChatGPT.</li>
              <li>ChatGPT safely negotiates user authentication.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
