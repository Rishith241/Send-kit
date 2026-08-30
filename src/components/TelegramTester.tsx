import React, { useState } from 'react';
import { TelegramBotInfo, TelegramSendResult } from '../types';
import { testTelegramBot, sendTelegramMessage } from '../lib/api';
import confetti from 'canvas-confetti';
import { 
  Send, 
  Key, 
  Hash, 
  MessageSquare, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Sparkles, 
  HelpCircle, 
  Bot, 
  ArrowRight,
  Code2,
  Copy,
  Check,
  Zap,
  Radio
} from 'lucide-react';

interface TelegramTesterProps {
  botToken: string;
  setBotToken: (t: string) => void;
  chatId: string;
  setChatId: (c: string) => void;
  botInfo: TelegramBotInfo | null;
  setBotInfo: (info: TelegramBotInfo | null) => void;
}

export const TelegramTester: React.FC<TelegramTesterProps> = ({
  botToken,
  setBotToken,
  chatId,
  setChatId,
  botInfo,
  setBotInfo,
}) => {
  const [message, setMessage] = useState('Hello from SendKit! Build shipped successfully 🚀');
  const [verifying, setVerifying] = useState(false);
  const [sending, setSending] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [sendResult, setSendResult] = useState<TelegramSendResult | null>(null);
  const [showGuide, setShowGuide] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleVerifyBot = async () => {
    if (!botToken.trim()) {
      setVerifyError('Please enter a Telegram Bot Token first');
      return;
    }
    setVerifying(true);
    setVerifyError(null);
    const res = await testTelegramBot(botToken);
    setVerifying(false);
    if (res.ok && res.result) {
      setBotInfo(res.result);
      setVerifyError(null);
    } else {
      setBotInfo(null);
      setVerifyError(res.error || 'Failed to verify bot token');
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!botToken.trim()) {
      setSendResult({ ok: false, chatId, messageId: 0, error: 'Telegram Bot Token is required.' });
      return;
    }
    if (!chatId.trim()) {
      setSendResult({ ok: false, chatId, messageId: 0, error: 'Chat ID is required.' });
      return;
    }
    if (!message.trim()) {
      setSendResult({ ok: false, chatId, messageId: 0, error: 'Message cannot be empty.' });
      return;
    }

    setSending(true);
    setSendResult(null);

    const result = await sendTelegramMessage(botToken, chatId, message);
    setSending(false);
    setSendResult(result);

    if (result.ok) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });
    }
  };

  const loadDemoToken = () => {
    setBotToken('demo_bot_token');
    setChatId('123456789');
    setBotInfo({
      id: 7928349182,
      is_bot: true,
      first_name: 'SendKit Demo Bot',
      username: 'sendkit_demo_bot',
      can_join_groups: true,
      can_read_all_group_messages: false,
    });
    setVerifyError(null);
  };

  const quickTemplates = [
    { title: '🚀 Build Shipped', text: 'Build #249 passed all checks and was deployed to production! 🚀' },
    { title: '⚠️ Server Alert', text: 'WARNING: CPU usage exceeded 85% on node-prod-02.' },
    { title: '🤖 Agent Notification', text: 'SendKit Agent has completed research task: 4 summaries generated.' },
    { title: '💬 Ping Test', text: 'Ping from SendKit test workbench. Stdio MCP server active.' },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900 to-sky-950/30 border border-slate-800">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-sky-400 uppercase tracking-wider mb-1">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>Telegram Bot API Test Lab</span>
          </div>
          <h2 className="text-xl font-bold text-white">Live Operation Runner</h2>
          <p className="text-xs text-slate-400 mt-1">
            Test the exact <code className="text-sky-300">sendTelegramMessage</code> core operation against the live Telegram API or in demo simulation mode.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadDemoToken}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition text-xs font-medium border border-slate-700"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Fill Sandbox Token</span>
          </button>
          <button
            onClick={() => setShowGuide(!showGuide)}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 transition text-xs font-medium border border-sky-500/30"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>{showGuide ? 'Hide Bot Guide' : 'How to get Token & ID'}</span>
          </button>
        </div>
      </div>

      {/* Guide Accordion */}
      {showGuide && (
        <div className="p-5 rounded-xl bg-slate-900 border border-sky-500/30 text-xs text-slate-300 space-y-3">
          <h4 className="font-bold text-white flex items-center space-x-2">
            <Bot className="w-4 h-4 text-sky-400" />
            <span>How to create a Telegram Bot & get your Chat ID (2 minutes)</span>
          </h4>
          <ol className="list-decimal list-inside space-y-1.5 text-slate-300 leading-relaxed">
            <li>
              Open Telegram and search for <a href="https://t.me/BotFather" target="_blank" rel="noreferrer" className="text-sky-400 underline font-medium">@BotFather</a>.
            </li>
            <li>
              Send the command <code className="px-1 py-0.5 rounded bg-slate-800 text-sky-300 font-mono">/newbot</code>, give it a name and username ending in <code className="font-mono">bot</code>.
            </li>
            <li>
              Copy the resulting HTTP API token (e.g. <code className="font-mono text-slate-400">123456789:ABCdefGHI...</code>) and paste it into the <strong>Bot Token</strong> field below.
            </li>
            <li>
              Open your newly created bot in Telegram and click <strong>Start</strong> (send it any message).
            </li>
            <li>
              To get your numeric Chat ID, message <a href="https://t.me/userinfobot" target="_blank" rel="noreferrer" className="text-sky-400 underline font-medium">@userinfobot</a> or <a href="https://t.me/raw_data_bot" target="_blank" rel="noreferrer" className="text-sky-400 underline font-medium">@raw_data_bot</a> in Telegram.
            </li>
          </ol>
        </div>
      )}

      {/* Main Grid: Bot Config & Message Sender */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Credentials & Bot Status */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Key className="w-4 h-4 text-sky-400" />
                <span>1. Telegram Bot Token</span>
              </h3>
              {botInfo && (
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Verified
                </span>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs text-slate-400">Bot Token (from @BotFather)</label>
              <div className="flex gap-2">
                <input
                  type="password"
                  value={botToken}
                  onChange={(e) => setBotToken(e.target.value)}
                  placeholder="e.g. 123456789:ABCdefGHI..."
                  className="flex-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-100 placeholder-slate-600 focus:outline-none focus:border-sky-500"
                />
                <button
                  onClick={handleVerifyBot}
                  disabled={verifying}
                  className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-medium transition flex items-center space-x-1.5 disabled:opacity-50"
                >
                  {verifying ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  )}
                  <span>Verify</span>
                </button>
              </div>
            </div>

            {verifyError && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div className="leading-snug">{verifyError}</div>
              </div>
            )}

            {botInfo && (
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Bot ID:</span>
                  <span className="font-mono text-slate-200">{botInfo.id}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Bot Name:</span>
                  <span className="font-semibold text-white">{botInfo.first_name}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Username:</span>
                  <span className="font-mono text-sky-400">@{botInfo.username || 'n/a'}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Group Messages:</span>
                  <span className="text-emerald-400">{botInfo.can_join_groups ? 'Allowed' : 'Disabled'}</span>
                </div>
              </div>
            )}
          </div>

          {/* Chat ID Input Card */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Hash className="w-4 h-4 text-sky-400" />
              <span>2. Target Chat ID</span>
            </h3>
            <div className="space-y-2">
              <label className="text-xs text-slate-400">Chat or Group ID</label>
              <input
                type="text"
                value={chatId}
                onChange={(e) => setChatId(e.target.value)}
                placeholder="e.g. 123456789 or -100123456789"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-100 placeholder-slate-600 focus:outline-none focus:border-sky-500"
              />
              <p className="text-[11px] text-slate-500">
                You must have previously clicked "Start" in the bot's private chat before it can send you messages.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Message Composer & Response Inspector */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <MessageSquare className="w-4 h-4 text-sky-400" />
                <span>3. Message Composer</span>
              </h3>
              <span className="text-[11px] text-slate-400 font-mono">
                {message.length} chars
              </span>
            </div>

            {/* Quick Template Chips */}
            <div className="flex flex-wrap gap-1.5">
              {quickTemplates.map((tpl, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setMessage(tpl.text)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-medium transition border border-slate-700"
                >
                  {tpl.title}
                </button>
              ))}
            </div>

            {/* Textarea */}
            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message here..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-sky-500 resize-none font-sans"
            />

            <div className="flex items-center justify-between pt-2">
              <div className="text-[11px] text-slate-400">
                Calls <code className="text-sky-300 font-mono">sendTelegramMessage(options)</code>
              </div>
              <button
                onClick={handleSendMessage}
                disabled={sending}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs font-bold transition shadow-lg shadow-sky-500/20 flex items-center space-x-2 disabled:opacity-50"
              >
                {sending ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                <span>{sending ? 'Sending...' : 'Send Message'}</span>
              </button>
            </div>
          </div>

          {/* Delivery Inspector */}
          {sendResult && (
            <div className={`p-5 rounded-2xl border transition-all ${
              sendResult.ok
                ? 'bg-emerald-950/20 border-emerald-500/30'
                : 'bg-rose-950/20 border-rose-500/30'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  {sendResult.ok ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-400" />
                  )}
                  <span className={`text-xs font-bold ${sendResult.ok ? 'text-emerald-300' : 'text-rose-300'}`}>
                    {sendResult.ok ? 'Message Delivered Successfully' : 'Delivery Failed'}
                  </span>
                  {sendResult.simulated && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-medium">
                      Sandbox Simulation
                    </span>
                  )}
                </div>
              </div>

              {sendResult.ok ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
                      <div className="text-[10px] text-slate-500 uppercase font-semibold">Message ID</div>
                      <div className="text-sm font-mono font-bold text-white mt-0.5">{sendResult.messageId}</div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
                      <div className="text-[10px] text-slate-500 uppercase font-semibold">Target Chat</div>
                      <div className="text-sm font-mono font-bold text-slate-200 mt-0.5">{sendResult.chatId}</div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 col-span-2 sm:col-span-1">
                      <div className="text-[10px] text-slate-500 uppercase font-semibold">Status</div>
                      <div className="text-sm font-bold text-emerald-400 mt-0.5">200 OK</div>
                    </div>
                  </div>

                  {sendResult.rawResponse && (
                    <div className="mt-3">
                      <div className="text-[11px] font-mono text-slate-400 mb-1">Raw Telegram API Response:</div>
                      <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto max-h-40">
                        {JSON.stringify(sendResult.rawResponse, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-xs text-rose-300 space-y-2">
                  <p>{sendResult.error}</p>
                  {sendResult.rawResponse && (
                    <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-rose-200 overflow-x-auto">
                      {JSON.stringify(sendResult.rawResponse, null, 2)}
                    </pre>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
