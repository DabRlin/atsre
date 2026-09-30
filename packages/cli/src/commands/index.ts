/**
 * 命令系统入口
 * 
 * 统一导出所有命令和注册表
 */

export { CommandRegistry, commandRegistry } from './registry'
export type { Command, CommandContext } from './types'

// 导出所有命令
export { helpCommand } from './help'
export { exitCommand } from './exit'
export { sessionsCommand } from './sessions'
export { renameCommand } from './rename'
export { currentCommand } from './current'

// 自动注册所有命令
import { commandRegistry } from './registry'
import { helpCommand } from './help'
import { exitCommand } from './exit'
import { sessionsCommand } from './sessions'
import { renameCommand } from './rename'
import { currentCommand } from './current'

// 注册所有内置命令
commandRegistry.registerAll([
  helpCommand,
  exitCommand,
  sessionsCommand,
  renameCommand,
  currentCommand
])
