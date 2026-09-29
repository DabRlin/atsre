# .atsre 目录说明

## 概述

`.atsre` 目录位于用户主目录下（`~/.atsre/`），用于存储 ATSRE Agent 的配置和会话数据。

## 目录结构

```
~/.atsre/
├── config.env          # API 配置文件
└── sessions/           # 会话存储目录
    ├── default.jsonl   # 默认会话
    └── *.jsonl         # 其他会话文件
```

## 文件说明

### config.env

API 配置文件，包含 Anthropic API 的认证信息和模型配置。

**示例内容：**
```bash
# Anthropic API 配置
ANTHROPIC_API_KEY=sk-xxx...

# 第三方兼容服务（可选）
ANTHROPIC_BASE_URL=https://your-service.com

# 模型选择（可选）
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022
```

**配置项：**
- `ANTHROPIC_API_KEY` - 必需，API 密钥
- `ANTHROPIC_BASE_URL` - 可选，使用第三方兼容服务时配置
- `ANTHROPIC_MODEL` - 可选，指定使用的模型，默认 `claude-sonnet-4-20250514`

**首次使用：**
- 首次运行 ATSRE 时，如果 `config.env` 不存在，会自动创建配置模板
- 需要手动编辑文件，填入你的 API 配置

### sessions/

会话存储目录，使用 JSONL 格式存储对话历史。

**会话文件格式：** `<session-id>.jsonl`

每个会话文件的结构：
- 第一行：会话元数据（JSON）
- 后续行：每条消息一行（JSON）

**示例内容：**
```jsonl
{"metadata":{"id":"default","createdAt":1234567890,"updatedAt":1234567890,"messageCount":4}}
{"message":{"role":"user","content":"创建一个 test.txt"}}
{"message":{"role":"assistant","content":[...]}}
{"message":{"role":"user","content":[{"type":"tool_result",...}]}}
{"message":{"role":"assistant","content":[{"text":"已创建文件",...}]}}
```

**元数据字段：**
- `id` - 会话 ID
- `createdAt` - 创建时间戳
- `updatedAt` - 最后更新时间戳
- `messageCount` - 消息总数

## 配置管理

### 初始化配置

首次运行时自动创建：
```bash
bun run dev
```

如果配置文件不存在，会自动创建模板并提示编辑。

### 编辑配置

```bash
# 使用任意编辑器
vim ~/.atsre/config.env
# 或
nano ~/.atsre/config.env
```

### 查看配置

```bash
cat ~/.atsre/config.env
```

## 会话管理

### 查看所有会话

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

### 备份会话

```bash
cp -r ~/.atsre/sessions/ ~/atsre-backup-$(date +%Y%m%d)/
```

## 权限和安全

### 文件权限

建议设置合适的文件权限，保护 API 密钥：

```bash
chmod 600 ~/.atsre/config.env
chmod 700 ~/.atsre/
```

### 敏感信息

- `config.env` 包含 API 密钥，不应提交到版本控制
- 会话文件可能包含敏感对话内容，注意保护

### 备份建议

定期备份 `.atsre` 目录：
```bash
# 创建备份
tar -czf atsre-backup-$(date +%Y%m%d).tar.gz ~/.atsre/

# 恢复备份
tar -xzf atsre-backup-20260929.tar.gz -C ~/
```

## 迁移说明

### 从旧版本迁移

如果你之前使用项目 root 的 `.env` 文件，需要手动迁移：

```bash
# 1. 创建目录
mkdir -p ~/.atsre

# 2. 复制配置
cp /path/to/project/.env ~/.atsre/config.env

# 3. 验证配置
cat ~/.atsre/config.env
```

### 多项目共享配置

由于配置存储在用户主目录，多个 ATSRE 项目会自动共享同一套配置。

如需独立配置，可以：
1. 使用不同的会话 ID
2. 或在项目中临时修改环境变量

## 故障排查

### 配置文件不生效

检查文件路径和内容：
```bash
ls -la ~/.atsre/config.env
cat ~/.atsre/config.env
```

### 会话无法加载

检查 JSONL 文件格式：
```bash
# 验证 JSON 格式
head -n 1 ~/.atsre/sessions/default.jsonl | python -m json.tool
```

### 权限错误

修复文件权限：
```bash
chmod -R u+rw ~/.atsre/
```

---

**相关文档：**
- [开发指南](../guidelines.md)
- [调试记录](../debug.md)
- [任务规划](../task.md)
