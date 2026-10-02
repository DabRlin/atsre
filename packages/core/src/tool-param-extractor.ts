/**
 * 工具参数提取器
 * 
 * 用于从工具调用参数中提取关键信息（如文件名），用于状态显示
 */

/**
 * 提取工具调用的显示信息
 * 
 * @param toolName - 工具名称
 * @param args - 工具参数
 * @returns 用于显示的描述字符串
 */
export function extractToolDisplay(toolName: string, args: any): string {
  switch (toolName) {
    case 'read':
      return args.path ? `read: ${args.path}` : 'read'
    
    case 'write':
      return args.path ? `write: ${args.path}` : 'write'
    
    case 'bash':
      return args.command ? `bash: ${args.command}` : 'bash'
    
    default:
      return toolName
  }
}
