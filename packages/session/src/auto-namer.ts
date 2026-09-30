/**
 * 会话自动命名器
 * 
 * 根据首次对话内容自动生成会话名称
 */

import type { SessionAutoNamer } from './types'
import type { AnthropicClient } from '@atsre/llm'

/**
 * 简单的自动命名器
 * 
 * 截取用户第一条消息的前 N 个字符作为名称
 */
export class SimpleAutoNamer implements SessionAutoNamer {
  private maxLength: number

  constructor(maxLength: number = 20) {
    this.maxLength = maxLength
  }

  async generateName(userMessage: string, _assistantMessage?: string): Promise<string> {
    // 移除换行符和多余空格
    const cleaned = userMessage.replace(/\s+/g, ' ').trim()
    
    // 截取指定长度
    if (cleaned.length <= this.maxLength) {
      return cleaned
    }
    
    return cleaned.slice(0, this.maxLength) + '...'
  }
}

/**
 * 基于 LLM 的自动命名器
 * 
 * 调用 LLM 根据对话内容生成简洁的会话标题
 */
export class LLMAutoNamer implements SessionAutoNamer {
  private llm: AnthropicClient

  constructor(llm: AnthropicClient) {
    this.llm = llm
  }

  async generateName(userMessage: string, assistantMessage?: string): Promise<string> {
    // 构建提示词
    const prompt = this.buildPrompt(userMessage, assistantMessage)
    
    try {
      // 调用 LLM 生成标题
      const response = await this.llm.call({
        messages: [{ role: 'user', content: prompt }],
        maxTokens: 50,
        temperature: 0.7
      })

      // 提取生成的标题
      const content = response.content[0]
      if (content && content.type === 'text') {
        return this.cleanTitle(content.text)
      }

      // 如果失败，回退到简单命名
      return new SimpleAutoNamer().generateName(userMessage)
      
    } catch (error) {
      // 如果 LLM 调用失败，回退到简单命名
      console.warn('[AutoNamer] LLM 调用失败，使用简单命名:', error)
      return new SimpleAutoNamer().generateName(userMessage)
    }
  }

  /**
   * 构建生成标题的提示词
   */
  private buildPrompt(userMessage: string, assistantMessage?: string): string {
    let prompt = '请为以下对话生成一个简洁的标题（3-8个字）：\n\n'
    prompt += `用户: ${userMessage}\n`
    
    if (assistantMessage) {
      prompt += `助手: ${assistantMessage}\n`
    }
    
    prompt += '\n要求：\n'
    prompt += '1. 只输出标题，不要有任何其他文字\n'
    prompt += '2. 不要加引号或标点符号\n'
    prompt += '3. 3-8个字，简洁明了\n'
    prompt += '4. 能够概括对话的核心内容\n'
    
    return prompt
  }

  /**
   * 清理生成的标题
   */
  private cleanTitle(title: string): string {
    // 移除引号、换行符、多余空格
    let cleaned = title
      .replace(/["'「」『』]/g, '')
      .replace(/\n/g, '')
      .replace(/\s+/g, ' ')
      .trim()
    
    // 移除末尾的标点符号
    cleaned = cleaned.replace(/[。！？\.!?]+$/, '')
    
    // 限制长度
    if (cleaned.length > 20) {
      cleaned = cleaned.slice(0, 20)
    }
    
    return cleaned || '未命名会话'
  }
}

/**
 * 默认使用简单命名器
 * 
 * 可以在需要时切换到 LLM 命名器
 */
export const defaultAutoNamer = new SimpleAutoNamer()
