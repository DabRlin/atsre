# ATSRE

> **A**gent **T**oolkit for **S**implified **R**eAct **E**xecution

一个极简的 coding agent，专注于学习和理解 Agent 架构原理。通过手动实现 ReAct 循环和工具系统，深入掌握 AI Agent 的核心机制。

## ✨ 特性

- 🔄 **手动实现的 ReAct 循环** - 不依赖框架，直接理解 Agent 工作原理
- 🛠️ **完整的工具系统** - 文件操作、代码搜索、命令执行
- 💬 **多轮对话支持** - REPL 交互模式 + 会话管理
- 🎨 **友好的用户体验** - 彩色输出、实时反馈、成本统计
- 📦 **模块化架构** - Monorepo 结构，清晰的职责分离

## 🚀 快速开始

### 前置要求

- [Bun](https://bun.sh/) >= 1.0
- Anthropic API Key（或兼容的第三方服务）

### 安装

```bash
# 克隆仓库
git clone https://github.com/DabRlin/atsre.git
cd atsre

# 安装依赖
bun install

# 配置 API
mkdir -p ~/.atsre
cat > ~/.atsre/config.env << EOF
ANTHROPIC_API_KEY=your_api_key_here
# 可选：使用第三方兼容服务
# ANTHROPIC_BASE_URL=https://your-service.com
# ANTHROPIC_MODEL=claude-sonnet-5
EOF

# 运行
bun run dev
```

### 使用

#### 交互模式（推荐）

```bash
bun run dev
```

进入 REPL 后，你可以：

```
> 创建一个 hello.txt 文件，内容是 "Hello, ATSRE!"

⚡ Agent 正在思考...

ℹ 好的，我来创建这个文件。
🔧 write: hello.txt
✓ write: hello.txt

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💬 Agent:
文件已创建成功！

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 步数: 1 | 输入: 234 tokens | 输出: 89 tokens | 总计: 323 tokens | 成本: $0.0019
```

#### 单次命令模式

```bash
bun run dev "列出当前目录的所有 TypeScript 文件"
```

#### REPL 命令

- `/list` - 列出所有会话
- `/new [name]` - 创建新会话
- `/switch <id|name>` - 切换会话
- `/delete <id|name>` - 删除会话
- `/rename <new-name>` - 重命名当前会话
- `/current` - 显示当前会话信息
- `/help` - 显示帮助信息
- `/exit` - 退出

## 🛠️ 可用工具

### 文件操作

- **`read`** - 读取文件内容
  ```
  读取 src/index.ts 文件
  ```

- **`write`** - 写入文件
  ```
  创建一个 hello.py 文件
  ```

- **`edit`** - 精确编辑文件（节省 token）
  ```
  把 hello.py 中的 print("Hello") 改成 print("Hi")
  ```

### 代码搜索

- **`grep`** - 搜索文件内容
  ```
  在 src 目录中搜索所有包含 "Agent" 的 TypeScript 文件
  ```

### 命令执行

- **`bash`** - 执行 shell 命令
  ```
  运行 npm test
  ```

## 📦 项目结构

```
packages/
├── core/       # Agent 核心循环逻辑（ReAct 实现）
├── llm/        # LLM 调用封装（Anthropic SDK）
├── tools/      # 工具集（read/write/edit/grep/bash）
├── session/    # 会话管理和持久化（JSONL 格式）
└── cli/        # 命令行入口和 REPL
```

## 🎯 设计原则

1. **手动实现优先** - 先理解原理，再考虑封装
2. **清晰胜于简洁** - 代码可读性 > 代码行数
3. **逐步演进** - 先跑通，再优化
4. **中文注释** - 所有逻辑用中文解释清楚

## 🔧 开发

### 类型检查

```bash
bun run type-check
```

### 项目文档

- [快速开始](docs/getting-started.md) - 详细的使用指南
- [开发规范](docs/guidelines.md) - 代码风格和开发规范
- [配置说明](docs/atsre-directory.md) - 配置文件和数据目录
- [开发任务](docs/task.md) - 完整的开发计划
- [调试记录](docs/debug.md) - 问题排查记录

## 📝 开发路线

- ✅ **Phase 0**: 项目初始化
- ✅ **Phase 1**: 核心功能（Agent 循环、基础工具）
- ✅ **Phase 2**: 会话管理（REPL、多轮对话、持久化）
- ✅ **Phase 3**: 体验优化（彩色输出、实时反馈、成本统计）
- 🚧 **Phase 4**: 工具增强（权限控制、沙箱）
- 📋 **Future**: TUI 界面、多模型支持

## 🤝 贡献

欢迎贡献！这个项目的目标是学习和理解 Agent 架构，如果你有改进建议或发现问题，请提交 Issue 或 PR。

## 📄 许可证

本项目采用 [Apache License 2.0](LICENSE) 许可证。

## 🙏 致谢

- [Anthropic](https://www.anthropic.com/) - Claude API
- [Bun](https://bun.sh/) - 快速的 JavaScript 运行时

---

**Version**: 0.2.0  
**Status**: ✅ 生产就绪

如果这个项目对你有帮助，请给个 ⭐️ Star！
