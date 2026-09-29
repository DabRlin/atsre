# @atsre/core

Agent 核心逻辑，实现 ReAct 循环。

## 核心类

### Agent

实现 Agent 主循环，协调 LLM 调用和工具执行。

**创建 Agent：**
```typescript
import { Agent } from '@atsre/core'
import { createClientFromEnv } from '@atsre/llm'
import { allTools } from '@atsre/tools'

const llm = createClientFromEnv()
const agent = new Agent(llm, allTools, {
  maxSteps: 10,         // 最大循环步数
  temperature: 1.0,     // LLM 温度
  maxTokens: 4096       // 最大生成 tokens
})
```

**运行 Agent：**
```typescript
// 单次任务
const result = await agent.run('创建一个 hello.txt 文件')

// 多轮对话（带历史）
const result = await agent.run('读取 hello.txt', historyMessages)

console.log(result.finalText)      // 最终回复
console.log(result.messages)       // 完整消息历史
console.log(result.steps)          // 执行步数
console.log(result.usage)          // token 统计
```

## ReAct 循环

Agent 实现标准的 ReAct (Reasoning + Acting) 循环：

1. 调用 LLM，传入消息历史和工具定义
2. 检查 LLM 响应：
   - 如果是 `tool_use` → 执行工具 → 追加结果 → 回到步骤 1
   - 如果是 `end_turn` → 提取文本 → 返回结果
3. 重复直到达到 `maxSteps` 或收到最终回复

## 类型定义

### AgentConfig
```typescript
interface AgentConfig {
  maxSteps?: number      // 最大循环步数（默认 10）
  temperature?: number   // LLM 温度（默认 1.0）
  maxTokens?: number     // 最大生成 tokens（默认 4096）
}
```

### AgentResult
```typescript
interface AgentResult {
  messages: Message[]    // 完整消息历史
  finalText: string      // 最终文本回复
  steps: number          // 实际执行步数
  usage: {
    totalInputTokens: number
    totalOutputTokens: number
  }
}
```

## 工具执行

Agent 自动处理：
- 工具参数验证（使用 Zod schema）
- 工具执行和错误捕获
- 工具结果格式化
- 工具不存在的错误处理
