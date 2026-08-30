export const SENDKIT_SOURCE_FILES = {
  coreSchemas: `import { z } from "zod";

export const telegramMessageInputSchema = z.object({
  chatId: z.string().min(1, "Chat ID is required"),
  message: z.string().min(1, "Message is required"),
});

export const telegramMessageOptionsSchema = telegramMessageInputSchema.extend({
  botToken: z.string().min(1, "Telegram bot token is required"),
});

export const telegramSendMessageRequestSchema = z.object({
  chat_id: z.string().min(1),
  text: z.string().min(1),
});

export const telegramSendMessageResponseSchema = z.object({
  ok: z.boolean(),
  result: z
    .object({
      message_id: z.number(),
    })
    .optional(),
  description: z.string().optional(),
});

export const telegramMessageOutputSchema = z.object({
  ok: z.literal(true),
  chatId: z.string(),
  messageId: z.number(),
});

export type TelegramMessageInput = z.infer<typeof telegramMessageInputSchema>;
export type TelegramMessageOptions = z.infer<typeof telegramMessageOptionsSchema>;
export type TelegramMessageOutput = z.infer<typeof telegramMessageOutputSchema>;`,

  coreOperations: `import {
  telegramMessageOutputSchema,
  telegramMessageOptionsSchema,
  telegramSendMessageRequestSchema,
  telegramSendMessageResponseSchema,
  type TelegramMessageOptions,
  type TelegramMessageOutput,
} from "./schemas";

export async function sendTelegramMessage(
  input: TelegramMessageOptions,
): Promise<TelegramMessageOutput> {
  const parsedInput = telegramMessageOptionsSchema.parse(input);
  const requestBody = telegramSendMessageRequestSchema.parse({
    chat_id: parsedInput.chatId,
    text: parsedInput.message,
  });

  const response = await fetch(\`https://api.telegram.org/bot\${parsedInput.botToken}/sendMessage\`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: await Response.json(requestBody).text(),
  });

  const data = telegramSendMessageResponseSchema.parse(await response.json());

  if (!response.ok || !data.ok || !data.result) {
    throw new Error(data.description ?? "Telegram message request failed");
  }

  return telegramMessageOutputSchema.parse({
    ok: true,
    chatId: parsedInput.chatId,
    messageId: data.result.message_id,
  });
}`,

  cliIndex: `#!/usr/bin/env node
import { Command } from "commander";
import { z } from "zod";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { sendTelegramMessage } from "@sendkit/core";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";

const program = new Command();
const configPath = join(homedir(), ".config", "sendkit", "config.json");
const cliConfigSchema = z.object({
  telegramBotToken: z.string().min(1).optional(),
});

function writeTelegramBotToken(token: string) {
  mkdirSync(dirname(configPath), { recursive: true });
  writeFileSync(configPath, \`\${JSON.stringify({ telegramBotToken: token }, null, 2)}\\n\`, {
    mode: 0o600,
  });
}

function getTelegramBotToken() {
  if (!existsSync(configPath)) {
    throw new Error("Telegram bot token is required. Run \`sendkit init\`.");
  }

  const config = cliConfigSchema.parse(JSON.parse(readFileSync(configPath, "utf8")));
  const token = config.telegramBotToken;

  if (!token) {
    throw new Error("Telegram bot token is required. Run \`sendkit init\`.");
  }

  return token;
}

program.name("sendkit").description("SendKit CLI backed by sendkit-core");

program
  .command("init")
  .description("Configure SendKit CLI local settings")
  .requiredOption("--telegram-bot-token <botToken>", "Telegram bot token")
  .action(async (options: { telegramBotToken: string }) => {
    writeTelegramBotToken(options.telegramBotToken);
    console.log(\`Saved SendKit CLI config to \${configPath}\`);
  });

program
  .command("telegram")
  .description("Send a Telegram message")
  .argument("<chatId>", "Telegram chat ID")
  .argument("<message>", "Message text to send")
  .action(async (chatId: string, message: string) => {
    const result = await sendTelegramMessage({
      botToken: getTelegramBotToken(),
      chatId,
      message,
    });

    console.log(JSON.stringify(result));
  });

await program.parseAsync(process.argv).catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});`,

  localMcpIndex: `#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { telegramMessageInputSchema, sendTelegramMessage } from "@sendkit/core";

const server = new McpServer({
  name: "sendkit-local",
  version: "0.0.0",
});

function getTelegramBotToken() {
  const token = process.env.TELEGRAM_BOT_TOKEN;

  if (!token) {
    throw new Error("TELEGRAM_BOT_TOKEN is required. Configure it in your MCP client environment.");
  }

  return token;
}

server.registerTool(
  "telegram",
  {
    title: "Telegram",
    description: "Send a Telegram message.",
    inputSchema: telegramMessageInputSchema.shape,
  },
  async (input) => {
    const result = await sendTelegramMessage({
      ...input,
      botToken: getTelegramBotToken(),
    });

    return {
      content: [
        {
          type: "text",
          text: \`Sent Telegram message \${result.messageId} to chat \${result.chatId}\`,
        },
      ],
      structuredContent: result,
    };
  },
);

const transport = new StdioServerTransport();
await server.connect(transport);`,

  remoteMcpIndex: `import { Hono, type Context } from "hono";
import { createClerkClient } from "@clerk/backend";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { generateClerkProtectedResourceMetadata } from "@clerk/mcp-tools/server";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";

import { sendTelegramMessage, telegramMessageInputSchema } from "@sendkit/core";

const clerkPublishableKey = process.env.CLERK_PUBLISHABLE_KEY;
const clerkSecretKey = process.env.CLERK_SECRET_KEY;

if (!clerkPublishableKey) {
  throw new Error("CLERK_PUBLISHABLE_KEY environment variable is required");
}

if (!clerkSecretKey) {
  throw new Error("CLERK_SECRET_KEY environment variable is required");
}

const clerkClient = createClerkClient({
  publishableKey: clerkPublishableKey,
  secretKey: clerkSecretKey,
});

function createServer(botToken: string) {
  const server = new McpServer({
    name: "sendkit-remote",
    version: "0.0.0",
  });

  server.registerTool(
    "telegram",
    {
      title: "Telegram",
      description: "Send a Telegram message.",
      inputSchema: telegramMessageInputSchema.shape,
    },
    async (input) => {
      const result = await sendTelegramMessage({
        ...input,
        botToken,
      });

      return {
        content: [
          {
            type: "text",
            text: \`Sent Telegram message \${result.messageId} to chat \${result.chatId}\`,
          },
        ],
        structuredContent: result,
      };
    },
  );

  return server;
}

const app = new Hono();

function protectedResourceMetadataUrl(c: Context, botToken: string) {
  return new URL(\`/.well-known/oauth-protected-resource/\${botToken}/mcp\`, c.req.url).toString();
}

function unauthorizedMcpResponse(c: Context, botToken: string) {
  c.header(
    "WWW-Authenticate",
    \`Bearer resource_metadata="\${protectedResourceMetadataUrl(c, botToken)}"\`,
  );
  return c.json({ error: "Unauthorized" }, 401);
}

app.get("/.well-known/oauth-protected-resource/:botToken/mcp", (c) => {
  return c.json(
    generateClerkProtectedResourceMetadata({
      publishableKey: clerkPublishableKey,
      resourceUrl: new URL(\`/\${c.req.param("botToken")}/mcp\`, c.req.url).toString(),
    }),
  );
});

app.post("/:botToken/mcp", async (c) => {
  const botToken = c.req.param("botToken");
  const authHeader = c.req.header("authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    return unauthorizedMcpResponse(c, botToken);
  }

  try {
    const requestState = await clerkClient.authenticateRequest(c.req.raw, {
      acceptsToken: "oauth_token",
    });

    if (!requestState.isAuthenticated) {
      return unauthorizedMcpResponse(c, botToken);
    }
  } catch {
    return unauthorizedMcpResponse(c, botToken);
  }

  const server = createServer(botToken);

  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  });

  await server.connect(transport);

  try {
    return await transport.handleRequest(c.req.raw);
  } finally {
    await server.close();
  }
});`,

  skillMd: `---
name: sendkit
description: Send Telegram messages from an agent through the SendKit MCP \`telegram\` tool, with the SendKit CLI (\`@sendkit/cli\`) as a fallback. Use when a user asks to send a Telegram message, mentions SendKit, wants to interact with the SendKit toolset, asks to verify SendKit manually, or needs to choose between the SendKit MCP and CLI workflows.
---

# SendKit

SendKit sends Telegram messages. It exposes the same operation two ways, both backed by \`@sendkit/core\`:

- **MCP tool** (\`sendkit\` server → \`telegram\` tool) — preferred for agents.
- **CLI** (\`@sendkit/cli\`, binary \`sendkit\`) — fallback when MCP is unavailable or for manual verification.

Both take a \`chatId\` and a \`message\`, call the Telegram Bot API, and return \`{ ok: true, chatId, messageId }\`.

## Choosing MCP vs CLI

Prefer the **MCP tool** whenever the \`sendkit\` MCP server is connected — it needs no shell and the bot token is supplied by the MCP client environment.

Use the **CLI** when:
- The MCP server is not connected in this session.
- Verifying behavior manually or from a script / terminal.
- A local bot token (not the MCP env token) should be used.

## MCP workflow (preferred)

Call the \`telegram\` tool on the \`sendkit\` MCP server with:

| Field | Type | Required | Notes |
|---|---|---|---|
| \`chatId\` | string | yes | Telegram chat ID (non-empty) |
| \`message\` | string | yes | Message text (non-empty) |

The bot token is read from \`TELEGRAM_BOT_TOKEN\` in the MCP server environment (see \`.mcp.json\`) — do not pass it in the tool input. On success the tool returns \`{ ok: true, chatId, messageId }\`.

## CLI workflow (fallback)

First-time setup writes a token to \`~/.config/sendkit/config.json\` (mode \`0600\`):

\`\`\`bash
sendkit init --telegram-bot-token <botToken>
\`\`\`

Send a message:

\`\`\`bash
sendkit telegram <chatId> <message>
\`\`\`

On success it prints the JSON result, e.g. \`{"ok":true,"chatId":"123","messageId":42}\`. If no token is configured it errors with \`Telegram bot token is required. Run \\\`sendkit init\\\`.\`

Run the CLI without a global install via \`bunx @sendkit/cli telegram <chatId> <message>\` (or the \`npx\` equivalent).`,
};

export const MCP_CLIENT_CONFIGS = {
  claudeDesktop: {
    title: "Claude Desktop",
    filename: "claude_desktop_config.json",
    path: "~/Library/Application Support/Claude/claude_desktop_config.json (macOS)\n%APPDATA%\\Claude\\claude_desktop_config.json (Windows)",
    content: `{
  "mcpServers": {
    "sendkit": {
      "command": "npx",
      "args": ["-y", "@sendkit/mcp"],
      "env": {
        "TELEGRAM_BOT_TOKEN": "<YOUR_TELEGRAM_BOT_TOKEN>"
      }
    }
  }
}`,
  },
  cursor: {
    title: "Cursor",
    filename: ".cursor/mcp.json",
    path: "~/.cursor/mcp.json or project .cursor/mcp.json",
    content: `{
  "mcpServers": {
    "sendkit": {
      "command": "sendkit-mcp",
      "args": [],
      "env": {
        "TELEGRAM_BOT_TOKEN": "<YOUR_TELEGRAM_BOT_TOKEN>"
      }
    }
  }
}`,
  },
  openCode: {
    title: "OpenCode",
    filename: "opencode.json",
    path: "opencode.config.json",
    content: `{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "sendkit": {
      "type": "remote",
      "url": "https://your-sendkit-host.example.com/{env:TELEGRAM_BOT_TOKEN}/mcp",
      "enabled": true
    }
  }
}`,
  },
  vsCodeCline: {
    title: "VS Code (Cline / Roo)",
    filename: "cline_mcp_settings.json",
    path: "~/Library/Application Support/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json",
    content: `{
  "mcpServers": {
    "sendkit": {
      "command": "npx",
      "args": ["-y", "@sendkit/mcp"],
      "env": {
        "TELEGRAM_BOT_TOKEN": "<YOUR_TELEGRAM_BOT_TOKEN>"
      },
      "disabled": false,
      "autoApprove": ["telegram"]
    }
  }
}`,
  },
  windsurf: {
    title: "Windsurf Cascade",
    filename: "mcp_config.json",
    path: "~/.codeium/windsurf/mcp_config.json",
    content: `{
  "mcpServers": {
    "sendkit": {
      "command": "sendkit-mcp",
      "args": [],
      "env": {
        "TELEGRAM_BOT_TOKEN": "<YOUR_TELEGRAM_BOT_TOKEN>"
      }
    }
  }
}`,
  },
  claudeCode: {
    title: "Claude Code CLI",
    filename: "Terminal Command",
    path: "claude mcp add sendkit",
    content: `claude mcp add sendkit -e TELEGRAM_BOT_TOKEN="<YOUR_TELEGRAM_BOT_TOKEN>" -- npx -y @sendkit/mcp`,
  },
};
