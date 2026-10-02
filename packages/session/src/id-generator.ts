/**
 * 会话 ID 生成器
 * 
 * 提供可插拔的 ID 生成策略
 */

import type { SessionIdGenerator } from './types'

/**
 * 简单的时间戳 ID 生成器
 * 
 * 生成格式：sess_<timestamp>
 * 例如：sess_1790742832585
 */
export class SimpleIdGenerator implements SessionIdGenerator {
  generate(): string {
    return `sess_${Date.now()}`
  }
}

/**
 * 短 ID 生成器（基于时间戳 + 随机数）
 * 
 * 生成格式：sess_<timestamp_last6>_<random3>
 * 例如：sess_832585_a4f
 * 
 * 更短，但仍保持唯一性
 */
export class ShortIdGenerator implements SessionIdGenerator {
  generate(): string {
    const timestamp = Date.now().toString().slice(-6)
    const random = Math.random().toString(36).substring(2, 5)
    return `sess_${timestamp}_${random}`
  }
}

/**
 * 可读的日期时间 ID 生成器
 * 
 * 生成格式：<YYYYMMDD>-<HHMM>
 * 例如：20260930-1445
 */
export class ReadableIdGenerator implements SessionIdGenerator {
  generate(): string {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const hour = String(now.getHours()).padStart(2, '0')
    const minute = String(now.getMinutes()).padStart(2, '0')
    
    return `${year}${month}${day}-${hour}${minute}`
  }
}

/**
 * 默认使用短 ID 生成器（更友好）
 */
export const defaultIdGenerator = new ShortIdGenerator()
