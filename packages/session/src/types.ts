import type { Message } from '@atsre/llm'

/**
 * 会话元数据
 */
export interface SessionMetadata {
  id: string              // 会话 ID
  createdAt: number       // 创建时间戳
  updatedAt: number       // 最后更新时间戳
  messageCount: number    // 消息数量
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
