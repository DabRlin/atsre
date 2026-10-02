import { readFile, writeFile } from 'fs/promises'
import { z } from 'zod'
import type { Tool } from './types'

/**
 * 编辑文件工具的参数 schema
 */
const editSchema = z.object({
  path: z.string().describe('要编辑的文件路径'),
  oldText: z.string().describe('要替换的旧文本内容（必须精确匹配）'),
  newText: z.string().describe('新的文本内容')
})

/**
 * 编辑文件工具
 * 
 * 功能：精确替换文件中的文本片段
 * 优势：相比 write 工具，只需要指定修改部分，大幅节省 token
 * 
 * 注意：
 * - oldText 必须在文件中精确匹配（包括空格、换行）
 * - 如果有多个匹配，只会替换第一个
 * - 如果没有匹配，会报错
 */
export const editTool: Tool<typeof editSchema> = {
  name: 'edit',
  description: '精确编辑文件中的文本。通过替换 oldText 为 newText 来修改文件。oldText 必须精确匹配文件中的内容（包括空格和换行）。相比重写整个文件，这个工具更高效，节省 token。',
  inputSchema: editSchema,
  
  async execute({ path, oldText, newText }) {
    try {
      // 1. 读取文件内容
      const content = await readFile(path, 'utf-8')
      
      // 2. 检查 oldText 是否存在
      if (!content.includes(oldText)) {
        throw new Error(
          `在文件 ${path} 中未找到要替换的文本。` +
          `\n提示：oldText 必须精确匹配，包括空格、换行等。` +
          `\n请先使用 read 工具查看文件内容，确保文本完全一致。`
        )
      }
      
      // 3. 检查是否有多个匹配
      const matches = content.split(oldText).length - 1
      if (matches > 1) {
        throw new Error(
          `在文件 ${path} 中找到 ${matches} 处匹配的文本。` +
          `\n为避免歧义，oldText 必须唯一匹配。` +
          `\n请提供更多上下文以精确定位要修改的位置。`
        )
      }
      
      // 4. 执行替换
      const newContent = content.replace(oldText, newText)
      
      // 5. 写回文件
      await writeFile(path, newContent, 'utf-8')
      
      return `文件 ${path} 已成功编辑。替换了 ${oldText.length} 个字符为 ${newText.length} 个字符。`
    } catch (error: any) {
      // 处理文件操作错误
      if (error.code === 'ENOENT') {
        throw new Error(`文件不存在: ${path}`)
      } else if (error.code === 'EACCES') {
        throw new Error(`无权限编辑文件: ${path}`)
      } else if (error.code === 'EISDIR') {
        throw new Error(`${path} 是一个目录，不能作为文件编辑`)
      } else if (error.message.includes('未找到') || error.message.includes('多处匹配')) {
        // 重新抛出我们自己的错误信息
        throw error
      } else {
        throw new Error(`编辑文件失败: ${error.message}`)
      }
    }
  }
}
