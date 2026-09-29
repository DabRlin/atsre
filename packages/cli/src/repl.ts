/**
 * REPL 交互模式
 * 
 * 实现多轮对话，支持会话保存和恢复
 */

import { Agent } from '@atsre/core'
import type { AnthropicClient, Message } from '@atsre/llm'
import { allTools } from '@atsre/tools'
import { SessionStorage } from '@atsre/session'
import * as readline from 'readline'

/**
 * REPL 配置
 */
interface REPLConfig {
  llm: AnthropicClient
  sessionId: string
  storage: SessionStorage
}

/**
 * 启动 REPL 交互模式
 * 
 * @param config - REPL 配置
 */
export async function startREPL(config: REPLConfig): Promise<never> {
  const { llm, sessionId, storage } = config

  // 1. 加载或创建会话
  let messages: Message[] = []
  let sessionExists = storage.exists(sessionId)

  if (sessionExists) {
    const sessionData = await storage.loadSession(sessionId)
    if (sessionData) {
      messages = sessionData.messages
      console.log(`\n已加载会话: ${sessionId}`)
      console.log(`历史消息数: ${sessionData.metadata.messageCount}`)
    }
  } else {
    await storage.createSession(sessionId)
    console.log(`\n已创建新会话: ${sessionId}`)
  }

  // 2. 创建 Agent 实例
  const agent = new Agent(llm, allTools, {
    maxSteps: 10,
    temperature: 1.0,
    maxTokens: 4096
  })

  // 3. 创建 readline 接口
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  console.log('\n欢迎使用 ATSRE Agent!')
  console.log('输入 "exit" 或 "quit" 退出，按 Ctrl+C 也可以退出\n')

  // 4. 主循环 - 使用 question 方法
  const askQuestion = () => {
    rl.question('\n> ', async (input: string) => {
      const userInput = input.trim()

      // 检查退出命令
      if (userInput === 'exit' || userInput === 'quit') {
        console.log('\n再见！会话已保存到 ~/.atsre/sessions/' + sessionId + '.jsonl')
        rl.close()
        process.exit(0)
      }

      // 检查空输入
      if (!userInput) {
        askQuestion()
        return
      }

      try {
        console.log('\nAgent 正在思考...\n')

        // 运行 Agent（使用历史消息）
        const result = await agent.run(userInput, messages)

        // 保存新消息到会话
        const oldMessageCount = messages.length
        const newMessages = result.messages.slice(oldMessageCount)
        
        for (const msg of newMessages) {
          await storage.appendMessage(sessionId, msg)
        }

        // 更新消息历史
        messages = result.messages

        // 显示 Agent 的回复
        console.log('---')
        console.log(`\nAgent: ${result.finalText}\n`)
        console.log('---')
        console.log(`步数: ${result.steps} | Tokens: ${result.usage.totalInputTokens + result.usage.totalOutputTokens}`)

      } catch (error: any) {
        console.error('\n错误:', error.message)
      }

      // 继续下一轮
      askQuestion()
    })
  }

  // 5. 处理 Ctrl+C
  rl.on('SIGINT', () => {
    console.log('\n\n会话已保存，再见！')
    rl.close()
    process.exit(0)
  })

  // 开始第一轮提问
  askQuestion()

  // 永不返回，保持进程运行
  return new Promise(() => {}) as never
}
