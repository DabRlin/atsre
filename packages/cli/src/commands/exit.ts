/**
 * /exit 命令
 * 
 * 退出 REPL
 */

import type { Command, CommandContext } from './types'

export const exitCommand: Command = {
  name: 'exit',
  aliases: ['quit'],
  description: '退出 REPL',
  
  async execute(_args: string[], context: CommandContext): Promise<void> {
    if (context.sessionId) {
      console.log('\n再见！会话已保存到 ~/.atsre/sessions/' + context.sessionId + '.jsonl')
    } else {
      console.log('\n再见！')
    }
    context.rl.close()
    process.exit(0)
  }
}
