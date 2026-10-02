/**
 * /delete 命令
 * 
 * 删除会话
 */

import type { Command, CommandContext } from './types'

export const deleteCommand: Command = {
  name: 'delete',
  aliases: ['del', 'rm'],
  description: '删除会话',
  usage: '/delete <session-id>',
  
  async execute(args: string[], context: CommandContext): Promise<void> {
    const { sessionManager, storage } = context
    
    if (args.length === 0) {
      console.log('\n错误: 请指定要删除的会话 ID')
      console.log('用法: /delete <session-id>')
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
      console.log()
      return
    }
    
    // 不能删除当前会话
    if (sessionManager.getCurrentSessionId() === targetSessionId) {
      console.log('\n错误: 无法删除当前会话')
      console.log('提示: 请先切换到其他会话，然后再删除')
      console.log()
      return
    }
    
    try {
      // 加载会话信息以显示提示
      const sessionData = await storage.loadSession(targetSessionId)
      if (sessionData) {
        const displayName = sessionData.metadata.name || targetSessionId
        const messageCount = sessionData.metadata.messageCount
        
        console.log(`\n将要删除会话: ${displayName}`)
        console.log(`消息数: ${messageCount}`)
        console.log('警告: 此操作无法撤销！')
        console.log()
        console.log('请再次输入命令确认: /delete! ' + targetSessionId)
        console.log()
        return
      }
      
      // 这里不会执行到，因为上面已经检查过存在性
    } catch (error: any) {
      console.error('\n错误:', error.message)
      console.log()
    }
  }
}

/**
 * /delete! 命令（带感叹号的强制删除）
 * 
 * 确认删除会话
 */
export const deleteConfirmCommand: Command = {
  name: 'delete!',
  aliases: ['del!', 'rm!'],
  description: '确认删除会话',
  usage: '/delete! <session-id>',
  
  async execute(args: string[], context: CommandContext): Promise<void> {
    const { sessionManager, storage } = context
    
    if (args.length === 0) {
      console.log('\n错误: 请指定要删除的会话 ID')
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
      console.log()
      return
    }
    
    // 不能删除当前会话
    if (sessionManager.getCurrentSessionId() === targetSessionId) {
      console.log('\n错误: 无法删除当前会话')
      console.log()
      return
    }
    
    try {
      await storage.deleteSession(targetSessionId)
      console.log(`\n已删除会话: ${targetSessionId}`)
      console.log()
    } catch (error: any) {
      console.error('\n删除会话失败:', error.message)
      console.log()
    }
  }
}
