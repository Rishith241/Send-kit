import React, { useState } from 'react';
import { 
  Github, 
  Key, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  Copy, 
  Check, 
  Sparkles, 
  Terminal, 
  Tag, 
  FileText, 
  FolderGit2,
  HelpCircle,
  Play,
  RotateCcw
} from 'lucide-react';
import { createGithubIssueApi, testGithubToken } from '../lib/api';
import confetti from 'canvas-confetti';

export const GithubIssueTester: React.FC = () => {
  const [githubToken, setGithubToken] = useState('demo_github_token');
  const [repo, setRepo] = useState('Rishith241/sendkit');
  const [title, setTitle] = useState('Bug: Memory leak in worker process during high load');
  const [body, setBody] = useState(`### Description\nAutonomous agent detected elevated memory usage after processing 500 consecutive requests.\n\n### Steps to Reproduce\n1. Run benchmark load suite\n2. Inspect RSS metrics\n\n*Filed automatically via SendKit Agent*`);
  const [labelsInput, setLabelsInput] = useState('bug, agent-reported');
  
  const [verifyingToken, setVerifyingToken] = useState(false);
  const [tokenUser, setTokenUser] = useState<any>({
    login: 'octocat-agent',
    name: 'SendKit Agent User',
    avatar_url: 'https://avatars.githubusercontent.com/u/583231?v=4',
    scopes: ['repo', 'issues:write'],
  });
  const [tokenError, setTokenError] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [copiedCmd, setCopiedCmd] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string>('bug');

  const handleVerifyToken = async () => {
    if (!githubToken.trim()) {
      setTokenError('Please enter a GitHub Personal Access Token');
      return;
    }
    setVerifyingToken(true);
    setTokenError(null);
    const res = await testGithubToken(githubToken.trim());
    setVerifyingToken(false);
    if (res.ok && res.user) {
      setTokenUser(res.user);
      setTokenError(null);
    } else {
      setTokenError(res.error || 'Failed to verify token');
      setTokenUser(null);
    }
  };

  const handleCreateIssue = async () => {
    if (!repo.trim() || !title.trim()) {
      setSubmitError('Repository (owner/repo) and issue title are required.');
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    setResult(null);

    const labels = labelsInput
      .split(',')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    const res = await createGithubIssueApi({
      githubToken: githubToken.trim(),
      repo: repo.trim(),
      title: title.trim(),
      body: body.trim() || undefined,
      labels: labels.length > 0 ? labels : undefined,
    });

    setSubmitting(false);

    if (res.ok) {
      setResult(res);
      setSubmitError(null);
      try {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#38bdf8', '#3b82f6', '#10b981', '#a855f7'],
        });
      } catch {}
    } else {
      setSubmitError(res.error || 'Failed to create GitHub issue');
    }
  };

  const setPreset = (type: 'bug' | 'feature' | 'docs') => {
    setSelectedPreset(type);
    if (type === 'bug') {
      setTitle('Bug: Memory leak in worker process during high load');
      setBody('### Summary\nAgent detected an unhandled exception or memory spike.\n\n*Created by SendKit Core*');
      setLabelsInput('bug, high-priority');
    } else if (type === 'feature') {
      setTitle('Feature: Add Discord & Slack webhook adapters');
      setBody('### Feature Proposal\nExtend SendKit Core schemas to support Discord and Slack multi-channel notifications.\n\n*Created by SendKit Core*');
      setLabelsInput('enhancement, proposal');
    } else if (type === 'docs') {
      setTitle('Docs: Update RFC 9728 protected resource metadata spec');
      setBody('### Documentation Task\nUpdate Remote MCP specification to RFC 9728 in README and interview sheets.\n\n*Created by SendKit Core*');
      setLabelsInput('documentation');
    }
  };

  const powerShellCommand = `bun run ./packages/cli/src/index.ts github-issue "${repo}" "${title.replace(/"/g, '\\"')}" --labels ${labelsInput.replace(/,/g, '')} --json`;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950/60 p-6 md:p-8 border border-slate-700/60 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                <Github className="w-6 h-6" />
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                GitHub Issue Creator Lab
              </h1>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                @sendkit/core
              </span>
            </div>
            <p className="text-slate-300 text-sm md:text-base max-w-2xl">
              File bugs, tasks, and feature proposals directly into GitHub repositories. Seamlessly switch between the visual test bench, the PowerShell CLI command, or autonomous MCP Agent calls.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setPreset('bug')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedPreset === 'bug'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 border border-slate-700'
              }`}
            >
              Preset: Bug Report
            </button>
            <button
              onClick={() => setPreset('feature')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedPreset === 'feature'
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                  : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 border border-slate-700'
              }`}
            >
              Preset: Feature Request
            </button>
            <button
              onClick={() => setPreset('docs')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedPreset === 'docs'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                  : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 border border-slate-700'
              }`}
            >
              Preset: Docs Task
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Form + Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Input Form (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-[#0f172a]/90 rounded-2xl border border-slate-800 p-6 shadow-lg space-y-5">
            <h2 className="text-lg font-bold text-white flex items-center justify-between">
              <span>Issue Configuration</span>
              <span className="text-xs text-slate-400 font-normal">HTTP REST API / v3</span>
            </h2>

            {/* Token Input */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-amber-400" />
                  GitHub Personal Access Token (PAT)
                </span>
                <span className="text-[11px] text-slate-500">
                  Default: <code className="text-amber-300/80">demo_github_token</code> (Simulated)
                </span>
              </label>
              <div className="flex gap-2">
                <input
                  type="password"
                  value={githubToken}
                  onChange={(e) => setGithubToken(e.target.value)}
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxx or demo_github_token"
                  className="flex-1 bg-slate-950/80 border border-slate-700/80 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 font-mono"
                />
                <button
                  onClick={handleVerifyToken}
                  disabled={verifyingToken}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-xs font-semibold text-slate-200 transition-colors flex items-center gap-1.5"
                >
                  {verifyingToken ? (
                    <span className="animate-spin">⏳</span>
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  )}
                  Verify
                </button>
              </div>
              {tokenError && (
                <p className="text-xs text-rose-400 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {tokenError}
                </p>
              )}
              {tokenUser && (
                <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-500/20 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <img
                      src={tokenUser.avatar_url}
                      alt={tokenUser.login}
                      className="w-5 h-5 rounded-full border border-emerald-400/40"
                    />
                    <span className="text-emerald-300 font-semibold font-mono">@{tokenUser.login}</span>
                    <span className="text-slate-400">({tokenUser.name})</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-mono">
                    issues:write ✓
                  </span>
                </div>
              )}
            </div>

            {/* Target Repository */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <FolderGit2 className="w-3.5 h-3.5 text-sky-400" />
                Target Repository (owner/repo)
              </label>
              <input
                type="text"
                value={repo}
                onChange={(e) => setRepo(e.target.value)}
                placeholder="e.g. Rishith241/sendkit or owner/repo"
                className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 font-mono"
              />
            </div>

            {/* Title */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-purple-400" />
                Issue Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Brief summary of the issue..."
                className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 font-sans font-medium"
              />
            </div>

            {/* Body */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  Issue Body (Markdown Supported)
                </span>
                <span className="text-[11px] text-slate-500">Optional</span>
              </label>
              <textarea
                rows={4}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Detailed description, reproduction steps, agent logs..."
                className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 font-mono text-xs"
              />
            </div>

            {/* Labels */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-emerald-400" />
                Labels (Comma-separated)
              </label>
              <input
                type="text"
                value={labelsInput}
                onChange={(e) => setLabelsInput(e.target.value)}
                placeholder="bug, agent-reported, high-priority"
                className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 font-mono text-xs"
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-2">
              <button
                onClick={handleCreateIssue}
                disabled={submitting}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-sky-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    <span>Creating GitHub Issue...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Create Issue on GitHub</span>
                  </>
                )}
              </button>
            </div>

            {submitError && (
              <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{submitError}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live Outcome / PowerShell Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Result Card */}
          <div className="bg-[#0f172a]/90 rounded-2xl border border-slate-800 p-6 shadow-lg space-y-4">
            <h3 className="text-sm font-bold text-slate-200 flex items-center justify-between">
              <span>Execution Output</span>
              {result && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  HTTP 201 Created
                </span>
              )}
            </h3>

            {result ? (
              <div className="space-y-4 animate-fadeIn">
                <div className="p-4 rounded-xl bg-slate-900 border border-emerald-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-emerald-400 font-bold">
                      Issue #{result.issueNumber}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 uppercase">
                      {result.state || 'open'}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white">{result.title}</h4>
                  <p className="text-xs text-slate-400 font-mono">Repo: {result.repo}</p>
                  <a
                    href={result.issueUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-400 hover:text-sky-300 underline"
                  >
                    <span>View Issue on GitHub</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                {/* Structured JSON Response */}
                <div className="space-y-1">
                  <div className="text-[11px] font-semibold text-slate-400">Structured Output (`@sendkit/core`):</div>
                  <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-emerald-300 overflow-x-auto">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="p-8 rounded-xl bg-slate-950/60 border border-dashed border-slate-800 text-center space-y-2 text-slate-400">
                <Sparkles className="w-8 h-8 mx-auto text-slate-600" />
                <p className="text-xs">Click <strong>Create Issue on GitHub</strong> to run the operation and see the real-time API response.</p>
              </div>
            )}
          </div>

          {/* PowerShell Equivalent Card */}
          <div className="bg-[#0f172a]/90 rounded-2xl border border-slate-800 p-5 shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-sky-400" />
                <span>Equivalent PowerShell Command</span>
              </h3>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(powerShellCommand);
                  setCopiedCmd(true);
                  setTimeout(() => setCopiedCmd(false), 2000);
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-semibold flex items-center gap-1 transition-colors border border-slate-700"
              >
                {copiedCmd ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy Command</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-[11px] font-mono text-sky-300 overflow-x-auto whitespace-pre-wrap break-all">
              {powerShellCommand}
            </pre>
            <p className="text-[11px] text-slate-400">
              Run this in your PowerShell terminal to execute the identical command from your local machine.
            </p>
          </div>
        </div>
      </div>

      {/* Educational Guide: How It Works */}
      <div className="rounded-2xl bg-[#0b101b] border border-slate-800 p-6 md:p-8 space-y-6">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-indigo-400" />
          <span>How SendKit GitHub Issue Creator Works (In Plain English)</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs text-slate-300">
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="w-6 h-6 rounded-lg bg-sky-500/20 text-sky-400 font-bold flex items-center justify-center text-xs">
              1
            </div>
            <h3 className="font-bold text-white text-sm">One Core Engine</h3>
            <p className="text-slate-400 leading-relaxed">
              `createGithubIssue` is implemented once inside `@sendkit/core` with strict Zod validation (`repo`, `title`, `body`, `labels`).
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-400 font-bold flex items-center justify-center text-xs">
              2
            </div>
            <h3 className="font-bold text-white text-sm">Dual Interface</h3>
            <p className="text-slate-400 leading-relaxed">
              AI agents call the MCP tool (`github_issue`) automatically via JSON-RPC, while developers or CI pipelines call `sendkit github-issue` via PowerShell / Bash.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-xs">
              3
            </div>
            <h3 className="font-bold text-white text-sm">Actionable Errors</h3>
            <p className="text-slate-400 leading-relaxed">
              HTTP errors like 401 (expired token), 403 (insufficient scopes), or 404 (typo in repo name) return crystal-clear corrective instructions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
