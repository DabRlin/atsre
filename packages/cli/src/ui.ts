/**
 * UI 工具包
 * 
 * 提供彩色输出、格式化等功能，提升用户体验
 */

import chalk from 'chalk'

/**
 * 显示欢迎信息
 */
export function showWelcome(): void {
  console.log('\n' + chalk.bold.cyan('欢迎使用 ATSRE Agent!'))
  console.log(chalk.gray('输入 /help 查看可用命令，/exit 退出\n'))
}

/**
 * 显示思考状态
 */
export function showThinking(): void {
  console.log('\n' + chalk.yellow('⚡ Agent 正在思考...\n'))
}

/**
 * 显示工具调用
 * 
 * @param toolName - 工具名称
 * @param args - 工具参数
 */
export function showToolCall(toolName: string, args: any): void {
  console.log(chalk.blue(`🔧 调用工具: ${toolName}`))
  console.log(chalk.gray(`   参数: ${JSON.stringify(args, null, 2).replace(/\n/g, '\n   ')}`))
}

/**
 * 显示工具结果
 * 
 * @param result - 工具执行结果
 */
export function showToolResult(result: string): void {
  const truncated = result.length > 200 ? result.slice(0, 200) + '...' : result
  console.log(chalk.gray(`   结果: ${truncated}\n`))
}

/**
 * 显示 Agent 回复
 * 
 * @param text - 回复文本
 */
export function showAgentReply(text: string): void {
  console.log(chalk.green('━'.repeat(60)))
  console.log(chalk.bold.green('\n💬 Agent:'))
  console.log(chalk.white(text))
  console.log(chalk.green('\n' + '━'.repeat(60)))
}

/**
 * 显示统计信息
 * 
 * @param stats - 统计数据
 */
export function showStats(stats: {
  steps: number
  inputTokens: number
  outputTokens: number
}): void {
  const totalTokens = stats.inputTokens + stats.outputTokens
  const estimatedCost = calculateCost(stats.inputTokens, stats.outputTokens)
  
  console.log(chalk.gray(
    `\n📊 步数: ${stats.steps} | ` +
    `输入: ${stats.inputTokens.toLocaleString()} tokens | ` +
    `输出: ${stats.outputTokens.toLocaleString()} tokens | ` +
    `总计: ${totalTokens.toLocaleString()} tokens | ` +
    `成本: $${estimatedCost.toFixed(4)}`
  ))
}

/**
 * 显示错误信息
 * 
 * @param error - 错误对象或消息
 */
export function showError(error: Error | string): void {
  const message = typeof error === 'string' ? error : error.message
  console.log('\n' + chalk.red('❌ 错误: ') + chalk.white(message))
}

/**
 * 显示成功信息
 * 
 * @param message - 成功消息
 */
export function showSuccess(message: string): void {
  console.log('\n' + chalk.green('✓ ') + chalk.white(message))
}

/**
 * 显示警告信息
 * 
 * @param message - 警告消息
 */
export function showWarning(message: string): void {
  console.log('\n' + chalk.yellow('⚠ ') + chalk.white(message))
}

/**
 * 显示信息提示
 * 
 * @param message - 提示消息
 */
export function showInfo(message: string): void {
  console.log(chalk.cyan('ℹ ') + chalk.white(message))
}

/**
 * 计算估算成本
 * 
 * 基于 Claude Sonnet 3.5 的定价：
 * - Input: $3 / 1M tokens
 * - Output: $15 / 1M tokens
 * 
 * @param inputTokens - 输入 token 数
 * @param outputTokens - 输出 token 数
 * @returns 估算成本（美元）
 */
function calculateCost(inputTokens: number, outputTokens: number): number {
  const inputCost = (inputTokens / 1_000_000) * 3
  const outputCost = (outputTokens / 1_000_000) * 15
  return inputCost + outputCost
}

/**
 * 显示会话信息
 * 
 * @param sessionId - 会话 ID
 * @param sessionName - 会话名称（可选）
 */
export function showSessionInfo(sessionId: string, sessionName?: string): void {
  if (sessionName) {
    console.log(chalk.cyan(`\n📝 会话: ${sessionName} (${sessionId})`))
  } else {
    console.log(chalk.cyan(`\n📝 会话: ${sessionId}`))
  }
}
