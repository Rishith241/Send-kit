import {
  telegramMessageOutputSchema,
  telegramMessageOptionsSchema,
  telegramSendMessageRequestSchema,
  telegramSendMessageResponseSchema,
  githubIssueOptionsSchema,
  githubCreateIssueRequestSchema,
  githubCreateIssueResponseSchema,
  githubIssueOutputSchema,
  type TelegramMessageOptions,
  type TelegramMessageOutput,
  type GithubIssueOptions,
  type GithubIssueOutput,
} from "./schemas";

export async function sendTelegramMessage(
  input: TelegramMessageOptions,
): Promise<TelegramMessageOutput> {
  const parsedInput = telegramMessageOptionsSchema.parse(input);
  const requestBody = telegramSendMessageRequestSchema.parse({
    chat_id: parsedInput.chatId,
    text: parsedInput.message,
  });

  const response = await fetch(`https://api.telegram.org/bot${parsedInput.botToken}/sendMessage`, {
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
}

export async function createGithubIssue(
  input: GithubIssueOptions,
): Promise<GithubIssueOutput> {
  const parsedInput = githubIssueOptionsSchema.parse(input);
  const [owner, repoName] = parsedInput.repo.split("/");

  if (!owner || !repoName) {
    throw new Error(`Invalid repository format '${parsedInput.repo}'. Expected 'owner/repo'.`);
  }

  const requestBody = githubCreateIssueRequestSchema.parse({
    title: parsedInput.title,
    body: parsedInput.body,
    labels: parsedInput.labels,
  });

  const response = await fetch(`https://api.github.com/repos/${owner}/${repoName}/issues`, {
    method: "POST",
    headers: {
      "Accept": "application/vnd.github+json",
      "Authorization": `Bearer ${parsedInput.githubToken}`,
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "SendKit-Core/0.1.4",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  const json = await response.json();

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("GitHub authentication failed (HTTP 401). Invalid or expired personal access token.");
    }
    if (response.status === 403) {
      throw new Error(`GitHub API permission denied (HTTP 403). Ensure token has 'issues:write' or 'repo' scope. ${json.message || ""}`);
    }
    if (response.status === 404) {
      throw new Error(`GitHub repository '${parsedInput.repo}' not found (HTTP 404). Check the repository name or verify token permissions for private repositories.`);
    }
    if (response.status === 422) {
      throw new Error(`GitHub issue validation failed (HTTP 422): ${json.message || "Invalid payload"}`);
    }
    throw new Error(json.message ?? `GitHub API error: ${response.statusText}`);
  }

  const data = githubCreateIssueResponseSchema.parse(json);

  return githubIssueOutputSchema.parse({
    ok: true,
    issueNumber: data.number,
    issueUrl: data.html_url,
    repo: parsedInput.repo,
    title: data.title,
    state: data.state,
  });
}
