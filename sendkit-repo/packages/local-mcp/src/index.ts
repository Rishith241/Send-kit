#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import {
  telegramMessageInputSchema,
  sendTelegramMessage,
  githubIssueInputSchema,
  createGithubIssue,
} from "@sendkit/core";

const server = new McpServer({
  name: "sendkit-local",
  version: "0.1.4",
});

function getTelegramBotToken() {
  const token = process.env.TELEGRAM_BOT_TOKEN;

  if (!token) {
    throw new Error("TELEGRAM_BOT_TOKEN is required. Configure it in your MCP client environment.");
  }

  return token;
}

function getGithubToken() {
  const token = process.env.GITHUB_TOKEN;

  if (!token) {
    throw new Error("GITHUB_TOKEN is required. Configure it in your MCP client environment.");
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
          text: `Sent Telegram message ${result.messageId} to chat ${result.chatId}`,
        },
      ],
      structuredContent: result,
    };
  },
);

server.registerTool(
  "github_issue",
  {
    title: "GitHub Issue",
    description: "Create an issue in a GitHub repository.",
    inputSchema: githubIssueInputSchema.shape,
  },
  async (input) => {
    const result = await createGithubIssue({
      ...input,
      githubToken: getGithubToken(),
    });

    return {
      content: [
        {
          type: "text",
          text: `Created GitHub issue #${result.issueNumber} in ${result.repo}: ${result.issueUrl}`,
        },
      ],
      structuredContent: result,
    };
  },
);

const transport = new StdioServerTransport();
await server.connect(transport);
