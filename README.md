<div align="center">

# ⚡ SendKit

### Unified Multi-Protocol Tooling Engine for Autonomous AI Agents

*One shared TypeScript core powering Model Context Protocol (MCP), CLI automation, and Agent Skills with zero schema drift.*

[![CI Pipeline](https://github.com/Rishith241/sendkit/actions/workflows/ci.yml/badge.svg)](https://github.com/Rishith241/sendkit/actions)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5+-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![MCP Protocol](https://img.shields.io/badge/MCP-JSON--RPC_2.0-8B5CF6?style=flat)](https://modelcontextprotocol.io/)
[![Runtime](https://img.shields.io/badge/Runtime-Node_20+_|_Bun_1.1+-000000?style=flat&logo=bun&logoColor=white)](https://bun.sh/)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](https://opensource.org/licenses/MIT)

</div>

---

## 📖 Table of Contents

- [Architectural Philosophy](#-architectural-philosophy)
- [Monorepo Architecture & Topology](#-monorepo-architecture--topology)
- [Core Packages & Specifications](#-core-packages--specifications)
  - [`@sendkit/core` (Universal Schema & Engine)](#1-sendkitcore-universal-schema--engine)
  - [`@sendkit/cli` (CLI for Humans & Bash Sub-Agents)](#2-sendkitcli-for-humans--bash-sub-agents)
  - [`@sendkit/mcp` (Stdio JSON-RPC Server)](#3-sendkitmcp-stdio-json-rpc-server)
  - [`apps/remote-mcp` (RFC 9470 OAuth Protected Server)](#4-appsremote-mcp-rfc-9470-oauth-protected-server)
  - [`skills/sendkit` (Standardized Agent Skill)](#5-skillssendkit-standardized-agent-skill)
- [Interactive Developer Studio & Test Lab](#-interactive-developer-studio--test-lab)
- [Quick Start & Local Setup](#-quick-start--local-setup)
- [Configuring Claude Desktop & Cursor](#-configuring-claude-desktop--cursor)
- [Extensibility: Adding Custom Connectors](#-extensibility-adding-custom-connectors)
- [Security & Environment Variables](#-security--environment-variables)
- [CI/CD & Testing](#-cicd--testing)
- [License](#-license)

---

## 🎯 Architectural Philosophy

Building tools for modern AI agents presents a fundamental problem: **Tool Drift**.

When engineering agent integrations, developers often create separate implementations for different execution contexts:
1. A **CLI binary** with flag parsing for shell scripts.
2. An **MCP Stdio Server** using JSON-RPC for Claude Desktop or Cursor.
3. A **Remote HTTP MCP Server** with OAuth for web-hosted agents.
4. A **Skill / System Prompt definition (`SKILL.md`)** guiding LLM tool selection and fallback behavior.

Over time, schemas diverge, parameter validation becomes inconsistent, and agents fail unpredictably.

```
                  ┌─────────────────────────────────────────┐
                  │            @sendkit/core                │
                  │  - Shared Zod Validation Schemas        │
                  │  - Business Logic & Telegram Client     │
                  │  - Standardized JSON Error Envelopes    │
                  └────────────────────┬────────────────────┘
                                       │
         ┌─────────────────────────────┼─────────────────────────────┐
         ▼                             ▼                             ▼
┌──────────────────┐         ┌───────────────────┐         ┌───────────────────┐
│   @sendkit/cli   │         │   @sendkit/mcp    │         │ remote-mcp (HTTP) │
│      (CLI)       │         │    (MCP Stdio)    │         │  (Clerk / OAuth)  │
│  - Shell / CI    │         │  - Claude Desktop │         │  - Remote Agents  │
│  - `--json` Mode │         │  - Cursor IDE     │         │  - RFC 9470 Auth  │
└──────────────────┘         └───────────────────┘         └───────────────────┘
```

**SendKit establishes a strict Single Source of Truth (SSOT)**:
- **Zero Schema Redundancy**: All parameter boundaries, coercions, and error messages are declared once in `@sendkit/core` using Zod.
- **Protocol Independence**: Delivery layers (Stdio, HTTP, CLI flags, REST) act purely as thin serialization adapters over the core engine.
- **Predictable Agent Fallbacks**: When an MCP connection is unavailable or restricted by sandboxing, agents seamlessly fall back to CLI invocation with identical input/output schemas.

---

## 🏗️ Monorepo Architecture & Topology

The project is structured as a high-performance monorepo supporting **Bun Workspaces** and **npm/pnpm**:

```
sendkit/
├── packages/
│   ├── core/                  # @sendkit/core: Schemas, clients & types
│   │   ├── src/
│   │   │   ├── schemas.ts     # Zod input/output schemas
│   │   │   ├── client.ts      # Telegram Bot API client
│   │   │   └── index.ts       # Public exports
│   │   └── package.json
│   ├── cli/                   # @sendkit/cli: Commander.js CLI binary
│   │   ├── src/index.ts       # Commands: init, doctor, telegram, broadcast
│   │   └── package.json
│   └── local-mcp/             # @sendkit/mcp: Stdio MCP Server
│       ├── src/index.ts       # JSON-RPC 2.0 stdio protocol handler
│       └── package.json
├── apps/
│   └── remote-mcp/            # Express-based HTTP MCP Server with RFC 9470 Auth
│       ├── src/index.ts       # Protected MCP endpoint + Clerk OAuth integration
│       └── package.json
├── skills/
│   └── sendkit/
│       └── SKILL.md           # Standardized Agent Instruction Spec & Fallback Hierarchy
├── src/                       # Interactive Developer Workbench (React + Tailwind)
│   ├── components/            # Real-time protocol inspectors & test labs
│   └── App.tsx
├── .github/workflows/ci.yml   # Automated CI build & verification workflow
└── tsconfig.json              # Shared TypeScript base configuration
```

---

## 📦 Core Packages & Specifications

### 1. `@sendkit/core` (Universal Schema & Engine)

The foundation module responsible for domain logic, parameter validation, and network communication.

- **Strict Validation**: Exports Zod schemas for all actions (`telegram_send_message`, `telegram_broadcast`, `telegram_get_me`).
- **Unified Error Handling**: Emits structured errors conforming to the standard schema:
  ```json
  {
    "ok": false,
    "error": {
      "code": "INVALID_CHAT_ID",
      "message": "Chat ID must be a valid numeric identifier or @channel username",
      "retryable": false
    }
  }
  ```

---

### 2. `@sendkit/cli` (CLI for Humans & Bash Sub-Agents)

A compiled command-line binary built with `commander`. Designed for developer diagnostics and automated execution inside agentic sub-shells.

#### Key Subcommands:
- `sendkit init`: Interactively configure or verify Telegram Bot Tokens (`~/.sendkit/config.json`).
- `sendkit doctor`: Validate environment credentials, network latency, and Telegram API availability.
- `sendkit telegram <chatId> <message>`: Deliver a message to a specific chat, group, or channel.
- `sendkit telegram broadcast <chatIds...> --message <text>`: Concurrent delivery across multiple targets.

#### Machine-Readable Mode (`--json`):
When invoked with `--json`, human-targeted logs are suppressed, and the process streams strictly valid JSON to `stdout` with exit code `0` for success and non-zero for failures:
```bash
$ sendkit telegram "123456789" "Deployment successful" --json
{
  "ok": true,
  "data": {
    "message_id": 4821,
    "recipient": "123456789",
    "status": "delivered",
    "timestamp": "2026-08-30T15:45:00.000Z"
  }
}
```

---

### 3. `@sendkit/mcp` (Stdio JSON-RPC Server)

A compliant Model Context Protocol server communicating over standard input/output (`stdio`).

#### Supported MCP Methods:
- `initialize`: Protocol negotiation, capability declaration, and server metadata.
- `tools/list`: Exposes tools matching core schemas with full JSON Schema specifications.
- `tools/call`: Executes operations (`send_telegram_message`, `verify_bot_credentials`) and returns standard MCP content envelopes (`type: "text"`).

```json
{
  "jsonrpc": "2.0",
  "id": "1",
  "method": "tools/call",
  "params": {
    "name": "send_telegram_message",
    "arguments": {
      "chat_id": "123456789",
      "text": "Alert: Database CPU utilization > 90%",
      "parse_mode": "HTML"
    }
  }
}
```

---

### 4. `apps/remote-mcp` (RFC 9470 OAuth Protected Server)

An HTTP MCP server engineered for cloud agents and multi-tenant platforms.

- **Stateless Token Routing**: Accepts bot tokens via `X-Telegram-Bot-Token` header or within tool call arguments.
- **RFC 9470 Protected Resource Metadata**: Advertises authorization servers via `/.well-known/oauth-protected-resource`.
- **Clerk Authentication**: Validates JWT bearer tokens against Clerk OAuth JWKS for secure team-level access.

---

### 5. `skills/sendkit` (Standardized Agent Skill)

A production-grade `SKILL.md` that instructs LLMs (Claude, Gemini, OpenAI) on tool selection, parameter formatting, and progressive fallback execution:

```
Step 1: Attempt native execution via Model Context Protocol (MCP Server).
Step 2: If MCP is unreachable or unconfigured, execute the `@sendkit/cli` CLI via shell tool with `--json`.
Step 3: If CLI binary is missing, make direct HTTPS requests to `https://api.telegram.org/bot<TOKEN>/sendMessage`.
```

---

## 🧪 Interactive Developer Studio & Test Lab

This repository includes a developer workbench for live protocol testing and verification:

1. **Telegram API Lab**: Test live BotFather tokens, check bot identity (`getMe`), and send real-time test payloads.
2. **MCP Protocol Inspector**: Interactive JSON-RPC 2.0 terminal simulating client-server handshakes, listing tool schemas, and debugging `tools/call` envelopes.
3. **CLI Terminal Emulator**: Browser-based shell simulator for testing `sendkit init`, `sendkit doctor`, and flags.
4. **Remote MCP & Clerk Hub**: Test RFC 9470 OAuth metadata endpoints and generate ready-to-use client connection snippets.
5. **Custom Connector Builder**: 5-layer synchronized code generator that outputs TypeScript schemas, CLI commands, MCP handlers, and SKILL documentation for any custom webhook or API.

---

## 🚀 Quick Start & Local Setup

### Prerequisites
- Node.js 20.x or higher (or Bun 1.1+)
- Git

### 1. Clone & Install Dependencies

```bash
# Clone the repository
git clone https://github.com/Rishith241/sendkit.git
cd sendkit

# Install dependencies across all packages
npm install
# or with bun:
# bun install
```

### 2. Start the Interactive Workbench

```bash
npm run dev
```

Open `http://localhost:3000` in your browser to access the test suite and protocol inspector.

### 3. Build for Production

```bash
npm run build
```

---

## ⚙️ Configuring Claude Desktop & Cursor

To connect SendKit's Local MCP Server to your AI coding assistants:

### Claude Desktop Configuration
Add the server to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "sendkit": {
      "command": "node",
      "args": [
        "/absolute/path/to/sendkit/sendkit-repo/packages/local-mcp/dist/index.js"
      ],
      "env": {
        "TELEGRAM_BOT_TOKEN": "your_botfather_token_here"
      }
    }
  }
}
```

### Cursor IDE Configuration
In **Cursor Settings → Features → MCP**:
- **Name**: `sendkit`
- **Type**: `command`
- **Command**: `node /absolute/path/to/sendkit/sendkit-repo/packages/local-mcp/dist/index.js`

---

## 🔌 Extensibility: Adding Custom Connectors

SendKit's architecture makes it easy to add new notification channels (Discord, Slack, Twilio, SendGrid):

1. **Define Schema** in `packages/core/src/schemas.ts`:
   ```typescript
   export const SendDiscordMessageSchema = z.object({
     webhook_url: z.string().url(),
     content: z.string().min(1).max(2000),
     username: z.string().optional(),
   });
   ```
2. **Implement Client** in `packages/core/src/client.ts`.
3. **Register Command** in `packages/cli/src/index.ts`.
4. **Export MCP Tool** in `packages/local-mcp/src/index.ts`.

---

## 🔐 Security & Environment Variables

| Variable | Scope | Description |
|---|---|---|
| `TELEGRAM_BOT_TOKEN` | Core / Local MCP / CLI | Telegram BotFather API authentication token |
| `CLERK_SECRET_KEY` | Remote MCP | Clerk backend authentication secret for RFC 9470 verification |
| `PORT` | Web Studio / Remote MCP | Server listening port (default: `3000`) |

---

## 🚦 CI/CD & Testing

Automated testing is executed via GitHub Actions on every push and pull request:
- Type checking across all workspace packages (`tsc --noEmit`).
- Monorepo package dependency validation.
- Production bundle verification.

```bash
# Run local verification
npm run build
```

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for details.
