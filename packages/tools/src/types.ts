import type { z } from 'zod'

/**
 * 工具定义接口
 * 
 * 每个工具需要提供：
 * - name: 工具名称
 * - description: 工具描述（给 LLM 看的）
 * - inputSchema: 参数的 Zod schema
 * - execute: 执行函数
 */
export interface Tool<T extends z.ZodType = z.ZodType> {
  name: string
  description: string
  inputSchema: T
  execute: (input: z.infer<T>) => Promise<string>
}

/**
 * Anthropic API 所需的工具定义格式
 * 
 * 这是 Anthropic Messages API 中 tools 参数的格式
 */
export interface AnthropicTool {
  name: string
  description: string
  input_schema: {
    type: 'object'
    properties: Record<string, unknown>
    required: string[]
  }
}

/**
 * 将 Zod schema 转换为 Anthropic 工具定义
 * 
 * @param tool - 我们定义的工具
 * @returns Anthropic API 格式的工具定义
 */
export function toAnthropicTool(tool: Tool): AnthropicTool {
  // Zod schema 可以通过 _def 访问内部结构
  const schema = tool.inputSchema._def as any
  const shape = schema.shape ? schema.shape() : {}
  
  // 提取属性定义
  const properties: Record<string, unknown> = {}
  const required: string[] = []
  
  for (const [key, value] of Object.entries(shape)) {
    const zodType = value as any
    
    // 基础类型映射
    if (zodType._def.typeName === 'ZodString') {
      const prop: Record<string, unknown> = { type: 'string' }
      if (zodType.description) {
        prop.description = zodType.description
      }
      properties[key] = prop
    }
    
    // 检查是否为必需字段
    if (!zodType.isOptional()) {
      required.push(key)
    }
  }
  
  return {
    name: tool.name,
    description: tool.description,
    input_schema: {
      type: 'object',
      properties,
      required
    }
  }
}
