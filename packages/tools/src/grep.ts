import { exec } from 'child_process'
import { promisify } from 'util'
import { z } from 'zod'
import type { Tool } from './types'

const execAsync = promisify(exec)

/**
 * 搜索文件内容工具的参数 schema
 */
const grepSchema = z.object({
  pattern: z.string().describe('要搜索的文本模式（支持正则表达式）'),
  path: z.string().optional().describe('搜索路径（文件或目录），默认为当前目录'),
  filePattern: z.string().optional().describe('文件名过滤模式（如 "*.ts" 只搜索 TypeScript 文件）')
})

/**
 * 搜索文件内容工具
 * 
 * 功能：在文件中搜索指定的文本模式
 * 使用场景：
 * - 查找函数、类、变量的定义位置
 * - 搜索特定的错误信息或日志
 * - 代码审查和重构
 * 
 * 优势：
 * - 支持正则表达式
 * - 可以限定文件类型
 * - 返回匹配的行号和上下文
 */
export const grepTool: Tool<typeof grepSchema> = {
  name: 'grep',
  description: '在文件中搜索文本内容。支持正则表达式，可以指定搜索路径和文件类型。返回匹配的文件路径、行号和内容。用于查找代码定义、搜索特定文本等场景。',
  inputSchema: grepSchema,
  
  async execute({ pattern, path = '.', filePattern }) {
    try {
      // 构建 ripgrep 命令（如果可用，否则使用 grep）
      let command: string
      
      // 先检测是否有 ripgrep（更快更好的工具）
      try {
        await execAsync('which rg')
        // 使用 ripgrep
        command = `rg -n --color never "${pattern}"`
        
        if (filePattern) {
          command += ` -g "${filePattern}"`
        }
        
        command += ` "${path}"`
      } catch {
        // fallback 到系统 grep
        command = `grep -rn "${pattern}"`
        
        if (filePattern) {
          command += ` --include="${filePattern}"`
        }
        
        command += ` "${path}"`
      }
      
      // 执行搜索
      const { stdout, stderr } = await execAsync(command, {
        timeout: 30000,
        maxBuffer: 5 * 1024 * 1024 // 5MB
      })
      
      if (!stdout && !stderr) {
        return `未找到匹配的内容（模式: ${pattern}）`
      }
      
      // 处理输出，限制结果数量
      const lines = stdout.split('\n').filter(Boolean)
      
      if (lines.length === 0) {
        return `未找到匹配的内容（模式: ${pattern}）`
      }
      
      // 如果结果太多，截断并提示
      const maxLines = 100
      if (lines.length > maxLines) {
        const truncated = lines.slice(0, maxLines).join('\n')
        return `找到 ${lines.length} 处匹配（显示前 ${maxLines} 条）：\n\n${truncated}\n\n提示：结果过多，建议使用更精确的搜索模式或限定文件类型。`
      }
      
      return `找到 ${lines.length} 处匹配：\n\n${stdout}`
    } catch (error: any) {
      // 命令执行失败（可能是没找到匹配）
      if (error.code === 1 && !error.stderr) {
        // grep/rg 返回 1 表示没有匹配
        return `未找到匹配的内容（模式: ${pattern}）`
      } else if (error.killed) {
        throw new Error(`搜索超时: ${pattern}`)
      } else if (error.stderr) {
        throw new Error(`搜索失败: ${error.stderr}`)
      } else {
        throw new Error(`搜索失败: ${error.message}`)
      }
    }
  }
}
