import React, { useState } from 'react';
import { 
  BookOpen, 
  Github, 
  Terminal, 
  Copy, 
  Check, 
  Globe, 
  Package, 
  CheckCircle2, 
  ShieldCheck, 
  Rocket, 
  ArrowRight,
  ExternalLink,
  Sparkles,
  User,
  Eye,
  Code2,
  Palette,
  Layers,
  Heart
} from 'lucide-react';

export const GitHubDeployGuide: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'deploy'>('profile');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  // Profile Customizer State
  const [username, setUsername] = useState('Rishith241');
  const [fullName, setFullName] = useState('Rishi Vedangi');
  const [title, setTitle] = useState('Full-Stack & AI Systems Developer | Open Source Enthusiast');
  const [typingLines, setTypingLines] = useState('Building Agentic AI Tools;Mastering Model Context Protocol (MCP);Crafting High-Performance Web Apps;TypeScript | React | Node.js | Python');
  const [theme, setTheme] = useState('tokyonight');
  const [email, setEmail] = useState('rishi.vedangi@gmail.com');
  const [linkedin, setLinkedin] = useState('rishivedangi');
  const [twitter, setTwitter] = useState('rishivedangi');

  const [selectedTech, setSelectedTech] = useState<string[]>([
    'TypeScript', 'JavaScript', 'React', 'Next.js', 'Node.js', 'Bun', 'Tailwind_CSS', 'Python', 'Docker', 'Git'
  ]);

  const allTechOptions = [
    { name: 'TypeScript', color: '3178C6', logo: 'typescript', logoColor: 'white' },
    { name: 'JavaScript', color: 'F7DF1E', logo: 'javascript', logoColor: 'black' },
    { name: 'React', color: '20232A', logo: 'react', logoColor: '61DAFB' },
    { name: 'Next.js', color: '000000', logo: 'nextdotjs', logoColor: 'white' },
    { name: 'Node.js', color: '339933', logo: 'nodedotjs', logoColor: 'white' },
    { name: 'Bun', color: '000000', logo: 'bun', logoColor: 'white' },
    { name: 'Tailwind_CSS', color: '38B2AC', logo: 'tailwind-css', logoColor: 'white' },
    { name: 'Python', color: '3776AB', logo: 'python', logoColor: 'white' },
    { name: 'PostgreSQL', color: '4169E1', logo: 'postgresql', logoColor: 'white' },
    { name: 'MongoDB', color: '47A248', logo: 'mongodb', logoColor: 'white' },
    { name: 'Docker', color: '2496ED', logo: 'docker', logoColor: 'white' },
    { name: 'Kubernetes', color: '326CE5', logo: 'kubernetes', logoColor: 'white' },
    { name: 'AWS', color: '232F3E', logo: 'amazonwebservices', logoColor: 'white' },
    { name: 'Google_Cloud', color: '4285F4', logo: 'googlecloud', logoColor: 'white' },
    { name: 'GraphQL', color: 'E10098', logo: 'graphql', logoColor: 'white' },
    { name: 'Git', color: 'F05032', logo: 'git', logoColor: 'white' },
  ];

  const toggleTech = (techName: string) => {
    if (selectedTech.includes(techName)) {
      setSelectedTech(selectedTech.filter(t => t !== techName));
    } else {
      setSelectedTech([...selectedTech, techName]);
    }
  };

  const generateProfileMarkdown = () => {
    const encodedTyping = encodeURIComponent(typingLines).replace(/%3B/g, ';');
    const safeUser = username || 'your-username';

    const badgesMarkdown = selectedTech.map(tName => {
      const opt = allTechOptions.find(o => o.name === tName);
      if (!opt) return '';
      return `<img src="https://img.shields.io/badge/${opt.name}-${opt.color}?style=for-the-badge&logo=${opt.logo}&logoColor=${opt.logoColor}" alt="${opt.name}" />`;
    }).join(' ');

    return `# Hi there, I'm ${fullName || 'Developer'} 👋
### 🚀 ${title}

<p align="left">
  <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=20&pause=1000&color=38BDF8&width=500&lines=${encodedTyping}" alt="Typing SVG" />
</p>

---

### 💫 About Me

- 🔭 I’m currently building **[SendKit](https://github.com/${safeUser}/sendkit)** — an agent tooling framework for MCP, CLI & Agent Skills.
- 🧠 Deep diving into **AI Agents, LLM Tooling, and the Model Context Protocol (MCP)**.
- ⚡ Focus: **TypeScript, React, Next.js, Node.js, Cloud & AI Systems**.
- 💬 Ask me about **Full-Stack development, AI integrations, and developer toolkits**.
- 📫 Reach out: **${email || 'your-email@gmail.com'}**

---

### 🛠️ Tech Stack & Tools

<p align="left">
  ${badgesMarkdown}
</p>

---

### 📊 GitHub Activity & Stats

<p align="left">
  <img src="https://github-readme-stats.vercel.app/api?username=${safeUser}&show_icons=true&theme=${theme}&hide_border=true&count_private=true" alt="GitHub Stats" height="165" />
  <img src="https://github-readme-stats.vercel.app/api/top-langs/?username=${safeUser}&layout=compact&theme=${theme}&hide_border=true" alt="Top Languages" height="165" />
</p>

<p align="left">
  <img src="https://github-readme-streak-stats.herokuapp.com/?user=${safeUser}&theme=${theme}&hide_border=true" alt="GitHub Streak" height="165" />
</p>

---

### 🌟 Featured Projects

| Project | Description | Stack |
|---|---|---|
| 🤖 **[SendKit](https://github.com/${safeUser}/sendkit)** | Unified Agent Tooling framework for Model Context Protocol (MCP), CLI & Agent Skills | TypeScript, Bun, MCP, Express |
| ⚡ **Full-Stack Web Suite** | High-performance scalable web app with real-time sync & modern UX | React, Tailwind, Next.js, Node.js |
| 🛠️ **DevOps & Automation Toolkit** | Automated CI/CD workflows and developer productivity pipelines | Docker, GitHub Actions, Bash |

---

### 🤝 Connect with Me

<p align="left">
  <a href="https://linkedin.com/in/${linkedin || safeUser}" target="_blank">
    <img src="https://img.shields.io/badge/LinkedIn-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn" />
  </a>
  <a href="https://twitter.com/${twitter || safeUser}" target="_blank">
    <img src="https://img.shields.io/badge/X-000000?style=for-the-badge&logo=x&logoColor=white" alt="X (Twitter)" />
  </a>
  <a href="mailto:${email || 'your-email@gmail.com'}">
    <img src="https://img.shields.io/badge/Email-D14836?style=for-the-badge&logo=gmail&logoColor=white" alt="Gmail" />
  </a>
</p>

<p align="center">
  <img src="https://komarev.com/ghpvc/?username=${safeUser}&label=Profile%20Views&color=0e75b6&style=flat" alt="Profile Views" />
</p>`;
  };

  const copyCode = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const gitPushCommands = `# 1. Initialize Git Repository
git init
git add .
git commit -m "feat: build SendKit agent tooling framework"

# 2. Add your GitHub repository remote
git branch -M main
git remote add origin https://github.com/${username || '<your-username>'}/<your-repo-name>.git

# 3. Push to GitHub
git push -u origin main`;

  const bunWorkspaceCommands = `# Install all workspace dependencies
bun install

# Run checks across all packages (Core, CLI, MCP, Remote)
bun run release:check

# Test CLI from source
bun run dev:cli init --telegram-bot-token "<bot-token>"
bun run dev:cli telegram "<chat-id>" "Hello from SendKit" --json

# Start Local MCP stdio server
TELEGRAM_BOT_TOKEN="<bot-token>" bun run dev:local-mcp

# Start Remote MCP HTTP server with Clerk OAuth
CLERK_PUBLISHABLE_KEY="<key>" CLERK_SECRET_KEY="<secret>" bun run dev:remote-mcp`;

  const npmPublishCommands = `# 1. Choose immutable version (e.g. 0.1.4)
# Bump packages/core/package.json first!

# 2. Publish Core package
cd packages/core
bun publish

# 3. Publish CLI package
cd ../cli
bun publish

# 4. Publish Local MCP Server package
cd ../local-mcp
bun publish`;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-sky-950/40 to-purple-950/30 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-sky-400 uppercase tracking-wider mb-1">
            <Github className="w-3.5 h-3.5" />
            <span>GitHub Hub</span>
          </div>
          <h2 className="text-xl font-bold text-white">Profile Customizer & Repository Deployment</h2>
          <p className="text-xs text-slate-400 mt-1">
            Build a profile README with dynamic stats and deploy your SendKit codebase to GitHub.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveSubTab('profile')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
              activeSubTab === 'profile'
                ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/20'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Profile README Studio</span>
          </button>
          <button
            onClick={() => setActiveSubTab('deploy')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
              activeSubTab === 'deploy'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <Rocket className="w-3.5 h-3.5" />
            <span>Deploy Repository</span>
          </button>
        </div>
      </div>

      {activeSubTab === 'profile' ? (
        <div className="space-y-6">
          {/* Step-by-step instruction banner */}
          <div className="p-4 rounded-xl bg-sky-950/40 border border-sky-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-2.5 text-sky-200">
              <span className="w-5 h-5 rounded-full bg-sky-500 text-slate-950 font-bold flex items-center justify-center text-[10px]">
                i
              </span>
              <span>
                <strong>How to activate on GitHub:</strong> Create a new repository named exactly after your username (e.g. <code>{username || 'your-username'}/{username || 'your-username'}</code>) with a <code>README.md</code>, then paste this markdown!
              </span>
            </div>

            <a
              href={`https://github.com/new?name=${username || 'username'}`}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold flex items-center space-x-1.5 whitespace-nowrap"
            >
              <span>Create Special Repo</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Profile Controls */}
            <div className="lg:col-span-5 space-y-4">
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <Palette className="w-4 h-4 text-sky-400" />
                  <span>Profile Personalization</span>
                </h3>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="text-slate-400 font-medium">GitHub Username</label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="e.g. rishivedangi"
                      className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 font-mono text-slate-200 focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 font-medium">Display Full Name</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Rishi Vedangi"
                      className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 font-medium">Headline / Subtitle</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Full-Stack & AI Systems Developer"
                      className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 font-medium">Typing SVG Animated Text (semicolon separated)</label>
                    <textarea
                      rows={2}
                      value={typingLines}
                      onChange={(e) => setTypingLines(e.target.value)}
                      placeholder="Line 1;Line 2;Line 3"
                      className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 font-mono text-[11px] focus:outline-none focus:border-sky-500 resize-none"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 font-medium">Stats Card Theme</label>
                    <select
                      value={theme}
                      onChange={(e) => setTheme(e.target.value)}
                      className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-sky-500"
                    >
                      <option value="tokyonight">Tokyo Night (Dark Blue/Purple)</option>
                      <option value="radical">Radical (Vibrant Pink/Cyan)</option>
                      <option value="dracula">Dracula (Classic Dark)</option>
                      <option value="synthwave">Synthwave (Retro)</option>
                      <option value="matrix">Matrix (Hacker Green)</option>
                      <option value="github_dark">GitHub Dark</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-slate-400 font-medium">LinkedIn Handle</label>
                      <input
                        type="text"
                        value={linkedin}
                        onChange={(e) => setLinkedin(e.target.value)}
                        placeholder="rishivedangi"
                        className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 font-mono text-xs focus:outline-none focus:border-sky-500"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 font-medium">X (Twitter) Handle</label>
                      <input
                        type="text"
                        value={twitter}
                        onChange={(e) => setTwitter(e.target.value)}
                        placeholder="rishivedangi"
                        className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 font-mono text-xs focus:outline-none focus:border-sky-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Tech Stack Badges Picker */}
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <label className="text-xs font-bold text-white flex items-center justify-between">
                    <span>Select Tech Stack Badges ({selectedTech.length})</span>
                  </label>
                  <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1 bg-slate-950 rounded-xl border border-slate-800/80">
                    {allTechOptions.map((tech) => {
                      const isSelected = selectedTech.includes(tech.name);
                      return (
                        <button
                          key={tech.name}
                          type="button"
                          onClick={() => toggleTech(tech.name)}
                          className={`px-2 py-1 rounded-lg text-[11px] font-mono transition ${
                            isSelected
                              ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 font-bold'
                              : 'bg-slate-900 text-slate-500 hover:text-slate-300 border border-transparent'
                          }`}
                        >
                          {tech.name.replace('_', ' ')}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Markdown Output & Live Card Preview */}
            <div className="lg:col-span-7 space-y-4">
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                    <Code2 className="w-4 h-4 text-sky-400" />
                    <span>Generated README.md (Copy & Paste)</span>
                  </h3>

                  <button
                    onClick={() => copyCode('profile-readme', generateProfileMarkdown())}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition shadow-md shadow-sky-600/20"
                  >
                    {copiedSection === 'profile-readme' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-300" />
                        <span>Copied Markdown!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Profile README</span>
                      </>
                    )}
                  </button>
                </div>

                <pre className="p-4 rounded-xl bg-[#080d16] text-xs font-mono text-slate-200 overflow-x-auto max-h-[380px] border border-slate-800">
                  {generateProfileMarkdown()}
                </pre>
              </div>

              {/* Live Preview Card */}
              <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-3">
                <div className="text-xs font-semibold text-slate-400 flex items-center space-x-1.5">
                  <Eye className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Live GitHub Profile Preview</span>
                </div>

                <div className="p-4 rounded-xl bg-[#0d1117] border border-slate-700/60 space-y-3 text-slate-200 text-xs">
                  <div className="text-base font-bold text-white">Hi there, I'm {fullName} 👋</div>
                  <div className="text-slate-400 font-medium">🚀 {title}</div>
                  
                  {/* Dynamic Typing SVG Preview */}
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                    <img 
                      src={`https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=16&pause=1000&color=38BDF8&width=450&lines=${encodeURIComponent(typingLines).replace(/%3B/g, ';')}`} 
                      alt="Typing SVG Preview" 
                      className="max-w-full"
                    />
                  </div>

                  {/* Badges preview */}
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {selectedTech.map((tName) => {
                      const opt = allTechOptions.find(o => o.name === tName);
                      if (!opt) return null;
                      return (
                        <span 
                          key={tName} 
                          className="px-2 py-0.5 rounded text-[10px] font-bold text-white"
                          style={{ backgroundColor: `#${opt.color}` }}
                        >
                          {opt.name.replace('_', ' ')}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Repository Deployment Section */
        <div className="space-y-6">
          {/* Step 1: Git & GitHub */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="w-7 h-7 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-xs">
                  1
                </span>
                <div>
                  <h3 className="text-sm font-bold text-white">Push Monorepo to GitHub</h3>
                  <p className="text-xs text-slate-400">Initialize git and publish your repository</p>
                </div>
              </div>

              <button
                onClick={() => copyCode('git', gitPushCommands)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition"
              >
                {copiedSection === 'git' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Git Commands</span>
                  </>
                )}
              </button>
            </div>

            <pre className="p-4 rounded-xl bg-[#080d16] text-xs font-mono text-sky-200 overflow-x-auto">
              {gitPushCommands}
            </pre>
          </div>

          {/* Step 2: Bun Workspace Verification */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xs">
                  2
                </span>
                <div>
                  <h3 className="text-sm font-bold text-white">Bun Workspace Execution & Testing</h3>
                  <p className="text-xs text-slate-400">Run local development and test across all adapters</p>
                </div>
              </div>

              <button
                onClick={() => copyCode('bun', bunWorkspaceCommands)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition"
              >
                {copiedSection === 'bun' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Bun Commands</span>
                  </>
                )}
              </button>
            </div>

            <pre className="p-4 rounded-xl bg-[#080d16] text-xs font-mono text-purple-200 overflow-x-auto">
              {bunWorkspaceCommands}
            </pre>
          </div>

          {/* Step 3: NPM Publishing */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                  3
                </span>
                <div>
                  <h3 className="text-sm font-bold text-white">Publishing Packages to NPM</h3>
                  <p className="text-xs text-slate-400">Publish @sendkit/core, CLI, and MCP servers</p>
                </div>
              </div>

              <button
                onClick={() => copyCode('npm', npmPublishCommands)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition"
              >
                {copiedSection === 'npm' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy NPM Commands</span>
                  </>
                )}
              </button>
            </div>

            <pre className="p-4 rounded-xl bg-[#080d16] text-xs font-mono text-emerald-200 overflow-x-auto">
              {npmPublishCommands}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

