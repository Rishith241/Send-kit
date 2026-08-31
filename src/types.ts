export interface TelegramBotInfo {
  id: number;
  is_bot: boolean;
  first_name: string;
  username?: string;
  can_join_groups?: boolean;
  can_read_all_group_messages?: boolean;
  supports_inline_queries?: boolean;
}

export interface TelegramSendResult {
  ok: boolean;
  chatId: string;
  messageId: number;
  date?: number;
  text?: string;
  simulated?: boolean;
  rawResponse?: any;
  error?: string;
}

export interface McpToolParameter {
  name: string;
  type: 'string' | 'number' | 'boolean';
  description: string;
  required: boolean;
  default?: string;
}

export interface McpToolDefinition {
  name: string;
  title: string;
  description: string;
  category: string;
  parameters: McpToolParameter[];
}

export interface JsonRpcRequest {
  jsonrpc: '2.0';
  id: number | string;
  method: string;
  params?: Record<string, any>;
}

export interface JsonRpcResponse {
  jsonrpc: '2.0';
  id: number | string;
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
  isError?: boolean;
}

export interface CliLogEntry {
  id: string;
  timestamp: string;
  command: string;
  output: string;
  exitCode: number;
  isJson?: boolean;
}

export interface CustomOperation {
  id: string;
  name: string;
  displayName: string;
  description: string;
  category: string;
  targetService: string;
  parameters: {
    name: string;
    type: 'string' | 'number' | 'boolean';
    description: string;
    required: boolean;
    defaultVal?: string;
  }[];
  handlerCode: string;
}

export type ActiveTab = 
  | 'overview'
  | 'github-issues'
  | 'telegram'
  | 'mcp-inspector'
  | 'terminal'
  | 'remote-mcp'
  | 'custom-builder'
  | 'skill-agent'
  | 'github-deploy';
