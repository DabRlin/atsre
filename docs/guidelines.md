# 开发指南

## 代码风格

### 注释规范

**函数注释 - 使用中文 JSDoc：**
```typescript
/**
 * 执行 Agent 主循环
 * 
 * @param userMessage - 用户输入的消息
 * @param history - 历史对话记录
 * @returns Agent 的响应结果
 */
async function runAgent(userMessage: string, history: Message[]) {
  // 实现...
}
```

**行内注释 - 解释关键逻辑：**
```typescript
// 1. 构建完整的消息上下文
const messages = [...history, { role: 'user', content: userMessage }]

// 2. 调用 LLM，最多执行 10 步防止死循环
const response = await callLLM(messages, { maxSteps: 10 })
```

### TypeScript 规范

**类型定义在文件顶部：**
```typescript
// types.ts
export interface Message {
  role: 'user' | 'assistant'
  content: string | ContentBlock[]
}

export interface ToolCall {
  id: string
  name: string
  input: Record<string, unknown>
}
```

**使用明确的类型，避免 any：**
```typescript
// ❌ 不好
function executeTool(name: string, input: any) { }

// ✅ 好
function executeTool(name: string, input: Record<string, unknown>) { }
```

### 错误处理

**区分错误类型，给出友好提示：**
```typescript
try {
  return await readFile(path, 'utf-8')
} catch (error: any) {
  if (error.code === 'ENOENT') {
    throw new Error(`文件不存在: ${path}`)
  } else if (error.code === 'EACCES') {
    throw new Error(`无权限读取: ${path}`)
  }
  throw new Error(`读取失败: ${error.message}`)
}
```

## 文件组织

### 包结构
每个 package 应包含：
```
package-name/
├── src/
│   ├── index.ts      # 导出接口
│   ├── types.ts      # 类型定义
│   └── *.ts          # 具体实现
├── package.json
├── tsconfig.json
└── README.md         # 包的说明文档
```

### 单一职责
- 一个文件一个核心功能
- 复杂逻辑拆分成小函数
- 每个函数不超过 50 行

### 导出规范
```typescript
// index.ts - 统一导出
export { runAgent } from './agent'
export { createTools } from './tools'
export type { Message, ToolCall } from './types'
```

## Git 提交规范

**提交信息格式：**
```
<type>(<scope>): <subject>

<body>
```

**Type 类型：**
- `feat` - 新功能
- `fix` - 修复bug
- `refactor` - 重构
- `docs` - 文档更新
- `test` - 测试相关
- `chore` - 构建/工具相关

**示例：**
```
feat(core): 实现基础 Agent 循环

- 添加消息构建逻辑
- 实现工具调用循环
- 添加最大步数限制
```

## 测试策略

### 手动测试优先
在早期阶段，使用手动测试验证功能：

```bash
# 测试文件读写
bun run cli "创建 test.txt，内容是 Hello"
bun run cli "读取 test.txt"

# 测试命令执行
bun run cli "列出当前目录文件"

# 测试多步任务
bun run cli "创建 add.js 实现加法函数，然后测试它"
```

### 单元测试（后期）
使用 Bun 内置测试：
```typescript
import { test, expect } from 'bun:test'

test('读取文件工具', async () => {
  const result = await readTool.execute({ path: 'test.txt' })
  expect(result).toContain('Hello')
})
```

## 开发流程

### 新功能开发
1. **理解需求** - 明确要实现什么
2. **设计接口** - 先定义类型和函数签名
3. **实现逻辑** - 写具体代码，加注释
4. **手动测试** - 运行实际场景验证
5. **提交代码** - 写清楚的 commit message

### 调试技巧
```typescript
// 使用 console.log 追踪关键信息
console.log('[Agent] 收到消息:', message)
console.log('[Tool] 执行工具:', toolName, toolInput)
console.log('[LLM] Token使用:', usage)

// 保存中间状态到文件方便检查
await writeFile('.debug/messages.json', JSON.stringify(messages, null, 2))
```

## Monorepo 管理

### 包依赖
```json
// packages/cli/package.json
{
  "dependencies": {
    "@atsre/core": "workspace:*",
    "@atsre/tools": "workspace:*"
  }
}
```

### 运行命令
```bash
# 在特定包中运行命令
bun --filter @atsre/cli run dev

# 在所有包中运行
bun run --recursive build

# 安装依赖
bun install
```

## 性能考虑

### 早期阶段
- **不要过早优化**
- 先保证正确性和可读性
- 记录性能问题，后续统一优化

### 后期优化方向
- 并行工具执行
- 消息历史压缩
- Token 缓存利用
- 流式输出

## 学习路径

### 理解顺序
1. **消息格式** - Anthropic Messages API 的结构
2. **工具调用** - 工具定义、调用、结果的完整流程
3. **Agent 循环** - 为什么需要循环，何时停止
4. **上下文管理** - 消息如何累积，如何控制长度

### 对比学习
在理解原理后，可以对比：
- 手动实现 vs Vercel AI SDK
- Anthropic SDK vs OpenAI SDK
- 代码量、性能、可维护性的差异

---

**记住：代码是写给人看的，清晰 > 简洁 > 性能**
