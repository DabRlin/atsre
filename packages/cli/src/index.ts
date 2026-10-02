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
import { SessionStorage, defaultAutoNamer } from '@atsre/session'
import { startREPL } from './repl'
import { resolve } from 'path'
import { existsSync } from 'fs'

/**
 * 加载环境变量
 * 
 * 从 ~/.atsre/config.env 读取配置
 */
async function loadEnv() {
  const homeDir = process.env.HOME || process.env.USERPROFILE || '.'
  const configDir = resolve(homeDir, '.atsre')
  const envPath = resolve(configDir, 'config.env')
  
  // 如果配置文件不存在，尝试从旧位置迁移或创建示例
  if (!existsSync(envPath)) {
    await initConfig(configDir, envPath)
  }
  
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
 * 初始化配置文件
 * 
 * 如果配置文件不存在，创建配置模板
 */
async function initConfig(configDir: string, envPath: string) {
  const { mkdir, writeFile } = await import('fs/promises')
  
  // 确保配置目录存在
  if (!existsSync(configDir)) {
    await mkdir(configDir, { recursive: true })
  }
  
  // 创建配置模板
  const template = `# Anthropic API 配置
# 如果使用官方 API，只需要填写 API_KEY
ANTHROPIC_API_KEY=your_api_key_here

# 如果使用第三方兼容服务，需要同时配置 BASE_URL
# ANTHROPIC_BASE_URL=https://your-custom-endpoint.com

# 指定使用的模型（可选，默认使用 claude-sonnet-4-20250514）
# 常见模型：
# - claude-3-5-sonnet-20241022 (Sonnet 3.5 最新)
# - claude-3-opus-20240229 (Opus 3)
# - claude-3-sonnet-20240229 (Sonnet 3)
# ANTHROPIC_MODEL=claude-3-5-sonnet-20241022
`
  await writeFile(envPath, template, 'utf-8')
  console.log(`\n配置文件已创建: ${envPath}`)
  console.log('请编辑该文件并填入您的 API 配置\n')
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
 * 列出所有会话
 */
async function listSessions(storage: SessionStorage) {
  const sessions = await storage.listSessions()
  
  if (sessions.length === 0) {
    console.log('\n暂无会话\n')
    return
  }
  
  console.log('\n可用会话列表：\n')
  
  sessions.forEach((session, index) => {
    const number = `[${index + 1}]`
    const id = session.id
    const name = session.name ? ` (${session.name})` : ''
    const messageCount = `${session.messageCount} 条消息`
    
    // 格式化时间
    const date = new Date(session.updatedAt)
    const now = new Date()
    const isToday = date.toDateString() === now.toDateString()
    const timeStr = isToday 
      ? `今天 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
      : `${date.getMonth() + 1}/${date.getDate()}`
    
    console.log(`${number} ${id}${name}`)
    console.log(`    最后更新: ${timeStr} | ${messageCount}`)
    console.log()
  })
}

/**
 * 主函数
 */
async function main() {
  try {
    // 1. 加载环境变量
    await loadEnv()

    // 2. 检查命令行参数
    const args = process.argv.slice(2)
    
    // 3. 创建存储实例（传入 autoNamer）
    const storage = new SessionStorage(undefined, undefined, defaultAutoNamer)
    
    // 4. 处理斜杠命令
    if (args.length > 0 && args[0] && args[0].startsWith('/')) {
      const command = args[0]
      
      if (command === '/list') {
        // 列出所有会话
        await listSessions(storage)
        return
      } else if (command === '/session') {
        // 指定会话启动 REPL
        if (args.length < 2 || !args[1]) {
          console.error('错误: /session 命令需要指定会话 ID')
          console.error('用法: bun run dev /session <session-id>')
          console.error('提示: 使用 /list 查看所有可用会话')
          process.exit(1)
        }
        
        const sessionId: string = args[1]
        
        // 检查会话是否存在
        if (!storage.exists(sessionId)) {
          console.error(`错误: 会话不存在: ${sessionId}`)
          console.error('提示: 使用 /list 查看所有可用会话')
          process.exit(1)
        }
        
        // 创建 LLM 客户端
        const llm = createClientFromEnv()
        
        console.log(`正在启动会话: ${sessionId}`)
        
        // 启动 REPL
        startREPL({ llm, sessionId, storage })
        
        // 保持进程运行
        setInterval(() => {}, 1000000)
        return
      } else {
        console.error(`错误: 未知命令: ${command}`)
        console.error('可用命令:')
        console.error('  /list           - 列出所有会话')
        console.error('  /session <id>   - 指定会话启动')
        process.exit(1)
      }
    }
    
    // 5. 没有参数 - 启动 REPL，延迟创建会话
    if (args.length === 0) {
      const llm = createClientFromEnv()
      console.log('正在启动交互模式...')
      console.log('提示: 使用 /help 查看可用命令\n')
      
      // 启动 REPL，不预先创建会话（延迟创建）
      startREPL({ llm, sessionId: null, storage })
      
      // 保持进程运行
      setInterval(() => {}, 1000000)
      return
    }
    
    // 6. 有参数但不是斜杠命令 - 单次命令模式
    const llm = createClientFromEnv()
    const userMessage = args.join(' ')
    console.log('正在初始化 Agent...\n')
    await runOnce(userMessage, llm)

  } catch (error: any) {
    // 错误处理
    console.error('\n错误:', error.message)
    
    if (error.message.includes('ANTHROPIC_API_KEY')) {
      console.error('\n请检查:')
      console.error('  1. 是否创建了 config.env 文件')
      console.error('  2. 是否设置了 ANTHROPIC_API_KEY')
      console.error('  3. 如果使用第三方服务，是否设置了 ANTHROPIC_BASE_URL')
    }
    
    process.exit(1)
  }
}

// 运行主函数
main()
