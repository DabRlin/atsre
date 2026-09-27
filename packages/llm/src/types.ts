import Anthropic from '@anthropic-ai/sdk'

/**
 * 消息角色类型
 */
export type MessageRole = 'user' | 'assistant'

/**
 * 文本内容块
 */
export interface TextContent {
  type: 'text'
  text: string
}

/**
 * 工具调用内容块
 */
export interface ToolUseContent {
  type: 'tool_use'
  id: string
  name: string
  input: Record<string, unknown>
}

/**
 * 工具结果内容块
 */
export interface ToolResultContent {
  type: 'tool_result'
  tool_use_id: string
  content: string
  is_error?: boolean
}

/**
 * 内容块联合类型
 */
export type ContentBlock = TextContent | ToolUseContent | ToolResultContent

/**
 * 消息类型
 * 
 * Anthropic Messages API 的消息格式
 * content 可以是字符串（纯文本）或内容块数组（包含工具调用）
 */
export interface Message {
  role: MessageRole
  content: string | ContentBlock[]
}

/**
 * LLM 响应类型
 * 
 * 包含响应内容、停止原因和 token 使用统计
 */
export interface LLMResponse {
  id: string
  content: ContentBlock[]
  stop_reason: 'end_turn' | 'tool_use' | 'max_tokens' | 'stop_sequence' | null
  usage: {
    input_tokens: number
    output_tokens: number
  }
}

/**
 * 工具定义类型（Anthropic 格式）
 */
export interface ToolDefinition {
  name: string
  description: string
  input_schema: {
    type: 'object'
    properties: Record<string, unknown>
    required?: string[]
  }
}

/**
 * 调用 LLM 的参数
 */
export interface CallLLMParams {
  messages: Message[]
  tools?: ToolDefinition[]
  maxTokens?: number
  temperature?: number
}
