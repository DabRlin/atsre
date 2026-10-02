import { z } from 'zod'
import type { Tool } from './types'

/**
 * 网络搜索工具的参数 schema
 */
const searchSchema = z.object({
  query: z.string().describe('要搜索的关键词或问题'),
  maxResults: z.number().optional().describe('最多返回的结果数量，默认为 5')
})

/**
 * 网络搜索工具
 * 
 * 功能：使用 DuckDuckGo 搜索网络内容
 * 使用场景：
 * - 查找技术文档和 API 参考
 * - 搜索错误信息的解决方案
 * - 获取最新的技术资讯
 * - 查找代码示例和教程
 * 
 * 优势：
 * - 无需 API key，开箱即用
 * - 注重隐私，不追踪用户
 * - 返回结构化的搜索结果
 */
export const searchTool: Tool<typeof searchSchema> = {
  name: 'search',
  description: '在网络上搜索信息。使用 DuckDuckGo 搜索引擎，返回相关的网页标题、链接和摘要。适用于查找技术文档、API 参考、错误解决方案等。',
  inputSchema: searchSchema,
  
  async execute({ query, maxResults = 5 }) {
    try {
      // 使用 curl 命令行工具进行搜索（绕过 Bun fetch 的证书问题）
      const encodedQuery = encodeURIComponent(query)
      const url = `https://html.duckduckgo.com/html/?q=${encodedQuery}`
      
      // 使用 bash 工具的底层实现
      const { exec } = await import('child_process')
      const { promisify } = await import('util')
      const execAsync = promisify(exec)
      
      // 使用 curl 获取搜索结果（使用 /usr/bin/curl 完整路径）
      // 支持通过环境变量设置代理：http_proxy、https_proxy 或 HTTP_PROXY、HTTPS_PROXY
      const proxy = process.env.https_proxy || process.env.HTTPS_PROXY || process.env.http_proxy || process.env.HTTP_PROXY
      const proxyFlag = proxy ? `-x "${proxy}"` : ''
      
      const { stdout, stderr } = await execAsync(
        `/usr/bin/curl -s -L ${proxyFlag} -A "Mozilla/5.0 (compatible; ATSRE/0.2.0)" "${url}"`,
        { 
          timeout: 30000, 
          maxBuffer: 5 * 1024 * 1024,
          env: { ...process.env }
        }
      )
      
      if (!stdout) {
        return `未找到相关结果：${query}`
      }
      
      // 解析 HTML 提取搜索结果
      const results = parseSearchResults(stdout, maxResults)
      
      if (results.length === 0) {
        return `未找到相关结果：${query}`
      }
      
      // 格式化输出
      let output = `找到 ${results.length} 条搜索结果：\n\n`
      
      results.forEach((result, index) => {
        output += `${index + 1}. ${result.title}\n`
        output += `   链接: ${result.url}\n`
        if (result.snippet) {
          output += `   摘要: ${result.snippet}\n`
        }
        output += '\n'
      })
      
      return output.trim()
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        throw new Error(`网络搜索失败: 系统中未找到 curl 命令（路径: /usr/bin/curl）。`)
      } else if (error.killed) {
        throw new Error(`网络搜索超时: ${query}`)
      } else if (error.stderr) {
        throw new Error(`网络搜索失败: ${error.stderr}`)
      } else {
        throw new Error(`网络搜索失败: ${error.message}`)
      }
    }
  }
}

/**
 * 搜索结果接口
 */
interface SearchResult {
  title: string
  url: string
  snippet?: string
}

/**
 * 解析 DuckDuckGo HTML 搜索结果
 * 
 * @param html - DuckDuckGo 返回的 HTML
 * @param maxResults - 最多返回的结果数量
 * @returns 解析后的搜索结果数组
 */
function parseSearchResults(html: string, maxResults: number): SearchResult[] {
  const results: SearchResult[] = []
  
  try {
    // 使用正则表达式提取搜索结果
    // DuckDuckGo 的搜索结果包含在 class="result" 的 div 中
    
    // 提取结果块
    const resultRegex = /<div[^>]*class="result[^"]*"[^>]*>(.*?)<\/div>\s*<\/div>/gs
    const resultMatches = html.matchAll(resultRegex)
    
    for (const match of resultMatches) {
      if (results.length >= maxResults) break
      
      const resultHtml = match[1]
      if (!resultHtml) continue
      
      // 提取标题和链接
      const titleRegex = /<a[^>]*class="result__a"[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/s
      const titleMatch = resultHtml.match(titleRegex)
      
      if (titleMatch && titleMatch[1] && titleMatch[2]) {
        const url = decodeURIComponent(titleMatch[1])
        const title = stripHtml(titleMatch[2])
        
        // 提取摘要
        const snippetRegex = /<a[^>]*class="result__snippet"[^>]*>(.*?)<\/a>/s
        const snippetMatch = resultHtml.match(snippetRegex)
        const snippet = snippetMatch && snippetMatch[1] ? stripHtml(snippetMatch[1]) : undefined
        
        results.push({ title, url, snippet })
      }
    }
    
    return results
  } catch (error) {
    // 如果解析失败，返回空数组
    console.error('解析搜索结果失败:', error)
    return []
  }
}

/**
 * 移除 HTML 标签并解码 HTML 实体
 * 
 * @param html - 包含 HTML 标签的文本
 * @returns 纯文本内容
 */
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, '') // 移除 HTML 标签
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ') // 合并多个空格
    .trim()
}
