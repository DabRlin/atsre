/**
 * 自动命名触发器
 * 
 * 负责判断何时触发自动命名，以及如何执行命名逻辑
 */

import type { Message } from '@atsre/llm'
import type { SessionStorage } from './storage'
import type { SessionAutoNamer } from './types'

/**
 * 触发器配置
 */
export interface AutoNamingTriggerConfig {
  /**
   * 是否启用自动命名
   */
  enabled: boolean

  /**
   * 自动命名器实例
   */
  namer?: SessionAutoNamer

  /**
   * 是否覆盖已有的自动生成名称
   * 
   * - true: 每次首次对话都重新生成（如果是 auto 来源）
   * - false: 已有名称则不再触发（默认）
   */
  overrideAutoName?: boolean
}

/**
 * 自动命名触发器
 * 
 * 封装自动命名的触发逻辑，解耦判断和执行
 */
export class AutoNamingTrigger {
  private config: AutoNamingTriggerConfig
  private storage: SessionStorage

  constructor(storage: SessionStorage, config: AutoNamingTriggerConfig) {
    this.storage = storage
    this.config = config
  }

  /**
   * 检查是否应该触发自动命名
   * 
   * @param sessionId - 会话 ID
   * @param messageCount - 当前消息数量
   * @returns 是否应该触发
   */
  async shouldTrigger(sessionId: string, messageCount: number): Promise<boolean> {
    // 未启用
    if (!this.config.enabled || !this.config.namer) {
      return false
    }

    // 不是首次对话（消息数不是 2 的倍数，即不是完整的一轮对话）
    // 首次对话应该有：user message + assistant message = 2 条
    if (messageCount !== 2) {
      return false
    }

    // 加载会话元数据
    const sessionData = await this.storage.loadSession(sessionId)
    if (!sessionData) {
      return false
    }

    const metadata = sessionData.metadata

    // 已有用户设置的名称，不触发
    if (metadata.name && metadata.nameSource === 'user') {
      return false
    }

    // 已有自动生成的名称，根据配置决定是否覆盖
    if (metadata.name && metadata.nameSource === 'auto') {
      return this.config.overrideAutoName || false
    }

    // 其他情况：没有名称，触发
    return true
  }

  /**
   * 触发自动命名
   * 
   * @param sessionId - 会话 ID
   * @param messages - 当前消息列表
   */
  async trigger(sessionId: string, messages: Message[]): Promise<void> {
    if (!this.config.namer) {
      return
    }

    // 确保至少有一轮对话
    if (messages.length < 2) {
      return
    }

    try {
      // 提取首次对话内容
      const firstMessage = messages[0]
      const secondMessage = messages[1]
      
      if (!firstMessage || !secondMessage) {
        console.warn('[AutoNamingTrigger] 消息数量不足')
        return
      }
      
      const userMessage = this.extractTextContent(firstMessage)
      const assistantMessage = this.extractTextContent(secondMessage)

      if (!userMessage) {
        console.warn('[AutoNamingTrigger] 无法提取用户消息内容')
        return
      }

      // 调用自动命名
      await this.storage.autoNameSession(sessionId, userMessage, assistantMessage)

      // 可选：显示命名结果
      const sessionData = await this.storage.loadSession(sessionId)
      if (sessionData?.metadata.name) {
        console.log(`\n[会话已自动命名为: ${sessionData.metadata.name}]\n`)
      }
    } catch (error: any) {
      console.warn('[AutoNamingTrigger] 自动命名失败:', error.message)
    }
  }

  /**
   * 提取消息的文本内容
   * 
   * @param message - 消息对象
   * @returns 文本内容
   */
  private extractTextContent(message: Message): string | undefined {
    if (typeof message.content === 'string') {
      return message.content
    }

    // 如果是 ContentBlock 数组，提取第一个 text 类型的内容
    if (Array.isArray(message.content)) {
      for (const block of message.content) {
        if (block.type === 'text') {
          return block.text
        }
      }
    }

    return undefined
  }

  /**
   * 更新配置
   * 
   * @param config - 新配置
   */
  updateConfig(config: Partial<AutoNamingTriggerConfig>): void {
    this.config = { ...this.config, ...config }
  }

  /**
   * 启用自动命名
   */
  enable(): void {
    this.config.enabled = true
  }

  /**
   * 禁用自动命名
   */
  disable(): void {
    this.config.enabled = false
  }

  /**
   * 检查是否启用
   */
  isEnabled(): boolean {
    return this.config.enabled
  }
}
