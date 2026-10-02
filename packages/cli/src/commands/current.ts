/**
 * /current 命令
 * 
 * 显示当前会话信息
 */

import type { Command, CommandContext } from './types'

export const currentCommand: Command = {
  name: 'current',
  description: '显示当前会话信息',
  
  async execute(_args: string[], context: CommandContext): Promise<void> {
    if (!context.sessionId) {
      console.log('\n错误: 尚未创建会话\n')
      return
    }
    
    const sessionData = await context.storage.loadSession(context.sessionId)
    
    if (!sessionData) {
      console.log('\n错误: 无法加载当前会话\n')
      return
    }
    
    const metadata = sessionData.metadata
    
    console.log('\n当前会话信息：')
    console.log(`  ID: ${metadata.id}`)
    console.log(`  名称: ${metadata.name || '(未命名)'}`)
    
    if (metadata.nameSource) {
      const source = metadata.nameSource === 'auto' ? '自动生成' : '用户设置'
      console.log(`  名称来源: ${source}`)
    }
    
    console.log(`  消息数: ${metadata.messageCount}`)
    console.log(`  创建时间: ${new Date(metadata.createdAt).toLocaleString()}`)
    console.log(`  最后更新: ${new Date(metadata.updatedAt).toLocaleString()}`)
    console.log()
  }
}
