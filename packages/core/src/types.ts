import type { Message, ContentBlock } from '@atsre/llm'

/**
 * Agent 配置
 */
export interface AgentConfig {
  maxSteps?: number        // 最大循环步数，防止死循环
  temperature?: number     // LLM 温度参数
  maxTokens?: number       // 最大生成 token 数
}

/**
 * Agent 运行结果
 */
export interface AgentResult {
  messages: Message[]      // 完整的消息历史
  finalText: string        // 最终的文本回复
  steps: number            // 实际执行的步数
  usage: {
    totalInputTokens: number
    totalOutputTokens: number
  }
}

/**
 * 单步执行结果（内部使用）
 */
export interface StepResult {
  content: ContentBlock[]
  stopReason: string | null
  inputTokens: number
  outputTokens: number
}
