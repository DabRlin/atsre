/**
 * /rename 命令
 * 
 * 重命名当前会话
 */

import type { Command, CommandContext } from './types'

export const renameCommand: Command = {
  name: 'rename',
  description: '重命名当前会话',
  usage: '/rename <new-name>',
  
  async execute(args: string[], context: CommandContext): Promise<void> {
    if (!context.sessionId) {
      console.log('\n错误: 尚未创建会话\n')
      return
    }
    
    if (args.length === 0) {
      console.log('\n错误: 请提供新名称')
      console.log('用法: /rename <new-name>')
      console.log()
      return
    }
    
    const newName = args.join(' ')
    await context.storage.renameSession(context.sessionId, newName)
    console.log(`\n会话已重命名为: ${newName}\n`)
  }
}
