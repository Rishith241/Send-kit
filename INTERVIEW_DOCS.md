# SendKit: Technical Architecture & Interview Preparation Guide

**Author:** Rishith ([@Rishith241](https://github.com/Rishith241))  
**Repository:** `https://github.com/Rishith241/sendkit`  
**System Classification:** Multi-Protocol Agentic Tooling & Communication Framework

---

## 1. Executive Summary & Elevator Pitch

### The 30-Second Pitch
> *"SendKit is a unified multi-protocol tooling framework engineered for autonomous AI agents. When building tools for Large Language Models (LLMs), developers typically maintain separate codebases for CLI commands, local MCP servers, remote HTTP servers, and agent prompt skills. This inevitably causes schema drift, redundant testing, and unhandled edge cases.*
> 
> *I designed SendKit around a strict **Single Source of Truth (SSOT)** architecture in TypeScript. A shared core engine (`@sendkit/core`) defines runtime validation using Zod schemas and executes the domain logic, while thin protocol adapters expose it simultaneously as an **MCP stdio server**, a **scriptable CLI with `--json` output**, and an **OAuth-protected remote HTTP endpoint**. It also includes a standardized `SKILL.md` that teaches LLMs how to progressively fall back from MCP to CLI if an environment is restricted."*

---

## 2. High-Level Architecture & Topology

```
                         ┌─────────────────────────────────────────┐
                         │              @sendkit/core              │
                         │  - Shared Zod Validation Schemas        │
                         │  - Domain Logic (Telegram Bot Client)   │
                         │  - Standardized JSON Error Envelopes    │
                         └────────────────────┬────────────────────┘
                                              │
                ┌─────────────────────────────┼─────────────────────────────┐
                ▼                             ▼                             ▼
       ┌──────────────────┐         ┌───────────────────┐         ┌───────────────────┐
       │   @sendkit/cli   │         │   @sendkit/mcp    │         │ apps/remote-mcp   │
       │  (CLI Commander) │         │ (Stdio JSON-RPC)  │         │ (HTTP + RFC 9728) │
       │                  │         │                   │         │                   │
       │ - Human shell    │         │ - Claude Desktop  │         │ - Remote Agents   │
       │ - Sub-agents     │         │ - Cursor IDE      │         │ - Clerk OAuth     │
       │ - `--json` flag  │         │ - Low latency     │         │ - Multi-tenant    │
       └──────────────────┘         └───────────────────┘         └───────────────────┘
```

### Monorepo Topology
```
sendkit/
├── packages/
│   ├── core/                  # @sendkit/core: Schemas, domain client, error types
│   │   ├── src/
│   │   │   ├── schemas.ts     # Shared Zod validation schemas
│   │   │   ├── client.ts      # Telegram Bot API client & retry logic
│   │   │   ├── types.ts       # TypeScript type declarations
│   │   │   └── errors.ts      # Standardized domain errors
│   │   └── package.json
│   ├── cli/                   # @sendkit/cli: Commander.js CLI binary
│   │   ├── src/index.ts       # Commands: init, doctor, telegram, broadcast
│   │   └── package.json
│   └── local-mcp/             # @sendkit/mcp: Stdio MCP Server
│       ├── src/index.ts       # JSON-RPC 2.0 stdio protocol handler
│       └── package.json
├── apps/
│   └── remote-mcp/            # Hono HTTP / SSE remote MCP server (Clerk OAuth)
│       └── src/index.ts
├── skills/
│   └── sendkit/               # Agent skill definition (SKILL.md)
│       └── SKILL.md
└── package.json               # Bun / npm workspace root configuration
```

---

## 3. Core Technical Subsystems & Innovations

### A. Single Source of Truth (SSOT) Domain Engine (`@sendkit/core`)
- **Zero Schema Redundancy**: All input arguments (`chatId`, `message`, etc.) and output structures are declared in a single Zod schema.
- **Protocol Agnostic**: The core module has no concept of CLI flags, HTTP headers, or MCP JSON-RPC envelopes. It purely accepts validated inputs and returns normalized results.
- **Normalized Error Handling**: Network failures, Telegram API rate limits (HTTP 429), and schema validation issues are mapped into strongly-typed domain errors with `retryable: boolean` indicators.

### B. Local Model Context Protocol (MCP) Stdio Server (`@sendkit/mcp`)
- **Transport**: Communicates over standard input/output (`process.stdin` / `process.stdout`) using the official `@modelcontextprotocol/sdk`.
- **Latency Profile**: Zero HTTP handshake overhead; ideal for local agent environments like Claude Desktop, Cursor IDE, and OpenCode.
- **Dual Content Return Envelope**:
  ```json
  {
    "content": [
      { "type": "text", "text": "Successfully sent message 4821 to chat 123456789" }
    ],
    "structuredContent": {
      "ok": true,
      "chatId": "123456789",
      "messageId": 4821
    }
  }
  ```

### C. Agentic Scriptable CLI (`@sendkit/cli`)
- **Dual Personality**:
  - **Interactive Human Mode**: Prints formatted tables, spinners, colored status badges, and interactive configuration prompts (`sendkit init`).
  - **Machine-Readable Mode (`--json`)**: Strips all ASCII/ANSI escape codes and outputs deterministic JSON payloads directly to `stdout`.
- **Exit Code Guarantees**:
  - `0`: Operation succeeded; `stdout` contains valid JSON.
  - `1`: Operation failed; `stdout` contains `{ "ok": false, "error": { "code": "...", "message": "..." } }`.

### D. Multi-Tenant Remote MCP Server (`apps/remote-mcp`)
- **HTTP Transport**: Built with Hono on modern Web Standards (`Request` / `Response`).
- **RFC 9728 OAuth Protected Resource Metadata**:
  - Unauthenticated requests to `/:botToken/mcp` respond with `401 Unauthorized` and a `WWW-Authenticate: Bearer resource_metadata="..."` challenge header.
  - Exposes `GET /.well-known/oauth-protected-resource/:botToken/mcp` returning valid OAuth 2.0 authorization server metadata.
- **Zero Credential Leaks**: Bot tokens are parsed per-request from the path or authenticated bearer scope, preventing tokens from ever being exposed as LLM tool arguments.

### E. Agent Progressive Fallback Protocol (`SKILL.md`)
The repository includes an agent skill that instructs autonomous models how to prioritize execution:
1. **Tier 1 (Preferred)**: Call the native MCP `telegram` tool (fastest, lowest token overhead).
2. **Tier 2 (Fallback)**: If the MCP connection is broken or sandboxed, invoke the CLI binary via bash: `sendkit telegram <chatId> <message> --json`.
3. **Tier 3 (Degraded Fallback)**: Direct HTTPS call to Telegram Bot API endpoint.

---

## 4. Key Design Decisions & Technical Trade-Offs

| Decision | Alternative Considered | Why SendKit's Approach is Superior |
| :--- | :--- | :--- |
| **Zod Schema SSOT** | Duplicate TypeScript Interfaces + Joi/Ajv | Zod provides static TypeScript inference (`z.infer<T>`) alongside runtime parsing, guaranteeing zero drift between types and validator logic. |
| **Bun / npm Workspaces** | Polyrepo (Separate Repos) | Monorepo ensures atomic commits: a breaking change in `@sendkit/core` can be fixed in CLI and MCP adapters within the same PR. |
| **`tsdown` Bundling** | Standard `tsc` compiler | `tsdown` (powered by esbuild/rolldown) builds both CommonJS and ESM outputs simultaneously with isolated `.d.ts` declaration generation in milliseconds. |
| **`--json` Flag on CLI** | Always parsing raw text | Text parsing breaks when CLI styling changes. The `--json` flag provides a contractual interface for sub-agents. |

---

## 5. Technical Interview Questions & Answers

### Question 1: "What problem does SendKit solve that standard SDKs do not?"
**Answer:**
> *"Standard SDKs only provide programmatic function calls. In an autonomous agent environment, the execution runtime varies constantly: an agent running in Cursor needs an MCP stdio server; an agent running in a CI/CD bash sub-shell needs a CLI binary with `--json` output; and a remote cloud agent needs an OAuth-protected HTTP endpoint.*
> 
> *SendKit solves this multi-surface fragmentation by providing a single monorepo architecture where the domain logic is written once in `@sendkit/core`, and all three delivery protocols are maintained with zero schema drift."*

### Question 2: "How do you prevent secret leakage when exposing tools to LLMs?"
**Answer:**
> *"In many naive MCP implementations, developers add `botToken` or `apiKey` as a required parameter in the tool's input schema. This is dangerous because the LLM might hallucinate tokens, leak them in conversation history, or be tricked by prompt injection.*
> 
> *In SendKit, credentials are strictly managed out-of-band: the CLI reads from a local secure config file (`~/.config/sendkit/config.json`), the local MCP reads from process environment variables, and the remote MCP extracts credentials from the secure URL route after verifying Clerk OAuth bearer tokens."*

### Question 3: "Why did you implement RFC 9728 for the remote server?"
**Answer:**
> *"RFC 9728 is the official IETF standard for OAuth 2.0 Protected Resource Metadata. Modern remote MCP clients (like Claude or custom agent gateways) need to automatically discover how to authenticate with a remote tool server. By providing the `/.well-known/oauth-protected-resource` endpoint, clients can automatically initiate OAuth authorization without requiring hardcoded configuration."*

### Question 4: "How does SendKit handle error categorization and LLM retries?"
**Answer:**
> *"Every error in `@sendkit/core` is typed and includes a `retryable: boolean` property. For example, rate limits (HTTP 429) or network timeouts set `retryable: true`, allowing the agent or caller to back off and retry. Conversely, invalid user IDs or malformed payloads set `retryable: false` with detailed validation error paths so the agent knows it must correct its arguments rather than blindly retrying."*

---

## 6. Senior Engineering Terminology Checklist

When explaining this project in an interview, use these industry-standard terms:
- **SSOT (Single Source of Truth)**
- **Schema Parity & Drift Prevention**
- **Model Context Protocol (JSON-RPC 2.0)**
- **Progressive Degradation & Fallback Strategy**
- **RFC 9728 Protected Resource Metadata**
- **Runtime Zod Validation with Static Type Inference**
- **Monorepo Workspace Topology**
- **Sub-Agent Shell Execution with Structured I/O**

---

*Document generated for Rishith (`@Rishith241`). All code, schemas, and specifications are aligned with the SendKit production codebase.*
