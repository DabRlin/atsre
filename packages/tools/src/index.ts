/**
 * @atsre/tools
 * 
 * Agent 的工具集合，包含文件操作和命令执行工具
 */

export { readTool } from './read'
export { writeTool } from './write'
export { bashTool } from './bash'
export { editTool } from './edit'
export { grepTool } from './grep'
export { searchTool } from './search'
export type { Tool, AnthropicTool } from './types'
export { toAnthropicTool } from './types'

import { readTool } from './read'
import { writeTool } from './write'
import { bashTool } from './bash'
import { editTool } from './edit'
import { grepTool } from './grep'
// import { searchTool } from './search' // 暂时禁用：DuckDuckGo 反爬机制

/**
 * 所有可用的工具列表
 * 
 * 注意：searchTool 代码已实现但暂未启用
 * 原因：DuckDuckGo 的反爬机制导致搜索失败
 * 未来可考虑：Parallel Search API 或 Brave Search API
 */
export const allTools = [readTool, writeTool, bashTool, editTool, grepTool]
