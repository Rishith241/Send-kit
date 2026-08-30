# SendKit Studio & Agent Tooling Framework

> Build, test, and deploy agent-ready tools with one unified TypeScript core for Model Context Protocol (MCP), CLI, and AI Agent Skills.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## Overview

SendKit demonstrates the **single-source-of-truth pattern** for AI agent tooling:
- **Core Engine (`@cwa-dev/sendkit-core`)**: Shared Zod schemas & business logic.
- **CLI (`@cwa-dev/sendkit`)**: Command-line interface with `--json` support for bash scripts and agents.
- **Local MCP Server (`@cwa-dev/sendkit-local-mcp`)**: Stdio JSON-RPC 2.0 server for Claude Desktop, Cursor, and OpenCode.
- **Remote MCP Server (`apps/remote-mcp`)**: HTTP MCP endpoint with per-request Bot Token routing and Clerk OAuth (RFC 9470).
- **Agent Skill (`skills/sendkit`)**: Standardized `SKILL.md` instructions with clear fallback logic.

---

## 🚀 Quick Start (Interactive Web Studio)

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev

# 3. Build for production
npm run build
```

Open `http://localhost:3000` to access the interactive workbench with:
- **Telegram Bot Test Lab**: Real-time BotFather token verification and message delivery.
- **MCP Protocol Inspector**: JSON-RPC 2.0 tool execution (`initialize`, `tools/list`, `tools/call`).
- **CLI Terminal**: In-browser emulator for `sendkit doctor`, `sendkit init`, `sendkit telegram`.
- **Remote MCP & Clerk OAuth**: RFC 9470 protected resource tester and client config generator.
- **Custom Tool Builder**: Generate 5 synchronized architecture layers for any custom webhook/API.
- **Agent Skill Sandbox**: Live LLM reasoning simulation.

---

## 📦 Deploying to GitHub

### Method 2: Git Command Line
```bash
# 1. Initialize local repository
git init
git add .
git commit -m "feat: initialize SendKit agent tooling framework"

# 2. Add GitHub remote
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo-name>.git

# 3. Push to GitHub
git push -u origin main
```

---

## 🛠️ Testing SendKit CLI Directly

```bash
# Global installation
npm install -g @cwa-dev/sendkit

# Initialize bot token
sendkit init --telegram-bot-token "<your-bot-token>"

# Send message
sendkit telegram "<chat-id>" "Hello from SendKit" --json

# Run doctor diagnostic
sendkit doctor
```

---

## 📄 License
MIT License.
