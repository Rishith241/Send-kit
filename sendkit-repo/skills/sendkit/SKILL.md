---
name: sendkit
description: Send Telegram messages and create GitHub issues from an autonomous agent through the SendKit MCP toolset (`telegram`, `github_issue`), with the SendKit CLI (`@sendkit/cli`) as a fallback. Use when a user asks to send a Telegram message, file a GitHub bug/issue, mentions SendKit, wants to interact with the SendKit toolset, asks to verify SendKit manually, or needs to choose between the SendKit MCP and CLI workflows.
---

# SendKit

SendKit provides agentic communication and developer automation tools. It exposes operations through a unified core (`@sendkit/core`):

1. **Telegram Messenger** (`telegram` tool / `sendkit telegram` CLI) — Delivers messages to Telegram chats via BotFather API.
2. **GitHub Issue Creator** (`github_issue` tool / `sendkit github-issue` CLI) — Automates filing issues and bugs into GitHub repositories.

All operations follow a dual-interface architecture:
- **MCP tool** (`sendkit` server → `telegram`, `github_issue` tools) — preferred for agents.
- **CLI** (`@sendkit/cli`, binary `sendkit`) — fallback when MCP is unavailable, in CI scripts, or for manual verification.

---

## 1. Telegram Tooling Workflow

### MCP Tool: `telegram` (Preferred)
Call `telegram` on the `sendkit` MCP server with:

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `chatId` | string | yes | Telegram chat ID (non-empty) |
| `message` | string | yes | Message text (non-empty) |

The bot token is read from `TELEGRAM_BOT_TOKEN` in the MCP server environment (see `.mcp.json`) — do not pass it in the tool input. On success the tool returns `{ ok: true, chatId, messageId }`.

### CLI Workflow (Fallback)
```bash
sendkit init --telegram-bot-token <botToken>
sendkit telegram <chatId> <message> --json
```

---

## 2. GitHub Issue Creator Workflow

### MCP Tool: `github_issue` (Preferred)
Call `github_issue` on the `sendkit` MCP server with:

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `repo` | string | yes | GitHub repository in `owner/repo` format (e.g. `Rishith241/sendkit`) |
| `title` | string | yes | Issue title (non-empty) |
| `body` | string | no | Markdown body content or bug report |
| `labels` | string[] | no | Array of label strings, e.g. `["bug", "agent"]` |

The token is read from `GITHUB_TOKEN` in the environment. On success returns `{ ok: true, issueNumber: 42, issueUrl: "...", repo: "...", title: "...", state: "open" }`.

### CLI Workflow (Fallback)
```bash
sendkit init --github-token <githubToken>
sendkit github-issue "Rishith241/sendkit" "Bug: Failed sync" "Agent encountered error." --labels bug --json
```

---

## Choosing MCP vs CLI

Prefer the **MCP tool** whenever the `sendkit` MCP server is connected — it needs no shell and tokens are supplied by the client environment.

Use the **CLI** when:
- The MCP server is not connected in this session.
- Running inside CI/CD shell scripts or automated cron jobs.
- Verifying behavior manually or from a script / terminal.
