import { env } from '../config/env.js';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  CRITICAL = 4,
}

// ANSI terminal color codes for development visibility
const COLORS = {
  reset: '\x1b[0m',
  dim: '\x1b[2m',
  bold: '\x1b[1m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  magenta: '\x1b[35m',
  bgRed: '\x1b[41m\x1b[37m',
  bgYellow: '\x1b[43m\x1b[30m',
};

const LEVEL_CONFIG = {
  [LogLevel.DEBUG]: { label: 'DEBUG', color: COLORS.dim + COLORS.cyan, badge: '🔍' },
  [LogLevel.INFO]: { label: 'INFO ', color: COLORS.green, badge: '✨' },
  [LogLevel.WARN]: { label: 'WARN ', color: COLORS.yellow, badge: '⚠️' },
  [LogLevel.ERROR]: { label: 'ERROR', color: COLORS.red + COLORS.bold, badge: '❌' },
  [LogLevel.CRITICAL]: { label: 'CRIT ', color: COLORS.bgRed + COLORS.bold, badge: '🚨' },
};

class Logger {
  private minLevel: LogLevel;

  constructor() {
    this.minLevel = env.NODE_ENV === 'production' ? LogLevel.INFO : LogLevel.DEBUG;
  }

  private formatTimestamp(): string {
    const d = new Date();
    return `${d.toLocaleTimeString('en-US', { hour12: false })}.${d.getMilliseconds().toString().padStart(3, '0')}`;
  }

  private sanitize(obj: any): any {
    if (!obj || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map((item) => this.sanitize(item));

    const sensitiveKeys = ['password', 'passwordHash', 'token', 'secret', 'jwt', 'apiKey'];
    const cleaned: Record<string, any> = {};

    for (const [key, val] of Object.entries(obj)) {
      if (sensitiveKeys.some((s) => key.toLowerCase().includes(s.toLowerCase()))) {
        cleaned[key] = '***[REDACTED]***';
      } else if (typeof val === 'object' && val !== null) {
        cleaned[key] = this.sanitize(val);
      } else {
        cleaned[key] = val;
      }
    }
    return cleaned;
  }

  private log(
    level: LogLevel,
    context: string,
    message: string,
    meta?: Record<string, any>,
    error?: Error | any
  ) {
    if (level < this.minLevel) return;

    const time = this.formatTimestamp();
    const { label, color, badge } = LEVEL_CONFIG[level];
    const contextTag = `${COLORS.blue}[${context}]${COLORS.reset}`;
    const header = `${COLORS.dim}${time}${COLORS.reset} ${badge} ${color}[${label}]${COLORS.reset} ${contextTag} ${message}`;

    console.log(header);

    // If metadata provided, print structured indented JSON
    if (meta && Object.keys(meta).length > 0) {
      const sanitizedMeta = this.sanitize(meta);
      console.log(`${COLORS.dim}  ↳ Metadata:${COLORS.reset}`, JSON.stringify(sanitizedMeta, null, 2).replace(/\n/g, '\n    '));
    }

    // If error or stack trace provided, print clear diagnosis
    if (error) {
      console.log(`${COLORS.red}  ┌─── ERROR DIAGNOSIS ───────────────────────────────────────────${COLORS.reset}`);
      console.log(`${COLORS.red}  │ Name:${COLORS.reset}    ${error.name || 'Error'}`);
      console.log(`${COLORS.red}  │ Message:${COLORS.reset} ${error.message || String(error)}`);
      if (error.code) {
        console.log(`${COLORS.red}  │ Code:${COLORS.reset}    ${error.code}`);
      }
      if (error.statusCode) {
        console.log(`${COLORS.red}  │ Status:${COLORS.reset}  ${error.statusCode}`);
      }
      if (error.details) {
        console.log(`${COLORS.red}  │ Details:${COLORS.reset} ${JSON.stringify(error.details)}`);
      }
      if (error.stack) {
        const stackLines = error.stack
          .split('\n')
          .slice(1, 5) // Show top 4 stack frames for immediate location pinpointing
          .map((line: string) => `  │ ${COLORS.dim}${line.trim()}${COLORS.reset}`)
          .join('\n');
        console.log(`${COLORS.red}  │ Stack Trace:${COLORS.reset}\n${stackLines}`);
      }
      console.log(`${COLORS.red}  └───────────────────────────────────────────────────────────────${COLORS.reset}`);
    }
  }

  debug(context: string, message: string, meta?: Record<string, any>) {
    this.log(LogLevel.DEBUG, context, message, meta);
  }

  info(context: string, message: string, meta?: Record<string, any>) {
    this.log(LogLevel.INFO, context, message, meta);
  }

  warn(context: string, message: string, meta?: Record<string, any>) {
    this.log(LogLevel.WARN, context, message, meta);
  }

  error(context: string, message: string, error?: Error | any, meta?: Record<string, any>) {
    this.log(LogLevel.ERROR, context, message, meta, error);
  }

  critical(context: string, message: string, error?: Error | any, meta?: Record<string, any>) {
    this.log(LogLevel.CRITICAL, context, `💥 FATAL / CRITICAL: ${message}`, meta, error);
  }
}

export const logger = new Logger();
