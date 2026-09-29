#!/usr/bin/env bun

/**
 * @atsre/cli
 * 
 * Agent 的命令行入口
 * 
 * 用法：
 * - 交互模式：bun run src/index.ts
 * - 单次命令：bun run src/index.ts "你的任务描述"
 */

import { Agent } from '@atsre/core'
import { createClientFromEnv } from '@atsre/llm'
import { allTools } from '@atsre/tools'
import { SessionStorage } from '@atsre/session'
import { startREPL } from './repl'
import { resolve } from 'path'
import { existsSync } from 'fs'

/**
 * 加载环境变量
 * 
 * 在 monorepo 中，需要明确加载 root 目录的 .env 文件
 */
async function loadEnv() {
  // 从当前文件位置向上查找 root 目录的 .env
  // 当前文件: packages/cli/src/index.ts
  // Root: ../../../
  const rootDir = resolve(import.meta.dir, '../../..')
  const envPath = resolve(rootDir, '.env')
  
  if (existsSync(envPath)) {
    // 使用 Bun.file 读取并解析 .env
    const envContent = Bun.file(envPath)
    const text = await envContent.text()
    
    // 简单的 .env 解析
    text.split('\n').forEach(line => {
      const trimmed = line.trim()
      // 跳过注释和空行
      if (!trimmed || trimmed.startsWith('#')) return
      
      // 解析 KEY=VALUE 或 KEY="VALUE"
      const match = trimmed.match(/^([^=]+)=(.*)$/)
      if (match && match[1] && match[2]) {
        const key = match[1].trim()
        let value = match[2].trim()
        
        // 去除引号
        if ((value.startsWith('"') && value.endsWith('"')) || 
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1)
        }
        
        process.env[key] = value
      }
    })
  }
}

/**
 * 单次命令模式
 */
async function runOnce(userMessage: string, llm: any) {
  console.log(`用户: ${userMessage}\n`)
  console.log('Agent 正在思考...\n')

  const agent = new Agent(llm, allTools, {
    maxSteps: 10,
    temperature: 1.0,
    maxTokens: 4096
  })

  const result = await agent.run(userMessage)

  // 显示结果
  console.log('---')
  console.log(`\nAgent: ${result.finalText}\n`)

  // 显示统计信息
  console.log('---')
  console.log('统计信息:')
  console.log(`  执行步数: ${result.steps}`)
  console.log(`  输入 tokens: ${result.usage.totalInputTokens}`)
  console.log(`  输出 tokens: ${result.usage.totalOutputTokens}`)
  console.log(`  总计 tokens: ${result.usage.totalInputTokens + result.usage.totalOutputTokens}`)

  // 如果想看完整的消息历史（调试用）
  if (process.env.DEBUG === 'true') {
    console.log('\n--- 完整消息历史 ---')
    console.log(JSON.stringify(result.messages, null, 2))
  }
}

/**
 * 主函数
 */
async function main() {
  try {
    // 1. 加载环境变量
    await loadEnv()
    
    // 2. 创建 LLM 客户端
    const llm = createClientFromEnv()

    // 3. 检查命令行参数
    const args = process.argv.slice(2)
    
    if (args.length === 0) {
      // 没有参数 - 启动 REPL 交互模式
      console.log('正在启动交互模式...')
      
      const storage = new SessionStorage()
      const sessionId = 'default'
      
      // 启动 REPL（不等待返回）
      startREPL({ llm, sessionId, storage })
      
      // 使用 setInterval 保持进程运行
      setInterval(() => {}, 1000000)
      
      // 永不返回
      return
    } else {
      // 有参数 - 单次命令模式
      const userMessage = args.join(' ')
      console.log('正在初始化 Agent...\n')
      await runOnce(userMessage, llm)
    }

  } catch (error: any) {
    // 错误处理
    console.error('\n错误:', error.message)
    
    if (error.message.includes('ANTHROPIC_API_KEY')) {
      console.error('\n请检查:')
      console.error('  1. 是否创建了 .env 文件')
      console.error('  2. 是否设置了 ANTHROPIC_API_KEY')
      console.error('  3. 如果使用第三方服务，是否设置了 ANTHROPIC_BASE_URL')
    }
    
    process.exit(1)
  }
}

// 运行主函数
main()
