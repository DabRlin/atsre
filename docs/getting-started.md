# 快速开始指南

## 安装和配置

### 前置要求

- **Bun** >= 1.4.0
- **Anthropic API Key**（或兼容的第三方服务）

### 1. 克隆项目

```bash
git clone <repository-url>
cd atsre
```

### 2. 安装依赖

```bash
bun install
```

### 3. 配置 API

首次运行会自动创建配置模板：

```bash
bun run dev
```

会提示配置文件位置：`~/.atsre/config.env`

编辑配置文件：

```bash
vim ~/.atsre/config.env
```

填入你的 API 配置：

```bash
# Anthropic API 配置
ANTHROPIC_API_KEY=sk-your-api-key

# 如果使用第三方服务，添加 BASE_URL
ANTHROPIC_BASE_URL=https://your-service.com

# 指定模型（可选）
ANTHROPIC_MODEL=claude-sonnet-5
```

## 使用方式

### 交互模式（REPL）

启动交互模式，进行多轮对话：

```bash
bun run dev
```

**示例会话：**
```
> 创建一个 hello.txt 文件，内容是 Hello World
Agent: 已创建 hello.txt 文件...

> 读取 hello.txt 的内容
Agent: 文件内容是：Hello World

> exit
再见！会话已保存
```

**特性：**
- 多轮对话，Agent 记住上下文
- 会话自动保存到 `~/.atsre/sessions/default.jsonl`
- 重启后自动恢复历史会话

### 单次命令模式

执行单个任务，不保存会话：

```bash
bun run dev "创建一个 test.txt 文件"
bun run dev "列出当前目录的所有文件"
bun run dev "读取 package.json 文件"
```

**特性：**
- 快速执行单个任务
- 显示执行结果和统计信息
- 不保存到会话历史

## 工具能力

Agent 支持以下工具：

### read - 读取文件

```
> 读取 package.json
```

### write - 写入文件

```
> 创建一个 math.js，实现加法函数
```

### bash - 执行命令

```
> 列出当前目录的所有文件
> 运行 npm test
```

## 会话管理

### 查看会话历史

会话保存在 `~/.atsre/sessions/` 目录：

```bash
ls -la ~/.atsre/sessions/
```

### 查看会话内容

```bash
cat ~/.atsre/sessions/default.jsonl
```

### 删除会话

```bash
rm ~/.atsre/sessions/default.jsonl
```

下次启动会创建新会话。

## 常见问题

### Q: 配置文件在哪里？

A: `~/.atsre/config.env`

### Q: 会话历史保存在哪里？

A: `~/.atsre/sessions/` 目录，每个会话一个 `.jsonl` 文件

### Q: 如何清除历史会话？

A: 删除对应的 `.jsonl` 文件：
```bash
rm ~/.atsre/sessions/default.jsonl
```

### Q: 如何切换不同的 API 服务？

A: 编辑 `~/.atsre/config.env`，修改 `ANTHROPIC_BASE_URL` 和 `ANTHROPIC_MODEL`

### Q: 支持哪些模型？

A: 支持所有 Anthropic Claude 模型和兼容的第三方模型：
- claude-3-5-sonnet-20241022
- claude-3-opus-20240229
- claude-3-sonnet-20240229
- 或你的第三方服务支持的模型

### Q: REPL 无法启动怎么办？

A: 检查：
1. 配置文件是否正确：`cat ~/.atsre/config.env`
2. API Key 是否有效
3. 网络连接是否正常
4. 查看 [调试记录](debug.md)

### Q: 文件操作在哪个目录执行？

A: 在你运行 `bun run dev` 的当前工作目录。

## 下一步

- 阅读 [AGENTS.md](../AGENTS.md) 了解项目架构
- 查看 [开发指南](guidelines.md) 了解代码规范
- 查看 [.atsre 目录说明](atsre-directory.md) 了解数据存储
- 查看 [调试记录](debug.md) 了解已知问题

---

**遇到问题？** 查看 [调试记录](debug.md) 或提交 Issue
