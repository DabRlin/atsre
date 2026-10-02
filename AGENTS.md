# AGENTS.md

## 项目概述

**ATSRE** - 一个极简的 coding agent，用于学习和理解 Agent 架构原理。

## 技术栈

- **Runtime**: Bun
- **Language**: TypeScript
- **LLM**: Anthropic Claude (直接使用 @anthropic-ai/sdk)
- **架构**: Monorepo (pnpm workspace)

## 项目结构

```
packages/
├── core/       # Agent 核心循环逻辑
├── llm/        # LLM 调用封装
├── tools/      # 工具集 (read/write/bash)
├── session/    # 会话管理和持久化
├── cli/        # 命令行入口
└── tui/        # 终端UI（待实现）
```

## 配置和数据

**配置位置**: `~/.atsre/`
- `config.env` - API 配置文件
- `sessions/` - 会话存储目录（JSONL 格式）

详见 [.atsre 目录说明](docs/atsre-directory.md)

## 核心概念

### Agent Loop
手动实现的 ReAct 循环：
1. 用户输入 → 构建消息
2. 调用 LLM（携带工具定义）
3. 判断响应类型：
   - 工具调用 → 执行工具 → 追加结果 → 回到步骤2
   - 文本回复 → 返回结果
4. 重复直到达到停止条件

### 工具系统
- `read` - 读取文件内容
- `write` - 写入文件
- `bash` - 执行shell命令

每个工具包含：
- Schema 定义（参数验证）
- Execute 函数（实际执行逻辑）
- 错误处理

## 开发阶段

### ✅ Phase 0: 项目初始化
设置 monorepo、配置 TypeScript、安装基础依赖

### ✅ Phase 1: 核心功能
- ✅ 实现 Agent 主循环（ReAct 循环）
- ✅ 实现 3 个基础工具（read/write/bash）
- ✅ 单次命令模式 CLI
- ✅ 基础测试通过

### ✅ Phase 2: 会话管理
- ✅ JSONL 格式会话存储
- ✅ REPL 交互模式
- ✅ 多轮对话支持
- ✅ 会话恢复功能
- ✅ 配置统一到 ~/.atsre/

### ✅ Phase 3: 体验优化
- ✅ 彩色输出（chalk + UI 工具包）
- ✅ 更好的错误提示（友好的错误显示）
- ✅ Token 统计优化（分离 input/output，显示成本）
- ✅ Agent 实时反馈（思考过程、工具调用状态）
- ✅ 智能去重（最终回复不重复思考内容）

## 使用方式

### 配置

首次运行前，配置 API 信息：

```bash
# 编辑配置文件
vim ~/.atsre/config.env
```

填入你的 API 配置：
```bash
ANTHROPIC_API_KEY=your_api_key
ANTHROPIC_BASE_URL=https://your-service.com  # 可选
ANTHROPIC_MODEL=claude-sonnet-5               # 可选
```

### 运行

```bash
# 交互模式（REPL）
bun run dev

# 单次命令模式
bun run dev "创建一个 hello.txt 文件"
```

详见 [快速开始](docs/getting-started.md)

## 新会话指南

**当开启新会话时，请阅读以下文件：**

1. `docs/getting-started.md` - 快速开始指南
2. `docs/task.md` - 完整的开发计划和验收标准
3. `docs/guidelines.md` - 开发规范和代码风格
4. `docs/atsre-directory.md` - 配置和数据目录说明
5. `docs/debug.md` - 调试记录
6. `packages/*/README.md` - 各个包的具体实现说明

**当前进度：**
- 位置：Phase 2 已完成 ✅
- 下一步：Phase 3 体验优化

## 设计原则

1. **手动实现优先** - 先理解原理，再考虑封装
2. **清晰胜于简洁** - 代码可读性 > 代码行数
3. **逐步演进** - 先跑通，再优化
4. **中文注释** - 所有逻辑用中文解释清楚

## 未来可能的方向

- 切换到 Vercel AI SDK（对比学习）
- 支持 OpenAI SDK（多模型支持）
- 添加 Edit 工具（节省 token）
- Context 管理（长对话压缩）
- 权限控制（危险命令确认）

---

**Version**: 0.2.0  
**Last Updated**: 2026-09-29  
**Status**: ✅ Phase 2 完成，进入 Phase 3
