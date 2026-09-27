import { writeFile, mkdir } from 'fs/promises'
import { dirname } from 'path'
import { z } from 'zod'
import type { Tool } from './types'

/**
 * 写入文件工具的参数 schema
 */
const writeSchema = z.object({
  path: z.string().describe('要写入的文件路径'),
  content: z.string().describe('要写入的文件内容')
})

/**
 * 写入文件工具
 * 
 * 功能：写入内容到指定路径的文件
 * 特性：如果目录不存在，会自动创建
 * 注意：会覆盖已存在的文件
 */
export const writeTool: Tool<typeof writeSchema> = {
  name: 'write',
  description: '写入内容到文件。如果文件已存在会被覆盖，如果目录不存在会自动创建。',
  inputSchema: writeSchema,
  
  async execute({ path, content }) {
    try {
      // 确保父目录存在
      const dir = dirname(path)
      await mkdir(dir, { recursive: true })
      
      // 写入文件
      await writeFile(path, content, 'utf-8')
      
      return `文件已成功写入: ${path}`
    } catch (error: any) {
      // 根据错误类型返回友好的错误信息
      if (error.code === 'EACCES') {
        throw new Error(`无权限写入文件: ${path}`)
      } else if (error.code === 'EISDIR') {
        throw new Error(`${path} 是一个目录，不能作为文件写入`)
      } else {
        throw new Error(`写入文件失败: ${error.message}`)
      }
    }
  }
}
