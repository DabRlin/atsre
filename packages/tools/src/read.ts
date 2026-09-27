import { readFile } from 'fs/promises'
import { z } from 'zod'
import type { Tool } from './types'

/**
 * 读取文件工具的参数 schema
 */
const readSchema = z.object({
  path: z.string().describe('要读取的文件路径')
})

/**
 * 读取文件工具
 * 
 * 功能：读取指定路径的文件内容
 * 错误处理：区分文件不存在、权限错误等情况
 */
export const readTool: Tool<typeof readSchema> = {
  name: 'read',
  description: '读取文件内容。返回文件的完整文本内容。',
  inputSchema: readSchema,
  
  async execute({ path }) {
    try {
      // 使用 utf-8 编码读取文件
      const content = await readFile(path, 'utf-8')
      return content
    } catch (error: any) {
      // 根据错误类型返回友好的错误信息
      if (error.code === 'ENOENT') {
        throw new Error(`文件不存在: ${path}`)
      } else if (error.code === 'EACCES') {
        throw new Error(`无权限读取文件: ${path}`)
      } else if (error.code === 'EISDIR') {
        throw new Error(`${path} 是一个目录，不能作为文件读取`)
      } else {
        throw new Error(`读取文件失败: ${error.message}`)
      }
    }
  }
}
