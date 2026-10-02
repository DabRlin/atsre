/**
 * /new 命令
 * 
 * 创建新会话并切换
 */

import type { Command, CommandContext } from './types'

export const newCommand: Command = {
  name: 'new',
  description: '创建新会话',
  usage: '/new [name]',
  
  async execute(args: string[], context: CommandContext): Promise<void> {
    const { sessionManager } = context
    
    // 获取可选的会话名称
    const name = args.length > 0 ? args.join(' ') : undefined
    
    try {
      // 创建新会话（会自动切换）
      const newSessionId = await sessionManager.createNewSession(undefined, name)
      
      console.log(`\n已创建并切换到新会话: ${newSessionId}`)
      if (name) {
        console.log(`会话名称: ${name}`)
      }
      console.log()
    } catch (error: any) {
      console.error('\n创建会话失败:', error.message)
      console.log()
    }
  }
}
