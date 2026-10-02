/**
 * /sessions 命令
 * 
 * 列出所有可用的会话
 */

import type { Command, CommandContext } from './types'

export const sessionsCommand: Command = {
  name: 'sessions',
  description: '列出所有会话',
  
  async execute(_args: string[], context: CommandContext): Promise<void> {
    const sessions = await context.storage.listSessions()
    
    if (sessions.length === 0) {
      console.log('\n暂无会话\n')
      return
    }
    
    console.log('\n可用会话列表：\n')
    
    sessions.forEach((session, index) => {
      const number = `[${index + 1}]`
      
      // 优先显示名称，如果没有名称则显示 ID
      let displayName: string
      if (session.name) {
        displayName = `${session.name} (${session.id})`
      } else {
        displayName = session.id
      }
      
      const messageCount = `${session.messageCount} 条消息`
      
      // 格式化时间
      const date = new Date(session.updatedAt)
      const now = new Date()
      const isToday = date.toDateString() === now.toDateString()
      const timeStr = isToday 
        ? `今天 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
        : `${date.getMonth() + 1}/${date.getDate()}`
      
      console.log(`${number} ${displayName}`)
      console.log(`    最后更新: ${timeStr} | ${messageCount}`)
      console.log()
    })
  }
}
