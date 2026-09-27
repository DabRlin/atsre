import { exec } from 'child_process'
import { promisify } from 'util'
import { z } from 'zod'
import type { Tool } from './types'

// 将 exec 转换为 Promise 版本
const execAsync = promisify(exec)

/**
 * 执行 bash 命令工具的参数 schema
 */
const bashSchema = z.object({
  command: z.string().describe('要执行的 shell 命令')
})

/**
 * 执行 bash 命令工具
 * 
 * 功能：在 shell 中执行命令，返回输出结果
 * 安全性：当前版本直接执行命令，没有沙箱隔离
 * 注意：命令失败时会抛出错误，包含 stderr 信息
 */
export const bashTool: Tool<typeof bashSchema> = {
  name: 'bash',
  description: '执行 shell 命令。返回命令的标准输出和标准错误。命令执行失败时会报错。',
  inputSchema: bashSchema,
  
  async execute({ command }) {
    try {
      // 执行命令，设置超时为 30 秒
      const { stdout, stderr } = await execAsync(command, {
        timeout: 30000,
        maxBuffer: 1024 * 1024 // 1MB
      })
      
      // 组合输出结果
      let result = ''
      if (stdout) {
        result += stdout
      }
      if (stderr) {
        result += stderr ? `\n[stderr]\n${stderr}` : ''
      }
      
      return result || '命令执行成功（无输出）'
    } catch (error: any) {
      // 区分不同类型的错误
      if (error.killed) {
        throw new Error(`命令执行超时: ${command}`)
      } else if (error.code) {
        // 命令执行失败，返回退出码和错误信息
        const output = [
          `命令执行失败 (退出码 ${error.code}): ${command}`,
          error.stdout ? `\n[stdout]\n${error.stdout}` : '',
          error.stderr ? `\n[stderr]\n${error.stderr}` : ''
        ].filter(Boolean).join('')
        
        throw new Error(output)
      } else {
        throw new Error(`执行命令失败: ${error.message}`)
      }
    }
  }
}
