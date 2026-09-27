#!/usr/bin/env bun

/**
 * @atsre/cli
 * 
 * Agent 的命令行入口
 * 用法：bun run src/index.ts "你的任务描述"
 */

import { Agent } from '@atsre/core'
import { createClientFromEnv } from '@atsre/llm'
import { allTools } from '@atsre/tools'
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
 * 主函数
 */
async function main() {
  try {
    // 1. 加载环境变量
    await loadEnv()
    
    // 2. 检查命令行参数
    const args = process.argv.slice(2)
    if (args.length === 0) {
      console.log('用法: bun run src/index.ts "你的任务描述"')
      console.log('\n示例:')
      console.log('  bun run src/index.ts "创建一个 hello.txt 文件，内容是 Hello World"')
      console.log('  bun run src/index.ts "列出当前目录的所有文件"')
      process.exit(1)
    }

    const userMessage = args.join(' ')
    
    // 3. 创建 LLM 客户端
    console.log('正在初始化 Agent...\n')
    const llm = createClientFromEnv()

    // 4. 创建 Agent 实例
    const agent = new Agent(llm, allTools, {
      maxSteps: 10,
      temperature: 1.0,
      maxTokens: 4096
    })

    // 5. 运行 Agent
    console.log(`用户: ${userMessage}\n`)
    console.log('Agent 正在思考...\n')

    const result = await agent.run(userMessage)

    // 6. 显示结果
    console.log('---')
    console.log(`\nAgent: ${result.finalText}\n`)

    // 7. 显示统计信息
    console.log('---')
    console.log('统计信息:')
    console.log(`  执行步数: ${result.steps}`)
    console.log(`  输入 tokens: ${result.usage.totalInputTokens}`)
    console.log(`  输出 tokens: ${result.usage.totalOutputTokens}`)
    console.log(`  总计 tokens: ${result.usage.totalInputTokens + result.usage.totalOutputTokens}`)

    // 8. 如果想看完整的消息历史（调试用）
    if (process.env.DEBUG === 'true') {
      console.log('\n--- 完整消息历史 ---')
      console.log(JSON.stringify(result.messages, null, 2))
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
