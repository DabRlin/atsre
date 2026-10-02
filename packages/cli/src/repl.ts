/**
 * REPL 交互模式
 * 
 * 实现多轮对话，支持会话保存和恢复
 */

import { Agent } from '@atsre/core'
import type { AnthropicClient } from '@atsre/llm'
import type { AgentEvent } from '@atsre/core'
import { allTools } from '@atsre/tools'
import { SessionStorage, AutoNamingTrigger, defaultAutoNamer } from '@atsre/session'
import { commandRegistry } from './commands'
import type { CommandContext } from './commands'
import { REPLSessionManager } from './repl-session-manager'
import { extractToolDisplay } from '@atsre/core'
import * as ui from './ui'
import * as readline from 'readline'

/**
 * REPL 配置
 */
interface REPLConfig {
  llm: AnthropicClient
  sessionId: string | null  // null 表示延迟创建
  storage: SessionStorage
  enableAutoNaming?: boolean
}

/**
 * 启动 REPL 交互模式
 * 
 * @param config - REPL 配置
 */
export async function startREPL(config: REPLConfig): Promise<never> {
  const { llm, sessionId, storage, enableAutoNaming = true } = config

  // 1. 创建会话管理器并初始化
  const sessionManager = new REPLSessionManager(storage, sessionId)
  await sessionManager.initialize()

  // 2. 创建自动命名触发器
  const autoNamingTrigger = new AutoNamingTrigger(storage, {
    enabled: enableAutoNaming,
    namer: defaultAutoNamer,
    overrideAutoName: false
  })

  // 3. 用于收集每次对话中显示过的思考文本
  let displayedThinkingTexts: string[] = []

  // 4. 创建 Agent 实例，添加事件回调
  const agent = new Agent(llm, allTools, {
    maxSteps: 10,
    temperature: 1.0,
    maxTokens: 4096,
    onEvent: (event: AgentEvent) => {
      switch (event.type) {
        case 'llm_thinking':
          // 显示 LLM 思考文本（灰色，完整输出）
          ui.showInfo(event.text)
          // 收集已显示的思考文本
          displayedThinkingTexts.push(event.text)
          break
        
        case 'tool_call_start':
          // 显示工具调用开始（带文件名等参数）
          const startDisplay = extractToolDisplay(event.toolName, event.args)
          console.log(`🔧 ${startDisplay}`)
          break
        
        case 'tool_call_success':
          // 显示工具调用成功
          const successDisplay = extractToolDisplay(event.toolName, event.args)
          ui.showSuccess(successDisplay)
          break
        
        case 'tool_call_error':
          // 显示工具调用失败
          const errorDisplay = extractToolDisplay(event.toolName, event.args)
          ui.showError(`✗ ${errorDisplay} - ${event.error}`)
          break
      }
    }
  })

  // 4. 创建 readline 接口
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  ui.showWelcome()

  // 5. 主循环
  const askQuestion = () => {
    rl.question('\n> ', async (input: string) => {
      const userInput = input.trim()

      // 检查空输入
      if (!userInput) {
        askQuestion()
        return
      }

      // 处理斜杠命令
      if (userInput.startsWith('/')) {
        const parts = userInput.split(/\s+/)
        const commandName = parts[0]
        if (!commandName) {
          askQuestion()
          return
        }
        const args = parts.slice(1)

        try {
          // 从注册表获取命令
          const command = commandRegistry.get(commandName)
          
          if (command) {
            // 构建命令上下文
            const context: CommandContext = {
              sessionId: sessionManager.getCurrentSessionId(),
              storage,
              messages: sessionManager.getCurrentMessages(),
              rl,
              sessionManager
            }
            
            // 执行命令
            await command.execute(args, context)
          } else {
            ui.showError(`未知命令: ${commandName}`)
            console.log('输入 /help 查看可用命令\n')
          }
        } catch (error: any) {
          ui.showError(error)
        }

        askQuestion()
        return
      }

      // 普通对话处理
      try {
        // 确保会话已创建（延迟创建）
        const currentSessionId = await sessionManager.ensureSession()
        
        // 重置本轮对话的思考文本收集
        displayedThinkingTexts = []
        
        ui.showThinking()

        // 运行 Agent（使用当前会话的历史消息）
        const currentMessages = sessionManager.getCurrentMessages()
        const result = await agent.run(userInput, currentMessages)

        // 保存新消息到会话
        const oldMessageCount = currentMessages.length
        const newMessages = result.messages.slice(oldMessageCount)
        
        for (const msg of newMessages) {
          await storage.appendMessage(currentSessionId, msg)
        }

        // 更新会话管理器中的消息历史
        sessionManager.updateMessages(result.messages)

        // 去重：从最终回复中移除已显示的中间思考文本
        let finalReply = result.finalText
        for (const thinkingText of displayedThinkingTexts) {
          finalReply = finalReply.replace(thinkingText, '').trim()
        }

        // 只有在去重后还有内容时才显示最终回复
        if (finalReply) {
          ui.showAgentReply(finalReply)
        }
        
        // 显示统计信息
        ui.showStats({
          steps: result.steps,
          inputTokens: result.usage.totalInputTokens,
          outputTokens: result.usage.totalOutputTokens
        })

        // 检查是否应该触发自动命名
        if (await autoNamingTrigger.shouldTrigger(currentSessionId, result.messages.length)) {
          await autoNamingTrigger.trigger(currentSessionId, result.messages)
        }

      } catch (error: any) {
        ui.showError(error)
      }

      // 继续下一轮
      askQuestion()
    })
  }

  // 6. 处理 Ctrl+C
  rl.on('SIGINT', () => {
    const sessionId = sessionManager.getCurrentSessionId()
    if (sessionId) {
      ui.showSuccess('会话已保存，再见！')
    } else {
      console.log('\n再见！')
    }
    rl.close()
    process.exit(0)
  })

  // 开始第一轮提问
  askQuestion()

  // 永不返回，保持进程运行
  return new Promise(() => {}) as never
}
