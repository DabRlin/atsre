/**
 * 命令系统类型定义
 */

import type { Message } from '@atsre/llm'
import type { SessionStorage } from '@atsre/session'
import type { Interface as ReadlineInterface } from 'readline'

/**
 * 命令执行上下文
 * 
 * 包含命令执行所需的所有状态和依赖
 */
export interface CommandContext {
  sessionId: string
  storage: SessionStorage
  messages: Message[]
  rl: ReadlineInterface
}

/**
 * 命令接口
 * 
 * 所有命令必须实现此接口
 */
export interface Command {
  /**
   * 命令名称（不含斜杠）
   */
  name: string

  /**
   * 命令别名（可选）
   */
  aliases?: string[]

  /**
   * 命令描述
   */
  description: string

  /**
   * 使用说明（可选）
   */
  usage?: string

  /**
   * 执行命令
   * 
   * @param args - 命令参数
   * @param context - 执行上下文
   */
  execute(args: string[], context: CommandContext): Promise<void>
}
