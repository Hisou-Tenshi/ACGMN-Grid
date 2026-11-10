/**
 * 统一日志出口：生产环境不输出（Vercel 日志无人消费）。
 * 开发环境通过 NODE_ENV !== "production" 放行。
 */
const enabled = process.env.NODE_ENV !== "production";

function noop(): void {}

export const log: (...args: unknown[]) => void = enabled
  ? (...args: unknown[]) => console.log(...args)
  : noop;

export const warn: (...args: unknown[]) => void = enabled
  ? (...args: unknown[]) => console.warn(...args)
  : noop;

export const error: (...args: unknown[]) => void = enabled
  ? (...args: unknown[]) => console.error(...args)
  : noop;
