import { existsSync } from 'fs'
import { mkdir, readFile, appendFile, writeFile, readdir } from 'fs/promises'
import { resolve, join } from 'path'
import type { Message } from '@atsre/llm'
import type { SessionData, SessionMetadata, SessionStorageConfig } from './types'

/**
 * 会话存储类
 * 
 * 使用 JSONL 格式存储会话：
 * - 每行一条消息，JSON 格式
 * - 便于追加和读取
 * - 第一行是元数据
 */
export class SessionStorage {
  private config: SessionStorageConfig

  constructor(config?: Partial<SessionStorageConfig>) {
    // 默认存储在用户目录下的 .atsre/sessions
    const homeDir = process.env.HOME || process.env.USERPROFILE || '.'
    this.config = {
      sessionDir: config?.sessionDir || join(homeDir, '.atsre', 'sessions')
    }
  }

  /**
   * 确保会话目录存在
   */
  private async ensureSessionDir(): Promise<void> {
    if (!existsSync(this.config.sessionDir)) {
      await mkdir(this.config.sessionDir, { recursive: true })
    }
  }

  /**
   * 获取会话文件路径
   */
  private getSessionPath(sessionId: string): string {
    return join(this.config.sessionDir, `${sessionId}.jsonl`)
  }

  /**
   * 创建新会话
   * 
   * @param sessionId - 会话 ID
   * @returns 会话元数据
   */
  async createSession(sessionId: string): Promise<SessionMetadata> {
    await this.ensureSessionDir()

    const metadata: SessionMetadata = {
      id: sessionId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messageCount: 0
    }

    const sessionPath = this.getSessionPath(sessionId)
    
    // 写入元数据作为第一行
    await writeFile(sessionPath, JSON.stringify({ metadata }) + '\n', 'utf-8')

    return metadata
  }

  /**
   * 加载会话
   * 
   * @param sessionId - 会话 ID
   * @returns 会话数据，如果不存在返回 null
   */
  async loadSession(sessionId: string): Promise<SessionData | null> {
    const sessionPath = this.getSessionPath(sessionId)

    if (!existsSync(sessionPath)) {
      return null
    }

    try {
      const content = await readFile(sessionPath, 'utf-8')
      const lines = content.trim().split('\n')

      if (lines.length === 0) {
        return null
      }

      // 第一行是元数据
      const firstLineText = lines[0]
      if (!firstLineText) {
        return null
      }
      const firstLine = JSON.parse(firstLineText)
      const metadata = firstLine.metadata as SessionMetadata

      // 后续行是消息
      const messages: Message[] = []
      for (let i = 1; i < lines.length; i++) {
        const lineText = lines[i]
        if (lineText) {
          const line = lineText.trim()
          if (line) {
            const parsed = JSON.parse(line)
            messages.push(parsed.message)
          }
        }
      }

      return { metadata, messages }
    } catch (error: any) {
      throw new Error(`加载会话失败: ${error.message}`)
    }
  }

  /**
   * 追加消息到会话
   * 
   * @param sessionId - 会话 ID
   * @param message - 要追加的消息
   */
  async appendMessage(sessionId: string, message: Message): Promise<void> {
    const sessionPath = this.getSessionPath(sessionId)

    if (!existsSync(sessionPath)) {
      throw new Error(`会话不存在: ${sessionId}`)
    }

    // 追加消息到文件
    const line = JSON.stringify({ message }) + '\n'
    await appendFile(sessionPath, line, 'utf-8')

    // 更新元数据（重写第一行）
    await this.updateMetadata(sessionId)
  }

  /**
   * 更新会话元数据
   * 
   * @param sessionId - 会话 ID
   */
  private async updateMetadata(sessionId: string): Promise<void> {
    const sessionPath = this.getSessionPath(sessionId)
    const content = await readFile(sessionPath, 'utf-8')
    const lines = content.split('\n')

    // 解析元数据
    const firstLineText = lines[0]
    if (!firstLineText) {
      throw new Error('会话文件损坏：缺少元数据')
    }
    const firstLine = JSON.parse(firstLineText)
    const metadata = firstLine.metadata as SessionMetadata

    // 更新元数据
    metadata.updatedAt = Date.now()
    metadata.messageCount = lines.length - 2 // 减去元数据行和最后的空行

    // 重写文件
    lines[0] = JSON.stringify({ metadata })
    await writeFile(sessionPath, lines.join('\n'), 'utf-8')
  }

  /**
   * 列出所有会话
   * 
   * @returns 会话元数据列表
   */
  async listSessions(): Promise<SessionMetadata[]> {
    await this.ensureSessionDir()

    const files = await readdir(this.config.sessionDir)
    const sessions: SessionMetadata[] = []

    for (const file of files) {
      if (file.endsWith('.jsonl')) {
        const sessionId = file.replace('.jsonl', '')
        const data = await this.loadSession(sessionId)
        if (data) {
          sessions.push(data.metadata)
        }
      }
    }

    // 按更新时间倒序排序
    sessions.sort((a, b) => b.updatedAt - a.updatedAt)

    return sessions
  }

  /**
   * 检查会话是否存在
   * 
   * @param sessionId - 会话 ID
   * @returns 是否存在
   */
  exists(sessionId: string): boolean {
    return existsSync(this.getSessionPath(sessionId))
  }
}
