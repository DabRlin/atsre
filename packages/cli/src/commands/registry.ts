/**
 * 命令注册中心
 * 
 * 管理所有可用命令的注册和查找
 */

import type { Command } from './types'

/**
 * 命令注册表
 */
export class CommandRegistry {
  private commands: Map<string, Command> = new Map()
  private aliases: Map<string, string> = new Map()

  /**
   * 注册命令
   * 
   * @param command - 要注册的命令
   */
  register(command: Command): void {
    // 注册主命令名
    this.commands.set(command.name, command)

    // 注册别名
    if (command.aliases) {
      for (const alias of command.aliases) {
        this.aliases.set(alias, command.name)
      }
    }
  }

  /**
   * 批量注册命令
   * 
   * @param commands - 命令数组
   */
  registerAll(commands: Command[]): void {
    for (const command of commands) {
      this.register(command)
    }
  }

  /**
   * 获取命令
   * 
   * @param nameOrAlias - 命令名或别名
   * @returns 命令对象，如果不存在返回 undefined
   */
  get(nameOrAlias: string): Command | undefined {
    // 去除开头的斜杠
    const name = nameOrAlias.startsWith('/') ? nameOrAlias.slice(1) : nameOrAlias

    // 先尝试直接获取
    let command = this.commands.get(name)
    
    // 如果不存在，尝试通过别名获取
    if (!command) {
      const mainName = this.aliases.get(name)
      if (mainName) {
        command = this.commands.get(mainName)
      }
    }

    return command
  }

  /**
   * 获取所有命令
   * 
   * @returns 所有已注册的命令
   */
  getAll(): Command[] {
    return Array.from(this.commands.values())
  }

  /**
   * 检查命令是否存在
   * 
   * @param nameOrAlias - 命令名或别名
   * @returns 是否存在
   */
  has(nameOrAlias: string): boolean {
    return this.get(nameOrAlias) !== undefined
  }
}

/**
 * 全局命令注册表实例
 */
export const commandRegistry = new CommandRegistry()
