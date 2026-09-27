# 极简 Agent 开发计划

## 🎯 目标

做一个**够用、轻量、能看懂**的 coding agent，核心功能：
- 自动读写文件
- 执行命令
- 多轮对话
- 会话持久化

**不做**：复杂 TUI、沙箱、分支管理（等真正需要再说）

---

## 📅 3天冲刺计划

### Day 1: 跑起来（核心功能）

**目标**：一个能执行任务的基本 agent

#### 任务清单
- [ ] 项目初始化
  - [ ] 创建项目目录 `my-agent/`
  - [ ] `npm init -y`
  - [ ] 安装依赖：`ai @ai-sdk/anthropic zod dotenv`
  - [ ] 创建 `.env` 文件，配置 `ANTHROPIC_API_KEY`

- [ ] 实现核心 Agent Loop (`src/agent.ts`)
  - [ ] 引入 Vercel AI SDK
  - [ ] 定义 3 个工具：read / write / bash
  - [ ] 实现基本的 ReAct 循环
  - [ ] 测试：`node src/agent.ts "创建一个 hello.txt 文件"`

- [ ] 测试用例
  - [ ] 测试读文件：`读取 package.json`
  - [ ] 测试写文件：`创建 test.txt，内容是 Hello World`
  - [ ] 测试命令：`运行 ls -la`
  - [ ] 测试多步：`创建 add.js 文件实现加法，然后运行测试`

**预期成果**：
```bash
$ node src/agent.ts "帮我创建 hello.txt"
🤖 好的，我来创建文件
🔧 write({ path: 'hello.txt', content: 'Hello!' })
✅ 文件已创建
💰 本次消耗: $0.002
```

---

### Day 2: 能用（交互和持久化）

**目标**：能进行多轮对话，保存历史记录

#### 任务清单
- [ ] 添加 CLI 交互 (`src/cli.ts`)
  - [ ] 安装 `inquirer`
  - [ ] 实现 REPL 循环（输入 → agent → 输出）
  - [ ] 支持退出命令（`exit` / `quit` / Ctrl+C）

- [ ] 实现会话管理 (`src/session.ts`)
  - [ ] JSONL 格式存储（`~/.myagent/sessions/default.jsonl`）
  - [ ] `append(message)` - 追加消息
  - [ ] `load()` - 加载历史
  - [ ] `list()` - 列出所有会话

- [ ] 集成会话到 Agent
  - [ ] 启动时加载历史消息
  - [ ] 每次对话后保存
  - [ ] 支持 `--continue` 参数继续上次会话

- [ ] 流式输出优化
  - [ ] 显示 thinking（如果模型支持）
  - [ ] 显示工具执行进度
  - [ ] 最终结果高亮

**预期成果**：
```bash
$ node src/cli.ts
💬 My Agent v0.1
📂 会话: default (5 条历史消息)

> 帮我创建一个 todo.txt
🤖 [思考中...]
🔧 write({ path: 'todo.txt', content: '...' })
✅ 已创建 todo.txt

> 读取看看
🔧 read({ path: 'todo.txt' })
📄 内容是：...

> exit
👋 再见！会话已保存
```

---

### Day 3: 能看（体验优化）

**目标**：更好的视觉反馈和错误处理

#### 任务清单
- [ ] 美化输出
  - [ ] 安装 `chalk` 用于彩色输出
  - [ ] 不同事件用不同颜色
    - 用户输入：cyan
    - Agent 思考：gray
    - 工具执行：yellow
    - 成功：green
    - 错误：red
  - [ ] 添加 emoji 图标

- [ ] 错误处理
  - [ ] 捕获文件不存在错误（read）
  - [ ] 捕获权限错误（write）
  - [ ] 捕获命令执行失败（bash）
  - [ ] LLM API 错误处理（rate limit / network）
  - [ ] 显示友好的错误提示

- [ ] 统计信息
  - [ ] 追踪 token 使用（input / output / cached）
  - [ ] 计算成本（基于模型定价）
  - [ ] 在会话结束时显示统计

- [ ] 配置文件 (`config.json`)
  - [ ] 默认模型
  - [ ] 最大步数
  - [ ] 温度参数
  - [ ] 会话目录

**预期成果**：
```bash
$ node src/cli.ts

╭─────────────────────────────╮
│  🤖 My Agent v0.1          │
│  Model: claude-sonnet-4     │
│  Session: default           │
╰─────────────────────────────╯

> 帮我实现一个斐波那契函数

💭 正在思考...
🔧 write → fib.ts
✅ 文件已创建
🔧 bash → npm test fib.test.ts
⚠️  测试失败：ReferenceError...
🔧 edit → fib.ts (修复错误)
✅ 修改完成
🔧 bash → npm test fib.test.ts
✅ 测试通过！

📊 本次统计
   输入: 1,234 tokens
   输出: 567 tokens
   缓存: 890 tokens
   成本: $0.0045
```

---

## 📁 项目结构

```
my-agent/
├── src/
│   ├── agent.ts           # 核心 Agent 逻辑
│   ├── cli.ts             # 命令行交互
│   ├── session.ts         # 会话管理
│   ├── tools/             # 工具定义
│   │   ├── read.ts
│   │   ├── write.ts
│   │   ├── bash.ts
│   │   └── index.ts
│   ├── utils.ts           # 工具函数（颜色、格式化等）
│   └── config.ts          # 配置管理
├── .env                   # API keys
├── config.json            # 用户配置
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🔧 技术栈

### 核心依赖
```json
{
  "dependencies": {
    "ai": "^3.x",              // Vercel AI SDK
    "@ai-sdk/anthropic": "^0.x", // Anthropic provider
    "zod": "^3.x",              // Schema 验证
    "dotenv": "^16.x",          // 环境变量
    "inquirer": "^9.x",         // CLI 交互
    "chalk": "^5.x"             // 彩色输出
  },
  "devDependencies": {
    "typescript": "^5.x",
    "tsx": "^4.x",              // TypeScript 运行器
    "@types/node": "^20.x",
    "@types/inquirer": "^9.x"
  }
}
```

### 为什么选这些？
- **Vercel AI SDK**：最简单的 LLM 调用，自带工具调用
- **Zod**：定义工具 schema，类型安全
- **Inquirer**：成熟的 CLI 交互库
- **Chalk**：彩色输出，体验好

---

## 📝 代码风格指南

### 注释要求
```typescript
// ❌ 不好的注释
// This function does something
function foo() { }

// ✅ 好的注释（中文！）
/**
 * 执行 Agent 的主循环
 * 
 * @param prompt - 用户输入的任务描述
 * @param history - 历史对话记录
 * @returns 包含所有消息和统计信息的结果
 */
async function runAgent(prompt: string, history: Message[]) {
  // 1. 准备消息上下文
  const messages = [...history, { role: 'user', content: prompt }]
  
  // 2. 调用 LLM（最多 10 步，防止死循环）
  const result = await generateText({ 
    model,
    messages,
    tools,
    maxSteps: 10 
  })
  
  // 3. 返回结果
  return result
}
```

### 文件组织原则
1. **一个文件一个职责**（agent.ts 只管循环，tools/ 只管工具）
2. **类型定义放在文件顶部**
3. **复杂逻辑拆成小函数**
4. **每个函数上面写清楚用途**

### 错误处理
```typescript
// ✅ 好的错误处理
try {
  const content = await readFile(path, 'utf-8')
  return content
} catch (error) {
  // 区分错误类型，给友好提示
  if (error.code === 'ENOENT') {
    throw new Error(`文件不存在: ${path}`)
  } else if (error.code === 'EACCES') {
    throw new Error(`没有权限读取文件: ${path}`)
  } else {
    throw new Error(`读取文件失败: ${error.message}`)
  }
}
```

---

## 🧪 测试方法

### 手动测试用例

**基础功能**
```bash
# 1. 文件操作
> 创建一个 hello.txt 文件，内容是 "Hello World"
> 读取 hello.txt 的内容
> 在 hello.txt 末尾追加一行 "Goodbye"

# 2. 命令执行
> 列出当前目录的所有文件
> 创建一个新目录 test-dir
> 删除 test-dir 目录

# 3. 多步任务
> 帮我创建一个简单的 add.js 文件，实现两数相加的函数
> 创建一个测试文件 add.test.js
> 运行测试

# 4. 上下文理解
> 创建 config.json，包含 name 和 version
> 修改 config.json，添加一个 author 字段
> 读取 config.json 确认修改
```

**边界情况**
```bash
# 1. 文件不存在
> 读取 not-exist.txt

# 2. 权限错误
> 写入 /etc/hosts

# 3. 命令失败
> 运行 npm test（项目里没有 test 脚本）

# 4. 空输入
> [直接回车]

# 5. 超长任务
> 帮我实现一个完整的 Todo 应用，包括前端和后端
（测试 maxSteps 限制）
```

---

## 🚀 启动命令

```bash
# 开发模式（自动重启）
npm run dev

# 生产模式
npm start

# 继续上次会话
npm start -- --continue

# 使用特定会话
npm start -- --session my-project

# 一次性任务（不保存会话）
npm start -- --one-shot "创建 hello.txt"
```

---

## 📈 后续优化方向（有需求再做）

### Week 2-3: 增强功能
- [ ] **Edit 工具**：精确文本替换（节省 token）
- [ ] **并行执行**：多个工具同时跑
- [ ] **配置系统**：项目级 + 用户级配置
- [ ] **命令历史**：上下箭头翻历史

### Week 4+: 高级特性
- [ ] **Context 管理**：自动压缩旧消息
- [ ] **权限控制**：危险命令提示确认
- [ ] **工具验证**：执行后自动检查（如编译、测试）
- [ ] **多会话**：项目独立会话

### 未来（如果有用户）
- [ ] **沙箱隔离**：Docker 容器
- [ ] **Plan Mode**：复杂任务分步执行
- [ ] **Web UI**：浏览器访问
- [ ] **插件系统**：自定义工具

---

## 🐛 已知问题（暂时接受）

1. **没有 Edit 工具**：修改文件要重写整个文件（token 消耗大）
   - 影响：大文件修改成本高
   - 缓解：先用小文件测试，未来再优化

2. **没有 Context 管理**：对话太长会超出上下文窗口
   - 影响：长会话会崩溃
   - 缓解：手动开新会话，或设置 maxSteps 限制

3. **没有权限控制**：agent 可以执行任何命令
   - 影响：误删文件、执行危险命令
   - 缓解：只在测试目录运行，定期备份

4. **没有沙箱**：命令直接在本地执行
   - 影响：安全风险
   - 缓解：别在生产环境用，别让 agent 访问敏感文件

5. **CLI 体验一般**：没有光标定位、滚动等高级功能
   - 影响：长输出不好查看
   - 缓解：可以 pipe 到 less 查看

---

## 💡 Vibe Coding 小技巧

### 写代码前先问自己
1. **这个功能真的必需吗？**（80% 的功能可能用不上）
2. **有没有现成的库？**（别重造轮子）
3. **最简单的实现是什么？**（能用 50 行就别用 500 行）

### 遇到问题时
1. **先 Google / 查文档**（Vercel AI SDK 文档很全）
2. **看 Pi 源码怎么做的**（但别全抄，理解思路就行）
3. **问 AI**（Claude / GPT 帮你写小函数）

### 保持简单
- 一次只做一件事
- 功能跑通了再优化
- 注释写清楚，未来的自己会感谢现在的你

---

## ✅ 验收标准

### Day 1 结束时
- [ ] 能执行 "创建 hello.txt" 这样的简单任务
- [ ] 三个工具（read/write/bash）都能正常工作
- [ ] 能看到工具执行过程

### Day 2 结束时
- [ ] 能进行多轮对话
- [ ] 对话历史会保存
- [ ] 重启后能继续上次对话

### Day 3 结束时
- [ ] 输出有颜色、有图标，看着舒服
- [ ] 错误提示友好（不是一堆 stack trace）
- [ ] 能看到 token 和成本统计

---

## 🎉 最后的话

记住：
1. **Done is better than perfect**
2. **先做出来，再做完美**
3. **代码是写给人看的，顺便给机器执行**

加油！三天后你就有自己的 agent 了！🚀

---

## 📚 参考资料

- [Vercel AI SDK 文档](https://sdk.vercel.ai/docs)
- [Anthropic API 文档](https://docs.anthropic.com/)
- [Pi 源码](https://github.com/earendil-works/pi)（参考 agent-loop.ts 和 tools/）
- [Inquirer 文档](https://github.com/SBoudrias/Inquirer.js)

---

**Version**: 0.1  
**Updated**: 2026-09-23  
**Status**: 🚀 Ready to start!
