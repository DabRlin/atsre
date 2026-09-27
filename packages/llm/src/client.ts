import Anthropic from '@anthropic-ai/sdk'
import type { CallLLMParams, LLMResponse } from './types'

/**
 * Anthropic 客户端配置
 */
interface ClientConfig {
  apiKey: string
  baseURL?: string
  model?: string
}

/**
 * Anthropic LLM 客户端
 * 
 * 封装 Anthropic Messages API 调用
 * 支持自定义 base URL（用于第三方兼容服务）
 */
export class AnthropicClient {
  private client: Anthropic
  private model: string

  constructor(config: ClientConfig) {
    // 创建 Anthropic 客户端
    this.client = new Anthropic({
      apiKey: config.apiKey,
      baseURL: config.baseURL
    })

    // 默认模型
    this.model = config.model || 'claude-sonnet-4-20250514'
  }

  /**
   * 调用 LLM 生成响应
   * 
   * @param params - 调用参数（消息历史、工具定义等）
   * @returns LLM 的响应结果
   */
  async call(params: CallLLMParams): Promise<LLMResponse> {
    const { messages, tools, maxTokens = 4096, temperature = 1.0 } = params

    try {
      // 调用 Anthropic Messages API
      const response = await this.client.messages.create({
        model: this.model,
        messages: messages as any, // Anthropic SDK 的类型定义
        tools: tools as any,
        max_tokens: maxTokens,
        temperature
      })

      // 转换为我们的响应格式
      return {
        id: response.id,
        content: response.content as any,
        stop_reason: response.stop_reason as any,
        usage: {
          input_tokens: response.usage.input_tokens,
          output_tokens: response.usage.output_tokens
        }
      }
    } catch (error: any) {
      // 处理 API 错误
      if (error.status === 401) {
        throw new Error('API Key 无效或已过期')
      } else if (error.status === 429) {
        throw new Error('API 调用频率超限，请稍后重试')
      } else if (error.status === 500) {
        throw new Error('Anthropic 服务器错误')
      } else {
        throw new Error(`LLM 调用失败: ${error.message}`)
      }
    }
  }

  /**
   * 设置使用的模型
   * 
   * @param model - 模型名称
   */
  setModel(model: string) {
    this.model = model
  }

  /**
   * 获取当前使用的模型
   */
  getModel(): string {
    return this.model
  }
}

/**
 * 从环境变量创建客户端
 * 
 * 读取 ANTHROPIC_API_KEY 和 ANTHROPIC_BASE_URL
 * 如果没有设置 BASE_URL，则使用 Anthropic 官方 API
 */
export function createClientFromEnv(): AnthropicClient {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    throw new Error('未设置 ANTHROPIC_API_KEY 环境变量')
  }

  return new AnthropicClient({
    apiKey,
    baseURL: process.env.ANTHROPIC_BASE_URL,
    model: process.env.ANTHROPIC_MODEL
  })
}
