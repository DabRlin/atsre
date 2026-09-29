# @atsre/cli

命令行入口，支持 REPL 交互模式和单次命令模式。

## 使用方式

### 交互模式（REPL）

不带参数运行，启动交互式多轮对话：

```bash
bun run dev
```

特性：
- 多轮对话，Agent 记住上下文
- 会话自动保存到 `~/.atsre/sessions/default.jsonl`
- 重启后自动恢复历史会话
- 输入 `exit` 或 `quit` 退出

### 单次命令模式

带参数运行，执行单个任务：

```bash
bun run dev "创建一个 hello.txt 文件"
bun run dev "列出当前目录的所有文件"
bun run dev "读取 package.json"
```

特性：
- 快速执行单个任务
- 显示执行结果和统计信息
- 不保存到会话历史

## 配置

CLI 从 `~/.atsre/config.env` 读取配置：

```bash
ANTHROPIC_API_KEY=sk-xxx
ANTHROPIC_BASE_URL=https://your-service.com  # 可选
ANTHROPIC_MODEL=claude-sonnet-5               # 可选
```

首次运行时会自动创建配置模板。

详见 [.atsre 目录说明](../../docs/atsre-directory.md)

## 实现文件

- `src/index.ts` - CLI 入口，处理参数和模式选择
- `src/repl.ts` - REPL 交互模式实现

## 开发

```bash
# 类型检查
bun run type-check

# 运行
bun run src/index.ts

# 单次命令
bun run src/index.ts "your task"
```

## 注意事项

**运行方式：**
- 直接运行：`cd packages/cli && bun run src/index.ts`
- 从 root 运行：`bun run dev`（package.json 已配置）

**不要使用** `bun run --filter`，会导致 REPL 无法正常工作。

详见 [调试记录](../../docs/debug.md#issue-1-repl-进程立即退出)
