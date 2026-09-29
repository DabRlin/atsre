# @atsre/llm

LLM 调用封装，支持 Anthropic API 和兼容服务。

## 核心类

### AnthropicClient

封装 Anthropic Messages API 调用。

**创建客户端：**
```typescript
import { AnthropicClient } from '@atsre/llm'

const client = new AnthropicClient({
  apiKey: 'sk-xxx',
  baseURL: 'https://custom-service.com',  // 可选
  model: 'claude-sonnet-5'                 // 可选
})
```

**从环境变量创建：**
```typescript
import { createClientFromEnv } from '@atsre/llm'

// 读取 ANTHROPIC_API_KEY、ANTHROPIC_BASE_URL、ANTHROPIC_MODEL
const client = createClientFromEnv()
```

**调用 LLM：**
```typescript
const response = await client.call({
  messages: [
    { role: 'user', content: '你好' }
  ],
  tools: toolDefinitions,
  maxTokens: 4096,
  temperature: 1.0
})

console.log(response.content)
console.log(response.stop_reason)  // 'end_turn' | 'tool_use' | ...
console.log(response.usage)        // token 使用统计
```

## 类型定义

### Message
```typescript
interface Message {
  role: 'user' | 'assistant'
  content: string | ContentBlock[]
}
```

### ContentBlock
```typescript
type ContentBlock = 
  | { type: 'text', text: string }
  | { type: 'tool_use', id: string, name: string, input: Record<string, unknown> }
  | { type: 'tool_result', tool_use_id: string, content: string, is_error?: boolean }
```

### LLMResponse
```typescript
interface LLMResponse {
  id: string
  content: ContentBlock[]
  stop_reason: 'end_turn' | 'tool_use' | 'max_tokens' | ...
  usage: {
    input_tokens: number
    output_tokens: number
  }
}
```

## 错误处理

自动处理常见 API 错误：
- 401 - API Key 无效
- 429 - 调用频率超限
- 500 - 服务器错误
