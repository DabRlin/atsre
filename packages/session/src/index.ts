/**
 * @atsre/session
 * 
 * 会话管理和持久化
 */

export { SessionStorage } from './storage'
export type { 
  SessionData, 
  SessionMetadata, 
  SessionStorageConfig,
  SessionIdGenerator,
  SessionAutoNamer
} from './types'

// 导出 ID 生成器
export {
  SimpleIdGenerator,
  ShortIdGenerator,
  ReadableIdGenerator,
  defaultIdGenerator
} from './id-generator'

// 导出自动命名器
export {
  SimpleAutoNamer,
  LLMAutoNamer,
  defaultAutoNamer
} from './auto-namer'
