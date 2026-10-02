/**
 * /switch 命令
 * 
 * 切换到已存在的会话
 */

import type { Command, CommandContext } from './types'

export const switchCommand: Command = {
  name: 'switch',
  description: '切换会话',
  usage: '/switch <session-id>',
  
  async execute(args: string[], context: CommandContext): Promise<void> {
    const { sessionManager, storage } = context
    
    if (args.length === 0) {
      console.log('\n错误: 请指定会话 ID')
      console.log('用法: /switch <session-id>')
      console.log('提示: 使用 /sessions 查看所有可用会话')
      console.log()
      return
    }
    
    const targetSessionId = args[0]
    if (!targetSessionId) {
      console.log('\n错误: 会话 ID 不能为空')
      console.log()
      return
    }
    
    // 检查会话是否存在
    if (!storage.exists(targetSessionId)) {
      console.log(`\n错误: 会话不存在: ${targetSessionId}`)
      console.log('提示: 使用 /sessions 查看所有可用会话')
      console.log()
      return
    }
    
    // 检查是否已经在目标会话中
    if (sessionManager.getCurrentSessionId() === targetSessionId) {
      console.log(`\n已在会话 ${targetSessionId} 中`)
      console.log()
      return
    }
    
    try {
      // 切换会话
      await sessionManager.switchToSession(targetSessionId)
      console.log()
    } catch (error: any) {
      console.error('\n切换会话失败:', error.message)
      console.log()
    }
  }
}
