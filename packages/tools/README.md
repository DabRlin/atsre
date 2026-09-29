# @atsre/tools

Agent 工具集合，包含文件操作和命令执行工具。

## 工具列表

### read - 读取文件
读取指定路径的文件内容。

**参数：**
- `path: string` - 文件路径

**示例：**
```typescript
import { readTool } from '@atsre/tools'

const content = await readTool.execute({ path: 'test.txt' })
```

### write - 写入文件
写入内容到文件，自动创建目录。

**参数：**
- `path: string` - 文件路径
- `content: string` - 文件内容

**示例：**
```typescript
import { writeTool } from '@atsre/tools'

await writeTool.execute({ 
  path: 'test.txt', 
  content: 'Hello World' 
})
```

### bash - 执行命令
在 shell 中执行命令。

**参数：**
- `command: string` - shell 命令

**示例：**
```typescript
import { bashTool } from '@atsre/tools'

const output = await bashTool.execute({ command: 'ls -la' })
```

## 工具定义

每个工具包含：
- `name: string` - 工具名称
- `description: string` - 工具描述（给 LLM 看）
- `inputSchema: ZodSchema` - 参数验证 schema
- `execute: (input) => Promise<string>` - 执行函数

## 转换为 Anthropic 格式

```typescript
import { toAnthropicTool, readTool } from '@atsre/tools'

const anthropicFormat = toAnthropicTool(readTool)
// 返回 Anthropic Messages API 所需的工具定义格式
```

## 错误处理

所有工具都会捕获并转换错误为友好的错误消息：
- 文件不存在 (ENOENT)
- 权限错误 (EACCES)
- 目录错误 (EISDIR)
- 命令执行失败（退出码、超时）
