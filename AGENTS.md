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
├── session/    # 会话管理和持久化（待实现）
├── cli/        # 命令行入口
└── tui/        # 终端UI（待实现）
```

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

### 🚧 Phase 1: 核心功能 (Day 1-2)
- [ ] 实现 Agent 主循环
- [ ] 实现 3 个基础工具
- [ ] 简单的 CLI 入口
- [ ] 基础测试

### 📋 Phase 2: 会话管理 (Day 3-4)
- [ ] JSONL 格式会话存储
- [ ] 多轮对话支持
- [ ] 会话恢复

### 🎨 Phase 3: 体验优化 (Day 5+)
- [ ] 彩色输出
- [ ] Token 统计
- [ ] 流式输出
- [ ] 错误处理优化

## 新会话指南

**当开启新会话时，请阅读以下文件：**

1. `docs/task.md` - 完整的开发计划和验收标准
2. `docs/guidelines.md` - 开发规范和代码风格
3. `packages/*/README.md` - 各个包的具体实现说明

**当前进度：**
- 位置：Phase 0 → Phase 1 过渡
- 下一步：初始化 monorepo 结构，实现核心 Agent 循环

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

**Version**: 0.1.0  
**Last Updated**: 2026-09-27  
**Status**: 🚀 开始 Phase 1
