import type { AnthropicClient, Message, ContentBlock, ToolUseContent } from '@atsre/llm'
import type { Tool, AnthropicTool } from '@atsre/tools'
import { toAnthropicTool } from '@atsre/tools'
import type { AgentConfig, AgentResult, StepResult } from './types'

/**
 * Agent 类
 * 
 * 实现 ReAct 循环：
 * 1. 调用 LLM
 * 2. 如果返回工具调用，执行工具并追加结果
 * 3. 重复步骤 1-2，直到 LLM 返回文本回复
 */
export class Agent {
  private llm: AnthropicClient
  private tools: Map<string, Tool<any>>
  private toolDefinitions: AnthropicTool[]
  private config: Required<AgentConfig>

  constructor(llm: AnthropicClient, tools: Tool<any>[], config: AgentConfig = {}) {
    this.llm = llm
    
    // 将工具数组转换为 Map，方便按名称查找
    this.tools = new Map(tools.map(tool => [tool.name, tool]))
    
    // 转换为 Anthropic 格式的工具定义
    this.toolDefinitions = tools.map(toAnthropicTool)
    
    // 合并默认配置
    this.config = {
      maxSteps: config.maxSteps ?? 10,
      temperature: config.temperature ?? 1.0,
      maxTokens: config.maxTokens ?? 4096
    }
  }

  /**
   * 运行 Agent
   * 
   * @param userMessage - 用户输入的消息
   * @param history - 历史消息（可选）
   * @returns Agent 的完整执行结果
   */
  async run(userMessage: string, history: Message[] = []): Promise<AgentResult> {
    // 1. 构建初始消息列表
    const messages: Message[] = [
      ...history,
      { role: 'user', content: userMessage }
    ]

    // 2. 初始化统计信息
    let totalInputTokens = 0
    let totalOutputTokens = 0
    let steps = 0

    // 3. 开始循环
    while (steps < this.config.maxSteps) {
      steps++

      // 执行单步（调用 LLM）
      const stepResult = await this.executeStep(messages)
      
      // 累计 token 使用
      totalInputTokens += stepResult.inputTokens
      totalOutputTokens += stepResult.outputTokens

      // 将 LLM 的响应追加到消息历史
      messages.push({
        role: 'assistant',
        content: stepResult.content
      })

      // 4. 判断是否需要继续循环
      if (stepResult.stopReason === 'tool_use') {
        // 需要执行工具
        const toolResults = await this.executeTools(stepResult.content)
        
        // 将工具结果追加到消息历史
        messages.push({
          role: 'user',
          content: toolResults
        })
        
        // 继续循环
        continue
      } else {
        // LLM 返回了文本回复，结束循环
        break
      }
    }

    // 5. 提取最终的文本回复
    const lastMessage = messages[messages.length - 1]
    const finalText = lastMessage ? this.extractText(lastMessage.content) : ''

    return {
      messages,
      finalText,
      steps,
      usage: {
        totalInputTokens,
        totalOutputTokens
      }
    }
  }

  /**
   * 执行单步（调用 LLM 一次）
   * 
   * @param messages - 当前的消息历史
   * @returns 单步执行结果
   */
  private async executeStep(messages: Message[]): Promise<StepResult> {
    const response = await this.llm.call({
      messages,
      tools: this.toolDefinitions,
      maxTokens: this.config.maxTokens,
      temperature: this.config.temperature
    })

    return {
      content: response.content,
      stopReason: response.stop_reason,
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens
    }
  }

  /**
   * 执行工具调用
   * 
   * 从内容块中提取所有工具调用，执行它们，并返回结果
   * 
   * @param content - LLM 返回的内容块（包含工具调用）
   * @returns 工具结果的内容块数组
   */
  private async executeTools(content: ContentBlock[]): Promise<ContentBlock[]> {
    const results: ContentBlock[] = []

    for (const block of content) {
      if (block.type === 'tool_use') {
        const toolUse = block as ToolUseContent
        const tool = this.tools.get(toolUse.name)

        if (!tool) {
          // 工具不存在
          results.push({
            type: 'tool_result',
            tool_use_id: toolUse.id,
            content: `错误：工具 ${toolUse.name} 不存在`,
            is_error: true
          })
          continue
        }

        try {
          // 验证参数并执行工具
          const validatedInput = tool.inputSchema.parse(toolUse.input)
          const result = await tool.execute(validatedInput)

          results.push({
            type: 'tool_result',
            tool_use_id: toolUse.id,
            content: result
          })
        } catch (error: any) {
          // 工具执行失败
          results.push({
            type: 'tool_result',
            tool_use_id: toolUse.id,
            content: `执行失败: ${error.message}`,
            is_error: true
          })
        }
      }
    }

    return results
  }

  /**
   * 从内容块中提取文本
   * 
   * @param content - 消息内容（字符串或内容块数组）
   * @returns 提取的文本
   */
  private extractText(content: string | ContentBlock[]): string {
    if (typeof content === 'string') {
      return content
    }

    // 从内容块数组中提取所有文本块
    const textBlocks = content
      .filter(block => block.type === 'text')
      .map(block => (block as any).text)

    return textBlocks.join('\n')
  }
}
