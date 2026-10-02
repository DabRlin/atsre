/**
 * REPL 会话状态管理器
 * 
 * 管理当前活动会话的状态，支持运行时切换会话
 */

import type { Message } from '@atsre/llm'
import type { SessionStorage } from '@atsre/session'
import { defaultIdGenerator } from '@atsre/session'

/**
 * REPL 会话状态
 */
export interface REPLSessionState {
  sessionId: string | null  // null 表示尚未创建会话
  messages: Message[]
}

/**
 * REPL 会话管理器
 * 
 * 封装会话状态的加载、切换、更新逻辑
 */
export class REPLSessionManager {
  private storage: SessionStorage
  private currentState: REPLSessionState

  constructor(storage: SessionStorage, initialSessionId: string | null = null) {
    this.storage = storage
    this.currentState = {
      sessionId: initialSessionId,
      messages: []
    }
  }

  /**
   * 初始化会话
   * 
   * 如果有初始会话 ID，则加载；否则延迟创建
   */
  async initialize(): Promise<void> {
    if (this.currentState.sessionId) {
      await this.loadOrCreateSession(this.currentState.sessionId)
    }
    // 如果 sessionId 为 null，不做任何操作，等待首次消息时创建
  }

  /**
   * 获取当前会话 ID
   */
  getCurrentSessionId(): string | null {
    return this.currentState.sessionId
  }

  /**
   * 确保会话已创建（延迟创建）
   * 
   * 如果当前没有会话，则创建一个新会话
   * @returns 会话 ID
   */
  async ensureSession(): Promise<string> {
    if (!this.currentState.sessionId) {
      // 自动创建新会话
      const id = defaultIdGenerator.generate()
      await this.storage.createSession(id)
      this.currentState.sessionId = id
      this.currentState.messages = []
      
      console.log(`\n已创建新会话: ${id}`)
    }
    return this.currentState.sessionId
  }

  /**
   * 获取当前消息列表
   */
  getCurrentMessages(): Message[] {
    return this.currentState.messages
  }

  /**
   * 更新消息列表
   * 
   * @param messages - 新的消息列表
   */
  updateMessages(messages: Message[]): void {
    this.currentState.messages = messages
  }

  /**
   * 创建新会话
   * 
   * @param sessionId - 会话 ID（可选，不提供则自动生成）
   * @param name - 会话名称（可选）
   * @returns 新会话的 ID
   */
  async createNewSession(sessionId?: string, name?: string): Promise<string> {
    // 如果没有提供 ID，使用生成器生成
    const id = sessionId || defaultIdGenerator.generate()
    
    // 创建会话
    const metadata = await this.storage.createSession(id, name)
    
    // 切换到新会话
    this.currentState.sessionId = metadata.id
    this.currentState.messages = []
    
    return metadata.id
  }

  /**
   * 切换到已存在的会话
   * 
   * @param sessionId - 目标会话 ID
   */
  async switchToSession(sessionId: string): Promise<void> {
    // 检查会话是否存在
    if (!this.storage.exists(sessionId)) {
      throw new Error(`会话不存在: ${sessionId}`)
    }

    // 加载会话
    await this.loadOrCreateSession(sessionId)
  }

  /**
   * 加载或创建会话
   * 
   * @param sessionId - 会话 ID
   */
  private async loadOrCreateSession(sessionId: string): Promise<void> {
    const sessionExists = this.storage.exists(sessionId)

    if (sessionExists) {
      // 加载已有会话
      const sessionData = await this.storage.loadSession(sessionId)
      if (sessionData) {
        this.currentState.sessionId = sessionId
        this.currentState.messages = sessionData.messages
        
        console.log(`\n已加载会话: ${sessionId}`)
        if (sessionData.metadata.name) {
          console.log(`会话名称: ${sessionData.metadata.name}`)
        }
        console.log(`历史消息数: ${sessionData.metadata.messageCount}`)
      }
    } else {
      // 创建新会话
      await this.storage.createSession(sessionId)
      this.currentState.sessionId = sessionId
      this.currentState.messages = []
      
      console.log(`\n已创建新会话: ${sessionId}`)
    }
  }

  /**
   * 获取当前状态（只读）
   */
  getState(): Readonly<REPLSessionState> {
    return {
      sessionId: this.currentState.sessionId,
      messages: [...this.currentState.messages]
    }
  }

  /**
   * 检查是否已有活动会话
   */
  hasSession(): boolean {
    return this.currentState.sessionId !== null
  }
}
