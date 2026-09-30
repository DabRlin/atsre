import type { Message } from '@atsre/llm'

/**
 * 会话元数据
 */
export interface SessionMetadata {
  // === 标识信息 ===
  id: string              // 会话唯一 ID（永久不变，用于文件名和系统内部定位）
  name?: string           // 会话显示名称（用户可见，可修改）
  description?: string    // 会话描述（可选）
  
  // === 状态信息 ===
  createdAt: number       // 创建时间戳
  updatedAt: number       // 最后更新时间戳
  messageCount: number    // 消息数量
  
  // === 命名来源 ===
  nameSource?: 'auto' | 'user'  // 名称来源：auto=自动生成，user=用户设置
  autoNamedAt?: number    // 自动命名的时间戳（如果是自动生成）
}

/**
 * 会话数据
 */
export interface SessionData {
  metadata: SessionMetadata
  messages: Message[]
}

/**
 * 会话存储配置
 */
export interface SessionStorageConfig {
  sessionDir: string      // 会话存储目录
}

/**
 * ID 生成策略接口
 */
export interface SessionIdGenerator {
  /**
   * 生成新的会话 ID
   * @returns 唯一的会话 ID
   */
  generate(): string
}

/**
 * 自动命名策略接口
 */
export interface SessionAutoNamer {
  /**
   * 根据首次对话内容生成会话名称
   * @param userMessage - 用户的第一条消息
   * @param assistantMessage - Agent 的第一条回复（可选）
   * @returns 生成的会话名称
   */
  generateName(userMessage: string, assistantMessage?: string): Promise<string>
}
