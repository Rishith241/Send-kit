import { TelegramBotInfo, TelegramSendResult, JsonRpcResponse, CliLogEntry } from '../types';

export async function testTelegramBot(botToken: string): Promise<{ ok: boolean; result?: TelegramBotInfo; error?: string; simulated?: boolean }> {
  try {
    const res = await fetch('/api/telegram/test-bot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ botToken }),
    });
    return await res.json();
  } catch (err: any) {
    return { ok: false, error: err.message || 'Failed to connect to backend server' };
  }
}

export async function sendTelegramMessage(botToken: string, chatId: string, message: string): Promise<TelegramSendResult> {
  try {
    const res = await fetch('/api/telegram/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ botToken, chatId, message }),
    });
    return await res.json();
  } catch (err: any) {
    return { ok: false, chatId, messageId: 0, error: err.message || 'Network error' };
  }
}

export async function executeMcpJsonRpc(method: string, params: Record<string, any> = {}, botToken?: string, id = 1): Promise<JsonRpcResponse> {
  try {
    const res = await fetch('/api/mcp/jsonrpc', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ method, params, botToken, id }),
    });
    return await res.json();
  } catch (err: any) {
    return {
      jsonrpc: '2.0',
      id,
      error: { code: -32603, message: err.message || 'MCP JSON-RPC request failed' },
    };
  }
}

export async function executeCliCommand(command: string): Promise<{ ok: boolean; exitCode: number; output: string }> {
  try {
    const res = await fetch('/api/cli/exec', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command }),
    });
    return await res.json();
  } catch (err: any) {
    return {
      ok: false,
      exitCode: 1,
      output: `CLI execution error: ${err.message}`,
    };
  }
}
