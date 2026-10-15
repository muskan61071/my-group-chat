type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class Logger {
  private formatPrefix(level: LogLevel, context?: string): string {
    const time = new Date().toISOString();
    const ctx = context ? ` [${context}]` : '';
    return `[${time}] [${level.toUpperCase()}]${ctx}:`;
  }

  debug(message: string, context?: string, ...meta: any[]) {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(this.formatPrefix('debug', context), message, ...meta);
    }
  }

  info(message: string, context?: string, ...meta: any[]) {
    console.log(this.formatPrefix('info', context), message, ...meta);
  }

  warn(message: string, context?: string, ...meta: any[]) {
    console.warn(this.formatPrefix('warn', context), message, ...meta);
  }

  error(message: string, context?: string, ...meta: any[]) {
    console.error(this.formatPrefix('error', context), message, ...meta);
  }
}

export const logger = new Logger();
