import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory simulated CLI config cache per instance
let serverCliConfig = {
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || "",
};

// Registered tools in memory (starts with core telegram tool)
interface ToolDefinition {
  name: string;
  title: string;
  description: string;
  category: string;
  parameters: {
    name: string;
    type: "string" | "number" | "boolean";
    description: string;
    required: boolean;
    default?: string;
  }[];
}

const customTools: ToolDefinition[] = [
  {
    name: "telegram",
    title: "Telegram Messenger",
    description: "Send a real-time Telegram message to a specific chat ID.",
    category: "Communication",
    parameters: [
      { name: "chatId", type: "string", description: "Telegram chat or group ID", required: true },
      { name: "message", type: "string", description: "Text content to deliver", required: true },
    ],
  },
  {
    name: "discord_webhook",
    title: "Discord Webhook",
    description: "Send rich embed notifications to a Discord channel via webhook URL.",
    category: "Notifications",
    parameters: [
      { name: "webhookUrl", type: "string", description: "Discord Webhook URL", required: true },
      { name: "content", type: "string", description: "Message content or notification text", required: true },
      { name: "username", type: "string", description: "Optional bot display name", required: false, default: "SendKit Bot" },
    ],
  },
  {
    name: "slack_notify",
    title: "Slack Notification",
    description: "Post automated operational alerts to a Slack channel webhook.",
    category: "DevOps",
    parameters: [
      { name: "webhookUrl", type: "string", description: "Slack Incoming Webhook URL", required: true },
      { name: "text", type: "string", description: "Message payload", required: true },
    ],
  },
  {
    name: "github_issue",
    title: "GitHub Issue Creator",
    description: "Create an issue in a GitHub repository using Personal Access Token.",
    category: "Developer Tools",
    parameters: [
      { name: "repo", type: "string", description: "Repository (owner/repo)", required: true },
      { name: "title", type: "string", description: "Issue title", required: true },
      { name: "body", type: "string", description: "Issue markdown body", required: false },
    ],
  },
];

// 1. Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    version: "0.1.4",
    name: "@sendkit/cli",
    timestamp: new Date().toISOString(),
  });
});

// 2. Telegram Bot Token Verification (getMe API)
app.post("/api/telegram/test-bot", async (req, res) => {
  try {
    const { botToken } = req.body;
    if (!botToken || typeof botToken !== "string" || !botToken.trim()) {
      return res.status(400).json({ ok: false, error: "Bot token is required" });
    }

    const cleanToken = botToken.trim();

    // Check if it's a simulated demo token
    if (cleanToken === "demo_bot_token" || cleanToken.startsWith("sim_")) {
      return res.json({
        ok: true,
        simulated: true,
        result: {
          id: 7928349182,
          is_bot: true,
          first_name: "SendKit Demo Bot",
          username: "sendkit_demo_bot",
          can_join_groups: true,
          can_read_all_group_messages: false,
          supports_inline_queries: false,
        },
      });
    }

    const response = await fetch(`https://api.telegram.org/bot${cleanToken}/getMe`, {
      method: "GET",
      headers: { "User-Agent": "SendKit-Workbench/0.1.4" },
    });

    const data = await response.json();
    if (!response.ok || !data.ok) {
      return res.status(response.status || 400).json({
        ok: false,
        error: data.description || "Failed to verify Telegram Bot token.",
        details: data,
      });
    }

    res.json({
      ok: true,
      result: data.result,
    });
  } catch (error: any) {
    res.status(500).json({
      ok: false,
      error: error.message || "Network request failed while connecting to Telegram API.",
    });
  }
});

// 3. Telegram Send Message
app.post("/api/telegram/send", async (req, res) => {
  try {
    const { botToken, chatId, message } = req.body;
    if (!botToken || !chatId || !message) {
      return res.status(400).json({
        ok: false,
        error: "Missing required parameters: botToken, chatId, and message are all required.",
      });
    }

    const cleanToken = String(botToken).trim();
    const cleanChatId = String(chatId).trim();
    const cleanMessage = String(message).trim();

    // If simulated
    if (cleanToken === "demo_bot_token" || cleanToken.startsWith("sim_")) {
      const mockMessageId = Math.floor(1000 + Math.random() * 9000);
      return res.json({
        ok: true,
        chatId: cleanChatId,
        messageId: mockMessageId,
        date: Math.floor(Date.now() / 1000),
        text: cleanMessage,
        simulated: true,
        rawResponse: {
          ok: true,
          result: {
            message_id: mockMessageId,
            from: { id: 7928349182, is_bot: true, first_name: "SendKit Demo Bot", username: "sendkit_demo_bot" },
            chat: { id: cleanChatId, type: "private", first_name: "Developer" },
            date: Math.floor(Date.now() / 1000),
            text: cleanMessage,
          },
        },
      });
    }

    const tgResponse = await fetch(`https://api.telegram.org/bot${cleanToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: cleanChatId,
        text: cleanMessage,
      }),
    });

    const data = await tgResponse.json();

    if (!tgResponse.ok || !data.ok || !data.result) {
      return res.status(tgResponse.status || 400).json({
        ok: false,
        error: data.description || "Telegram message delivery failed.",
        rawResponse: data,
      });
    }

    return res.json({
      ok: true,
      chatId: cleanChatId,
      messageId: data.result.message_id,
      date: data.result.date,
      text: data.result.text,
      rawResponse: data,
    });
  } catch (error: any) {
    return res.status(500).json({
      ok: false,
      error: error.message || "Failed to process Telegram message request.",
    });
  }
});

// 4. CLI Command Emulator API
app.post("/api/cli/exec", async (req, res) => {
  try {
    const { command } = req.body;
    if (!command || typeof command !== "string") {
      return res.status(400).json({ ok: false, output: "Error: No command provided" });
    }

    const trimmed = command.trim();
    const parts = trimmed.split(/\s+/);
    const main = parts[0];

    if (main !== "sendkit" && main !== "bunx" && main !== "npx") {
      return res.json({
        ok: false,
        exitCode: 127,
        output: `command not found: ${main}. Try 'sendkit --help'`,
      });
    }

    let actualArgs = parts;
    if (main === "bunx" || main === "npx") {
      // e.g. bunx @sendkit/cli telegram ...
      actualArgs = ["sendkit", ...parts.slice(2)];
    }

    const sub = actualArgs[1] || "--help";

    if (sub === "--help" || sub === "-h" || sub === "help") {
      const helpText = `Usage: sendkit [options] [command]

SendKit CLI backed by @sendkit/core

Options:
  -V, --version                         output the version number (0.1.4)
  -h, --help                            display help for command

Commands:
  init --telegram-bot-token <botToken>  Configure SendKit CLI local settings
  telegram [options] <chatId> <message> Send a Telegram message
  status                                Inspect active CLI configuration & bot info
  doctor                                Diagnose network, token permissions, and environment
  list-tools                            Display all registered Core tools and adapters
  help [command]                        display help for command`;
      return res.json({ ok: true, exitCode: 0, output: helpText });
    }

    if (sub === "--version" || sub === "-V" || sub === "version") {
      return res.json({ ok: true, exitCode: 0, output: "0.1.4" });
    }

    if (sub === "init") {
      const tokenIndex = actualArgs.indexOf("--telegram-bot-token");
      if (tokenIndex === -1 || !actualArgs[tokenIndex + 1]) {
        return res.json({
          ok: false,
          exitCode: 1,
          output: "error: required option '--telegram-bot-token <botToken>' not specified",
        });
      }
      const token = actualArgs[tokenIndex + 1];
      serverCliConfig.telegramBotToken = token;
      return res.json({
        ok: true,
        exitCode: 0,
        output: `Saved SendKit CLI config to ~/.config/sendkit/config.json\nMode: 0600 (encrypted credentials cache)\nToken set: ${token.slice(0, 5)}...${token.slice(-4)}`,
      });
    }

    if (sub === "status") {
      const hasToken = !!serverCliConfig.telegramBotToken;
      return res.json({
        ok: true,
        exitCode: 0,
        output: `SendKit CLI Status:
- Version: 0.1.4
- Config Path: ~/.config/sendkit/config.json
- Bot Token: ${hasToken ? `${serverCliConfig.telegramBotToken.slice(0, 6)}... (configured)` : "None (Run `sendkit init`)"}
- Core Engine: @sendkit/core v0.1.4
- Active Adapters: CLI, Local MCP (Stdio), Remote MCP (HTTP), Skill`,
      });
    }

    if (sub === "doctor") {
      const hasToken = !!serverCliConfig.telegramBotToken;
      return res.json({
        ok: true,
        exitCode: 0,
        output: `🩺 Running SendKit Doctor Diagnostic...
[✓] Core Package: @sendkit/core ready
[✓] Node & Runtime Environment: Compatible (ESM & CJS)
[${hasToken ? "✓" : "!"}] Local Bot Token: ${hasToken ? "Configured in ~/.config/sendkit/config.json" : "Missing. Run `sendkit init --telegram-bot-token <token>`"}
[✓] Telegram Bot API Connectivity: Reachable (api.telegram.org:443)
[✓] MCP Stdio Compatibility: Ready (@modelcontextprotocol/sdk)
[✓] Skill Definition: Valid (skills/sendkit/SKILL.md)`,
      });
    }

    if (sub === "list-tools") {
      const list = customTools
        .map((t) => `• ${t.name.padEnd(16)} | ${t.category.padEnd(14)} | ${t.description}`)
        .join("\n");
      return res.json({
        ok: true,
        exitCode: 0,
        output: `Registered SendKit Tools (Core & Adapters):\n${list}`,
      });
    }

    if (sub === "telegram") {
      const isJson = actualArgs.includes("--json");
      const filtered = actualArgs.slice(2).filter((a) => a !== "--json");

      if (filtered.length < 2) {
        return res.json({
          ok: false,
          exitCode: 1,
          output: "error: missing required arguments 'chatId', 'message'\nUsage: sendkit telegram <chatId> <message> [--json]",
        });
      }

      const chatId = filtered[0];
      const message = filtered.slice(1).join(" ");
      const token = serverCliConfig.telegramBotToken;

      if (!token) {
        return res.json({
          ok: false,
          exitCode: 1,
          output: "Telegram bot token is required. Run `sendkit init`.",
        });
      }

      // Execute send logic
      let result;
      if (token === "demo_bot_token" || token.startsWith("sim_")) {
        result = {
          ok: true,
          chatId,
          messageId: Math.floor(1000 + Math.random() * 9000),
        };
      } else {
        const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chat_id: chatId, text: message }),
        });
        const data = await response.json();
        if (!response.ok || !data.ok || !data.result) {
          return res.json({
            ok: false,
            exitCode: 1,
            output: `Error: ${data.description || "Telegram API request failed"}`,
          });
        }
        result = {
          ok: true,
          chatId,
          messageId: data.result.message_id,
        };
      }

      if (isJson) {
        return res.json({
          ok: true,
          exitCode: 0,
          output: JSON.stringify(result, null, 2),
        });
      }

      return res.json({
        ok: true,
        exitCode: 0,
        output: JSON.stringify(result),
      });
    }

    return res.json({
      ok: false,
      exitCode: 1,
      output: `Unknown command '${sub}'. Run 'sendkit --help' for a list of available commands.`,
    });
  } catch (error: any) {
    res.status(500).json({ ok: false, exitCode: 1, output: `Internal error: ${error.message}` });
  }
});

// 5. MCP JSON-RPC 2.0 Protocol Handler
app.post("/api/mcp/jsonrpc", async (req, res) => {
  try {
    const { method, params, id, botToken } = req.body;
    const jsonrpcId = id !== undefined ? id : 1;

    // Handle MCP protocol methods
    if (method === "initialize") {
      return res.json({
        jsonrpc: "2.0",
        id: jsonrpcId,
        result: {
          protocolVersion: "2024-11-05",
          serverInfo: {
            name: "sendkit-local",
            version: "0.1.4",
          },
          capabilities: {
            tools: { listChanged: true },
            resources: { subscribe: false, listChanged: false },
            prompts: { listChanged: false },
            logging: {},
          },
        },
      });
    }

    if (method === "tools/list") {
      const tools = customTools.map((t) => {
        const properties: Record<string, any> = {};
        const required: string[] = [];

        t.parameters.forEach((p) => {
          properties[p.name] = {
            type: p.type,
            description: p.description,
          };
          if (p.required) required.push(p.name);
        });

        return {
          name: t.name,
          title: t.title,
          description: t.description,
          inputSchema: {
            type: "object",
            properties,
            required,
          },
        };
      });

      return res.json({
        jsonrpc: "2.0",
        id: jsonrpcId,
        result: { tools },
      });
    }

    if (method === "tools/call") {
      const toolName = params?.name;
      const toolArgs = params?.arguments || {};

      if (toolName === "telegram") {
        const chatId = toolArgs.chatId;
        const message = toolArgs.message;
        const effectiveToken = botToken || serverCliConfig.telegramBotToken || process.env.TELEGRAM_BOT_TOKEN;

        if (!chatId || !message) {
          return res.json({
            jsonrpc: "2.0",
            id: jsonrpcId,
            error: {
              code: -32602,
              message: "Invalid params: chatId and message are required in arguments",
            },
          });
        }

        if (!effectiveToken) {
          return res.json({
            jsonrpc: "2.0",
            id: jsonrpcId,
            isError: true,
            content: [
              {
                type: "text",
                text: "Error: TELEGRAM_BOT_TOKEN is required. Configure it in your MCP client environment.",
              },
            ],
          });
        }

        // Call Telegram
        let output;
        if (effectiveToken === "demo_bot_token" || effectiveToken.startsWith("sim_")) {
          output = {
            ok: true,
            chatId,
            messageId: Math.floor(1000 + Math.random() * 9000),
          };
        } else {
          const response = await fetch(`https://api.telegram.org/bot${effectiveToken}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chat_id: chatId, text: message }),
          });
          const data = await response.json();
          if (!response.ok || !data.ok || !data.result) {
            return res.json({
              jsonrpc: "2.0",
              id: jsonrpcId,
              isError: true,
              content: [
                {
                  type: "text",
                  text: `Telegram API error: ${data.description || "Unknown error"}`,
                },
              ],
            });
          }
          output = {
            ok: true,
            chatId,
            messageId: data.result.message_id,
          };
        }

        return res.json({
          jsonrpc: "2.0",
          id: jsonrpcId,
          result: {
            content: [
              {
                type: "text",
                text: `Sent Telegram message ${output.messageId} to chat ${output.chatId}`,
              },
            ],
            structuredContent: output,
          },
        });
      }

      // Handle other custom tools simulation
      const customTool = customTools.find((t) => t.name === toolName);
      if (customTool) {
        return res.json({
          jsonrpc: "2.0",
          id: jsonrpcId,
          result: {
            content: [
              {
                type: "text",
                text: `Executed ${customTool.title} successfully with payload: ${JSON.stringify(toolArgs)}`,
              },
            ],
            structuredContent: {
              ok: true,
              tool: toolName,
              timestamp: new Date().toISOString(),
              arguments: toolArgs,
            },
          },
        });
      }

      return res.json({
        jsonrpc: "2.0",
        id: jsonrpcId,
        error: {
          code: -32601,
          message: `Tool not found: ${toolName}`,
        },
      });
    }

    // Default unhandled method
    return res.json({
      jsonrpc: "2.0",
      id: jsonrpcId,
      error: {
        code: -32601,
        message: `Method not found: ${method}`,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      jsonrpc: "2.0",
      id: req.body?.id || null,
      error: {
        code: -32603,
        message: error.message || "Internal JSON-RPC error",
      },
    });
  }
});

// 6. Remote MCP Protected Resource Metadata
app.get("/.well-known/oauth-protected-resource/:botToken/mcp", (req, res) => {
  const { botToken } = req.params;
  const protocol = req.headers["x-forwarded-proto"] || req.protocol;
  const host = req.headers["x-forwarded-host"] || req.get("host");
  const resourceUrl = `${protocol}://${host}/${encodeURIComponent(botToken)}/mcp`;

  res.json({
    resource: resourceUrl,
    authorization_servers: ["https://clerk.example.com"],
    scopes_supported: ["sendkit:tools:call", "telegram:write"],
    response_types_supported: ["token", "code"],
    bearer_methods_supported: ["header"],
    resource_documentation: "https://github.com/Rishith241/sendkit",
  });
});

// 7. Remote MCP HTTP Endpoint Handler
app.post("/:botToken/mcp", async (req, res) => {
  const { botToken } = req.params;
  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    const protocol = req.headers["x-forwarded-proto"] || req.protocol;
    const host = req.headers["x-forwarded-host"] || req.get("host");
    const metaUrl = `${protocol}://${host}/.well-known/oauth-protected-resource/${encodeURIComponent(botToken)}/mcp`;

    res.setHeader("WWW-Authenticate", `Bearer resource_metadata="${metaUrl}"`);
    return res.status(401).json({
      error: "Unauthorized",
      message: "Clerk OAuth bearer token required. Connect your MCP client via OAuth flow.",
      metadata_url: metaUrl,
    });
  }

  // If token provided (e.g. simulated valid test token)
  const token = authHeader.replace("Bearer ", "").trim();
  if (token === "invalid_token" || token.length < 10) {
    return res.status(401).json({ error: "Unauthorized", message: "Invalid OAuth access token." });
  }

  // Handle streamable HTTP or JSON response for MCP
  const body = req.body;
  if (body?.method === "tools/list") {
    return res.json({
      jsonrpc: "2.0",
      id: body.id || 1,
      result: {
        tools: [
          {
            name: "telegram",
            title: "Telegram",
            description: "Send a Telegram message.",
            inputSchema: {
              type: "object",
              properties: {
                chatId: { type: "string", description: "Telegram chat ID" },
                message: { type: "string", description: "Message text to send" },
              },
              required: ["chatId", "message"],
            },
          },
        ],
      },
    });
  }

  if (body?.method === "tools/call" && body?.params?.name === "telegram") {
    const { chatId, message } = body.params.arguments || {};
    return res.json({
      jsonrpc: "2.0",
      id: body.id || 1,
      result: {
        content: [
          {
            type: "text",
            text: `[Remote MCP via Clerk OAuth] Sent Telegram message to chat ${chatId}`,
          },
        ],
        structuredContent: {
          ok: true,
          chatId,
          messageId: Math.floor(1000 + Math.random() * 9000),
          remoteEndpoint: `POST /${botToken.slice(0, 6)}.../mcp`,
        },
      },
    });
  }

  return res.json({
    jsonrpc: "2.0",
    id: body?.id || 1,
    result: { status: "remote-mcp-connected", authenticated: true },
  });
});

// Vite Middleware for development & static serving for production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[SendKit Studio Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
