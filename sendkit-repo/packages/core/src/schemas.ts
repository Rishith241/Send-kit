import { z } from "zod";

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
export type TelegramMessageOutput = z.infer<typeof telegramMessageOutputSchema>;

// GitHub Issue Schemas
export const githubIssueInputSchema = z.object({
  repo: z
    .string()
    .min(3, "Repository must be in 'owner/repo' format")
    .regex(/^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/, "Repository must match 'owner/repo' format"),
  title: z.string().min(1, "Issue title is required"),
  body: z.string().optional(),
  labels: z.array(z.string()).optional(),
});

export const githubIssueOptionsSchema = githubIssueInputSchema.extend({
  githubToken: z.string().min(1, "GitHub Personal Access Token is required"),
});

export const githubCreateIssueRequestSchema = z.object({
  title: z.string().min(1),
  body: z.string().optional(),
  labels: z.array(z.string()).optional(),
});

export const githubCreateIssueResponseSchema = z.object({
  id: z.number().optional(),
  number: z.number(),
  html_url: z.string(),
  title: z.string(),
  state: z.string(),
  message: z.string().optional(),
  documentation_url: z.string().optional(),
});

export const githubIssueOutputSchema = z.object({
  ok: z.literal(true),
  issueNumber: z.number(),
  issueUrl: z.string(),
  repo: z.string(),
  title: z.string(),
  state: z.string(),
});

export type GithubIssueInput = z.infer<typeof githubIssueInputSchema>;
export type GithubIssueOptions = z.infer<typeof githubIssueOptionsSchema>;
export type GithubIssueOutput = z.infer<typeof githubIssueOutputSchema>;
