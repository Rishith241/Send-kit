import React, { useState } from 'react';
import { 
  Sparkles, 
  Bot, 
  Send, 
  Cpu, 
  Terminal, 
  CheckCircle2, 
  ArrowRight, 
  Code2, 
  FileText,
  Workflow,
  Radio
} from 'lucide-react';

export const SkillAgentSandbox: React.FC = () => {
  const [userPrompt, setUserPrompt] = useState('Send Rishith a Telegram message saying the build shipped.');
  const [mcpAvailable, setMcpAvailable] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [agentDecision, setAgentDecision] = useState<{
    interfaceChosen: 'MCP' | 'CLI';
    reason: string;
    toolCall?: any;
    cliCommand?: string;
    executionLog: string[];
  } | null>(null);

  const samplePrompts = [
    'Send Rishith a Telegram message saying the build shipped.',
    'Alert the dev team in chat 987654321 that database migration is complete.',
    'Verify if SendKit works by sending a test message to chat 123456789 from the terminal.',
    'Send a notification to user 555000: "Deployment v2.4 passed all staging tests".',
  ];

  const handleSimulateAgent = () => {
    setAnalyzing(true);
    setAgentDecision(null);

    setTimeout(() => {
      // Extract chat ID and message from prompt
      let detectedChatId = '123456789';
      let detectedMessage = 'The build shipped.';

      const chatMatch = userPrompt.match(/(?:chat|user|id)\s+([0-9\-]+)/i);
      if (chatMatch) {
        detectedChatId = chatMatch[1];
      }

      const quoteMatch = userPrompt.match(/["']([^"']+)["']/);
      if (quoteMatch) {
        detectedMessage = quoteMatch[1];
      } else if (userPrompt.toLowerCase().includes('build shipped')) {
        detectedMessage = 'The build shipped.';
      } else {
        detectedMessage = userPrompt.replace(/^Send\s+/i, '');
      }

      const isCliExplicit = userPrompt.toLowerCase().includes('terminal') || 
                            userPrompt.toLowerCase().includes('cli') || 
                            userPrompt.toLowerCase().includes('verify') ||
                            !mcpAvailable;

      if (!isCliExplicit && mcpAvailable) {
        setAgentDecision({
          interfaceChosen: 'MCP',
          reason: 'MCP server `sendkit` is active in environment. Per SKILL.md guidelines, prefer the MCP `telegram` tool for direct structured execution without shell overhead.',
          toolCall: {
            server: 'sendkit',
            tool: 'telegram',
            arguments: {
              chatId: detectedChatId,
              message: detectedMessage,
            },
          },
          executionLog: [
            '1. Ingested user prompt: "' + userPrompt + '"',
            '2. Consulted SKILL.md rules for `sendkit`',
            '3. Detected active stdio MCP server connection',
            '4. Extracted parameter chatId: "' + detectedChatId + '"',
            '5. Extracted parameter message: "' + detectedMessage + '"',
            '6. Verified `botToken` is omitted from tool payload (supplied securely via MCP environment)',
            '7. Dispatched MCP tool call -> `telegram`',
          ],
        });
      } else {
        setAgentDecision({
          interfaceChosen: 'CLI',
          reason: mcpAvailable 
            ? 'User explicitly requested terminal/CLI verification. Per SKILL.md, fallback to `@sendkit/cli` CLI with `--json` flag.' 
            : 'MCP server is disconnected in current session. Per SKILL.md, gracefully fall back to `sendkit telegram` command.',
          cliCommand: `sendkit telegram "${detectedChatId}" "${detectedMessage}" --json`,
          executionLog: [
            '1. Ingested user prompt: "' + userPrompt + '"',
            '2. Consulted SKILL.md rules for `sendkit`',
            '3. Evaluated interface availability -> MCP unavailable or explicit terminal request',
            '4. Selected CLI fallback adapter `@sendkit/cli`',
            '5. Appended `--json` flag for machine-readable stdout parsing',
            '6. Prepared command -> `sendkit telegram`',
          ],
        });
      }

      setAnalyzing(false);
    }, 450);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 to-rose-950/30 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-rose-400 uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Agent Skill Reasoning Sandbox</span>
          </div>
          <h2 className="text-xl font-bold text-white">SKILL.md Instruction Simulation</h2>
          <p className="text-xs text-slate-400 mt-1">
            Test how Claude, Gemini, or custom LLM agents interpret <code className="text-rose-300">skills/sendkit/SKILL.md</code> to choose between MCP and CLI workflows.
          </p>
        </div>

        <div className="flex items-center space-x-3 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
          <span className="text-slate-400">MCP Connection:</span>
          <button
            onClick={() => setMcpAvailable(!mcpAvailable)}
            className={`px-2 py-0.5 rounded font-medium text-[11px] transition ${
              mcpAvailable ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
            }`}
          >
            {mcpAvailable ? 'Active' : 'Offline (Force CLI)'}
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Prompt Input */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Bot className="w-4 h-4 text-rose-400" />
              <span>Agent Prompt Input</span>
            </h3>

            {/* Samples */}
            <div className="space-y-1.5">
              <span className="text-[11px] text-slate-400 font-medium">Try Sample Prompts:</span>
              <div className="space-y-1">
                {samplePrompts.map((sp, i) => (
                  <button
                    key={i}
                    onClick={() => setUserPrompt(sp)}
                    className="w-full text-left p-2 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white text-xs border border-slate-800/80 transition truncate"
                  >
                    "{sp}"
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <label className="text-xs text-slate-400 font-medium">Custom User Prompt</label>
              <textarea
                rows={3}
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                placeholder="Ask the agent to send a message..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-rose-500 resize-none font-sans"
              />
            </div>

            <button
              onClick={handleSimulateAgent}
              disabled={analyzing || !userPrompt.trim()}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white text-xs font-bold transition flex items-center justify-center space-x-2 shadow-lg shadow-rose-600/20 disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Run Agent Decision Simulation</span>
            </button>
          </div>
        </div>

        {/* Right: Agent Reasoning & Decision */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Workflow className="w-4 h-4 text-rose-400" />
                <h3 className="text-sm font-bold text-white">Agent Decision & Tool Call</h3>
              </div>

              {agentDecision && (
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                  agentDecision.interfaceChosen === 'MCP'
                    ? 'bg-purple-950 text-purple-300 border border-purple-500/30'
                    : 'bg-amber-950 text-amber-300 border border-amber-500/30'
                }`}>
                  Selected: {agentDecision.interfaceChosen} Interface
                </span>
              )}
            </div>

            {agentDecision ? (
              <div className="space-y-4">
                {/* Rationale */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                  <span className="font-bold text-white">Reasoning: </span>
                  {agentDecision.reason}
                </div>

                {/* Structured Tool Call or CLI Command */}
                {agentDecision.toolCall && (
                  <div className="space-y-1.5">
                    <div className="text-xs font-semibold text-purple-300 flex items-center space-x-1.5">
                      <Cpu className="w-3.5 h-3.5" />
                      <span>Generated MCP Tool Call Object:</span>
                    </div>
                    <pre className="p-3.5 rounded-xl bg-[#080d16] border border-slate-800 text-xs font-mono text-purple-200 overflow-x-auto">
                      {JSON.stringify(agentDecision.toolCall, null, 2)}
                    </pre>
                  </div>
                )}

                {agentDecision.cliCommand && (
                  <div className="space-y-1.5">
                    <div className="text-xs font-semibold text-amber-300 flex items-center space-x-1.5">
                      <Terminal className="w-3.5 h-3.5" />
                      <span>Generated CLI Fallback Execution:</span>
                    </div>
                    <pre className="p-3.5 rounded-xl bg-[#080d16] border border-slate-800 text-xs font-mono text-amber-200 overflow-x-auto">
                      {agentDecision.cliCommand}
                    </pre>
                  </div>
                )}

                {/* Step trace log */}
                <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Agent Evaluation Trace:</span>
                  <div className="space-y-1">
                    {agentDecision.executionLog.map((step, idx) => (
                      <div key={idx} className="text-[11px] font-mono text-slate-400">
                        {step}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-500">
                Click "Run Agent Decision Simulation" to see how the agent reasons with SendKit's Skill specification.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
