/**
 * @atsre/tools
 * 
 * Agent 的工具集合，包含文件操作和命令执行工具
 */

export { readTool } from './read'
export { writeTool } from './write'
export { bashTool } from './bash'
export type { Tool, AnthropicTool } from './types'
export { toAnthropicTool } from './types'

import { readTool } from './read'
import { writeTool } from './write'
import { bashTool } from './bash'

/**
 * 所有可用的工具列表
 */
export const allTools = [readTool, writeTool, bashTool] as const
