import React, { useState } from 'react';
import { 
  Sliders, 
  Plus, 
  Trash2, 
  Code2, 
  Copy, 
  Check, 
  Sparkles, 
  Layers, 
  Terminal, 
  Cpu, 
  FileText,
  Play,
  Zap,
  CheckCircle2
} from 'lucide-react';

export const CustomOperationBuilder: React.FC = () => {
  const [toolName, setToolName] = useState('discord_webhook');
  const [displayName, setDisplayName] = useState('Discord Notification');
  const [description, setDescription] = useState('Send rich notifications to a Discord channel via Webhook URL.');
  const [category, setCategory] = useState('Notifications');
  
  const [parameters, setParameters] = useState<Array<{ name: string; type: 'string' | 'number' | 'boolean'; description: string; required: boolean; defaultVal?: string }>>([
    { name: 'webhookUrl', type: 'string', description: 'Discord Webhook URL', required: true },
    { name: 'content', type: 'string', description: 'Message markdown content', required: true },
    { name: 'username', type: 'string', description: 'Bot display name', required: false, defaultVal: 'SendKit Bot' },
  ]);

  const [activeCodeTab, setActiveCodeTab] = useState<'schemas' | 'operations' | 'cli' | 'localMcp' | 'skill'>('schemas');
  const [copied, setCopied] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [testValues, setTestValues] = useState<Record<string, any>>({
    webhookUrl: 'https://discord.com/api/webhooks/1234/test',
    content: '🚀 Deployment to staging passed tests!',
    username: 'SendKit Agent',
  });

  const addParameter = () => {
    setParameters([
      ...parameters,
      { name: `param_${parameters.length + 1}`, type: 'string', description: 'Custom parameter', required: true },
    ]);
  };

  const removeParameter = (index: number) => {
    setParameters(parameters.filter((_, i) => i !== index));
  };

  const updateParameter = (index: number, key: string, val: any) => {
    const updated = [...parameters];
    (updated[index] as any)[key] = val;
    setParameters(updated);
  };

  const camelToPascal = (str: string) => {
    const camel = str.replace(/_([a-z])/g, (_, g) => g.toUpperCase());
    return camel.charAt(0).toUpperCase() + camel.slice(1);
  };

  const pascalName = camelToPascal(toolName);
  const functionName = `send${pascalName}`;

  // Generated Schemas Code
  const generatedSchemas = `import { z } from "zod";

export const ${toolName}InputSchema = z.object({
${parameters.map(p => `  ${p.name}: z.${p.type}()${p.required ? `.min(1, "${p.description} is required")` : '.optional()'},`).join('\n')}
});

export const ${toolName}OutputSchema = z.object({
  ok: z.literal(true),
  id: z.string(),
  timestamp: z.string(),
});

export type ${pascalName}Input = z.infer<typeof ${toolName}InputSchema>;
export type ${pascalName}Output = z.infer<typeof ${toolName}OutputSchema>;`;

  // Generated Operations Code
  const generatedOperations = `import {
  ${toolName}InputSchema,
  ${toolName}OutputSchema,
  type ${pascalName}Input,
  type ${pascalName}Output,
} from "./schemas";

export async function ${functionName}(
  input: ${pascalName}Input,
): Promise<${pascalName}Output> {
  const parsedInput = ${toolName}InputSchema.parse(input);

  // Reusable core operation logic
  const response = await fetch(parsedInput.webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      content: parsedInput.content,
      username: parsedInput.username ?? "SendKit Bot",
    }),
  });

  if (!response.ok) {
    throw new Error(\`${displayName} execution failed with status \${response.status}\`);
  }

  return ${toolName}OutputSchema.parse({
    ok: true,
    id: \`evt_\${Date.now()}\`,
    timestamp: new Date().toISOString(),
  });
}`;

  // Generated CLI Code
  const generatedCli = `// In packages/cli/src/index.ts
import { ${functionName} } from "@cwa-dev/sendkit-core";

program
  .command("${toolName.replace(/_/g, '-')}")
  .description("${description}")
${parameters.map(p => `  .${p.required ? 'requiredOption' : 'option'}("--${p.name.replace(/([A-Z])/g, '-$1').toLowerCase()} <${p.name}>", "${p.description}")`).join('\n')}
  .option("--json", "Output response as raw JSON")
  .action(async (options) => {
    const result = await ${functionName}({
${parameters.map(p => `      ${p.name}: options.${p.name},`).join('\n')}
    });

    if (options.json) {
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log(JSON.stringify(result));
    }
  });`;

  // Generated Local MCP Code
  const generatedLocalMcp = `// In packages/local-mcp/src/index.ts
import { ${toolName}InputSchema, ${functionName} } from "@cwa-dev/sendkit-core";

server.registerTool(
  "${toolName}",
  {
    title: "${displayName}",
    description: "${description}",
    inputSchema: ${toolName}InputSchema.shape,
  },
  async (input) => {
    const result = await ${functionName}(input);

    return {
      content: [
        {
          type: "text",
          text: \`Successfully executed ${displayName} (ID: \${result.id})\`,
        },
      ],
      structuredContent: result,
    };
  },
);`;

  // Generated Skill Markdown
  const generatedSkill = `## \`${toolName}\` Tool

Use the \`${toolName}\` MCP tool to ${description.toLowerCase()}

| Field | Type | Required | Notes |
|---|---|---|---|
${parameters.map(p => `| \`${p.name}\` | ${p.type} | ${p.required ? 'yes' : 'no'} | ${p.description} |`).join('\n')}

CLI Fallback:
\`\`\`bash
sendkit ${toolName.replace(/_/g, '-')} ${parameters.filter(p => p.required).map(p => `--${p.name.replace(/([A-Z])/g, '-$1').toLowerCase()} "<${p.name}>"`).join(' ')} --json
\`\`\``;

  const codeSnippets = {
    schemas: { code: generatedSchemas, title: 'packages/core/src/schemas.ts' },
    operations: { code: generatedOperations, title: 'packages/core/src/operations.ts' },
    cli: { code: generatedCli, title: 'packages/cli/src/index.ts' },
    localMcp: { code: generatedLocalMcp, title: 'packages/local-mcp/src/index.ts' },
    skill: { code: generatedSkill, title: 'skills/sendkit/SKILL.md' },
  };

  const copyCurrentCode = () => {
    navigator.clipboard.writeText(codeSnippets[activeCodeTab].code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const runTestOperation = () => {
    setTestResult({
      ok: true,
      id: `evt_${Date.now()}`,
      tool: toolName,
      timestamp: new Date().toISOString(),
      payload: testValues,
    });
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950/30 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-1">
            <Sliders className="w-3.5 h-3.5" />
            <span>Extensible Architecture Builder</span>
          </div>
          <h2 className="text-xl font-bold text-white">Fork & Build Your Own SendKit Tool</h2>
          <p className="text-xs text-slate-400 mt-1">
            Define any custom capability (Discord, Slack, GitHub, SendGrid, Twilio, Webhook) and generate all 5 synchronized architecture layers instantly.
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs text-indigo-300">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>5-Layer Sync</span>
        </div>
      </div>

      {/* Builder Form + Live Code Generator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Tool Specs Builder */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Zap className="w-4 h-4 text-indigo-400" />
              <span>Tool Specification</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 font-medium">Tool Identifier (snake_case)</label>
                <input
                  type="text"
                  value={toolName}
                  onChange={(e) => setToolName(e.target.value.toLowerCase().replace(/\s+/g, '_'))}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-slate-400 font-medium">Display Title</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-slate-400 font-medium">Description (Agent Facing)</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>
            </div>

            {/* Parameters List */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">Input Parameters ({parameters.length})</span>
                <button
                  onClick={addParameter}
                  className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 text-xs font-medium transition border border-indigo-500/30"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Field</span>
                </button>
              </div>

              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {parameters.map((p, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2 text-xs">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={p.name}
                        onChange={(e) => updateParameter(idx, 'name', e.target.value)}
                        placeholder="paramName"
                        className="flex-1 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 font-mono text-slate-200 focus:outline-none"
                      />
                      <select
                        value={p.type}
                        onChange={(e) => updateParameter(idx, 'type', e.target.value)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 font-mono focus:outline-none"
                      >
                        <option value="string">string</option>
                        <option value="number">number</option>
                        <option value="boolean">boolean</option>
                      </select>
                      {parameters.length > 1 && (
                        <button
                          onClick={() => removeParameter(idx)}
                          className="p-1.5 rounded-lg hover:bg-rose-950 text-slate-500 hover:text-rose-400 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      value={p.description}
                      onChange={(e) => updateParameter(idx, 'description', e.target.value)}
                      placeholder="Description for LLM tool schema"
                      className="w-full px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 focus:outline-none text-[11px]"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Synchronized Code Viewer */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-xl">
            {/* Tabs */}
            <div className="px-4 py-3 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar">
                {[
                  { id: 'schemas', label: '1. Schemas', icon: Layers },
                  { id: 'operations', label: '2. Operations', icon: Code2 },
                  { id: 'cli', label: '3. CLI Command', icon: Terminal },
                  { id: 'localMcp', label: '4. MCP Tool', icon: Cpu },
                  { id: 'skill', label: '5. Skill Spec', icon: FileText },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveCodeTab(tab.id as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                      activeCodeTab === tab.id
                        ? 'bg-indigo-600 text-white font-bold shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <button
                onClick={copyCurrentCode}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>

            {/* Path Header */}
            <div className="px-4 py-2 bg-slate-900/50 border-b border-slate-800 text-[11px] font-mono text-indigo-300">
              {codeSnippets[activeCodeTab].title}
            </div>

            {/* Code Output */}
            <pre className="p-4 sm:p-5 bg-[#080d16] text-xs font-mono text-slate-300 overflow-x-auto max-h-[420px]">
              <code>{codeSnippets[activeCodeTab].code}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
