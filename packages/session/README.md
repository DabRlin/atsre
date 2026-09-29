# @atsre/session

会话管理和持久化，使用 JSONL 格式存储。

## 核心类

### SessionStorage

管理会话的创建、加载、保存。

**创建存储实例：**
```typescript
import { SessionStorage } from '@atsre/session'

// 默认存储在 ~/.atsre/sessions/
const storage = new SessionStorage()

// 自定义存储目录
const storage = new SessionStorage({
  sessionDir: '/custom/path/sessions'
})
```

**创建会话：**
```typescript
const metadata = await storage.createSession('my-session')
// 创建 ~/.atsre/sessions/my-session.jsonl
```

**加载会话：**
```typescript
const data = await storage.loadSession('my-session')

if (data) {
  console.log(data.metadata)  // 会话元数据
  console.log(data.messages)  // 消息历史
}
```

**追加消息：**
```typescript
await storage.appendMessage('my-session', {
  role: 'user',
  content: 'Hello'
})
```

**列出所有会话：**
```typescript
const sessions = await storage.listSessions()
// 按更新时间倒序排序
```

**检查会话是否存在：**
```typescript
const exists = storage.exists('my-session')
```

## JSONL 格式

每个会话文件的结构：

```jsonl
{"metadata":{"id":"default","createdAt":1234567890,"updatedAt":1234567890,"messageCount":4}}
{"message":{"role":"user","content":"创建一个 test.txt"}}
{"message":{"role":"assistant","content":[...]}}
{"message":{"role":"user","content":[{"type":"tool_result",...}]}}
{"message":{"role":"assistant","content":[{"text":"已创建",...}]}}
```

- 第一行：会话元数据（JSON 对象）
- 后续行：每条消息一行（JSON 对象）

## 类型定义

### SessionMetadata
```typescript
interface SessionMetadata {
  id: string              // 会话 ID
  createdAt: number       // 创建时间戳
  updatedAt: number       // 最后更新时间戳
  messageCount: number    // 消息数量
}
```

### SessionData
```typescript
interface SessionData {
  metadata: SessionMetadata
  messages: Message[]
}
```

## 存储位置

默认存储在 `~/.atsre/sessions/` 目录：
- macOS/Linux: `~/.atsre/sessions/`
- Windows: `%USERPROFILE%\.atsre\sessions\`

详见 [.atsre 目录说明](../../docs/atsre-directory.md)
