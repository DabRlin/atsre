# 调试记录

## Issue 1: REPL 进程立即退出

**日期**: 2026-09-29

### 问题
REPL 初始化成功，显示提示符后立即退出，无法接收用户输入。

```bash
$ bun run --filter @atsre/cli dev
> 
└─ Done in 74 ms
```

### 尝试方案
1. **Bun.stdin.stream()** - 导致无限循环
2. **prompt()** - 立即返回 null
3. **readline + Promise 阻塞** - 仍然退出

### 根本原因
`bun run --filter` 在 workspace 模式下，即使有未完成的异步操作（readline 回调、Promise、setInterval），进程仍会在主函数执行完后退出。

### 解决方案
不使用 workspace filter，直接运行脚本：

```json
// package.json
{
  "scripts": {
    "dev": "cd packages/cli && bun run src/index.ts"
  }
}
```

### 经验
- Bun workspace filter 不适合长期运行的交互式程序
- 对于 REPL 类应用，应直接运行脚本
- 遇到异步生命周期问题时，尝试不同的启动方式

---
