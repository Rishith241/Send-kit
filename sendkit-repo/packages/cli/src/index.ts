#!/usr/bin/env node
import { Command } from "commander";
import { z } from "zod";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { sendTelegramMessage, createGithubIssue } from "@sendkit/core";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";

const program = new Command();
const configPath = join(homedir(), ".config", "sendkit", "config.json");
const cliConfigSchema = z.object({
  telegramBotToken: z.string().min(1).optional(),
  githubToken: z.string().min(1).optional(),
});

function writeCliConfig(tokens: { telegramBotToken?: string; githubToken?: string }) {
  mkdirSync(dirname(configPath), { recursive: true });
  let existing: Record<string, any> = {};
  if (existsSync(configPath)) {
    try {
      existing = JSON.parse(readFileSync(configPath, "utf8"));
    } catch {}
  }
  const merged = { ...existing, ...tokens };
  writeFileSync(configPath, `${JSON.stringify(merged, null, 2)}\n`, {
    mode: 0o600,
  });
}

function getTelegramBotToken() {
  if (process.env.TELEGRAM_BOT_TOKEN) return process.env.TELEGRAM_BOT_TOKEN;
  if (!existsSync(configPath)) {
    throw new Error("Telegram bot token is required. Run `sendkit init` or set TELEGRAM_BOT_TOKEN.");
  }
  const config = cliConfigSchema.parse(JSON.parse(readFileSync(configPath, "utf8")));
  const token = config.telegramBotToken;
  if (!token) {
    throw new Error("Telegram bot token is required. Run `sendkit init --telegram-bot-token <token>`.");
  }
  return token;
}

function getGithubToken() {
  if (process.env.GITHUB_TOKEN) return process.env.GITHUB_TOKEN;
  if (!existsSync(configPath)) {
    throw new Error("GitHub token is required. Run `sendkit init --github-token <token>` or set GITHUB_TOKEN.");
  }
  const config = cliConfigSchema.parse(JSON.parse(readFileSync(configPath, "utf8")));
  const token = config.githubToken;
  if (!token) {
    throw new Error("GitHub token is required. Run `sendkit init --github-token <token>` or set GITHUB_TOKEN.");
  }
  return token;
}

program.name("sendkit").description("SendKit CLI backed by @sendkit/core");

program
  .command("init")
  .description("Configure SendKit CLI local settings and API credentials")
  .option("--telegram-bot-token <botToken>", "Telegram bot token")
  .option("--github-token <githubToken>", "GitHub Personal Access Token (with issues:write scope)")
  .action(async (options: { telegramBotToken?: string; githubToken?: string }) => {
    if (!options.telegramBotToken && !options.githubToken) {
      throw new Error("Please specify at least one credential flag: --telegram-bot-token or --github-token");
    }
    writeCliConfig(options);
    console.log(`Saved SendKit CLI config to ${configPath} (mode: 0600)`);
  });

program
  .command("telegram")
  .description("Send a Telegram message")
  .argument("<chatId>", "Telegram chat ID")
  .argument("<message>", "Message text to send")
  .option("--json", "Output response in machine-readable JSON")
  .action(async (chatId: string, message: string, options: { json?: boolean }) => {
    const result = await sendTelegramMessage({
      botToken: getTelegramBotToken(),
      chatId,
      message,
    });

    if (options.json) {
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log(JSON.stringify(result));
    }
  });

program
  .command("github-issue")
  .description("Create a GitHub issue in a repository")
  .argument("<repo>", "GitHub repository in 'owner/repo' format (e.g. 'Rishith241/sendkit')")
  .argument("<title>", "Issue title")
  .argument("[body]", "Issue body markdown text")
  .option("--labels <labels...>", "Optional label names")
  .option("--token <token>", "Override GitHub personal access token")
  .option("--json", "Output response in machine-readable JSON")
  .action(async (repo: string, title: string, body?: string, options: { labels?: string[]; token?: string; json?: boolean } = {}) => {
    const result = await createGithubIssue({
      githubToken: options.token || getGithubToken(),
      repo,
      title,
      body,
      labels: options.labels,
    });

    if (options.json) {
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log(JSON.stringify(result));
    }
  });

await program.parseAsync(process.argv).catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
