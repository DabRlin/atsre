/**
 * /help 命令
 * 
 * 显示所有可用命令的帮助信息
 */

import type { Command, CommandContext } from './types'
import { commandRegistry } from './registry'

export const helpCommand: Command = {
  name: 'help',
  description: '显示此帮助信息',
  
  async execute(_args: string[], _context: CommandContext): Promise<void> {
    console.log('\n可用命令：\n')
    
    const commands = commandRegistry.getAll()
    
    for (const cmd of commands) {
      const aliases = cmd.aliases ? ` (${cmd.aliases.join(', ')})` : ''
      const usage = cmd.usage ? `\n      用法: ${cmd.usage}` : ''
      console.log(`  /${cmd.name}${aliases}`)
      console.log(`      ${cmd.description}${usage}`)
    }
    
    console.log()
  }
}
