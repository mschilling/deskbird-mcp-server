/**
 * Custom Logger for Deskbird MCP Server
 * 
 * Features:
 * - All output goes to stderr (JSON-RPC compliance)
 * - Configurable log levels via environment variables  
 * - Component-based prefixes for better debugging
 * - Conditional logging for performance optimization
 * - Structured logging support
 */

export enum LogLevel {
  SILENT = 0,
  ERROR = 1, 
  WARN = 2,
  INFO = 3,
  DEBUG = 4
}

export interface LogContext {
  [key: string]: any;
}

export class Logger {
  private component: string;
  private logLevel: LogLevel;

  constructor(component: string) {
    this.component = component;
    this.logLevel = this.determineLogLevel();
  }

  /**
   * Determine log level from environment variables
   */
  private determineLogLevel(): LogLevel {
    // Check for explicit LOG_LEVEL setting
    const logLevelEnv = process.env.LOG_LEVEL?.toLowerCase();
    if (logLevelEnv) {
      switch (logLevelEnv) {
        case 'silent': return LogLevel.SILENT;
        case 'error': return LogLevel.ERROR;
        case 'warn': return LogLevel.WARN;
        case 'info': return LogLevel.INFO;
        case 'debug': return LogLevel.DEBUG;
      }
    }

    // Check for DEBUG flag (common development pattern)
    if (process.env.DEBUG === 'true' || process.env.DEBUG === '1') {
      return LogLevel.DEBUG;
    }

    // Default based on NODE_ENV
    const nodeEnv = process.env.NODE_ENV?.toLowerCase();
    if (nodeEnv === 'production') {
      return LogLevel.ERROR;
    } else if (nodeEnv === 'development') {
      return LogLevel.INFO;
    }

    // Default fallback
    return LogLevel.INFO;
  }

  /**
   * Format timestamp for log entries
   */
  private getTimestamp(): string {
    return new Date().toISOString();
  }

  /**
   * Write log message to stderr
   */
  private writeLog(level: string, message: string, context?: LogContext): void {
    const timestamp = this.getTimestamp();
    const prefix = `[${timestamp}] [${level}] [${this.component}]`;
    
    let logMessage = `${prefix} ${message}`;
    
    if (context && Object.keys(context).length > 0) {
      logMessage += ` ${JSON.stringify(context)}`;
    }
    
    logMessage += '\n';
    
    process.stderr.write(logMessage);
  }

  /**
   * Log debug message (most verbose)
   */
  debug(message: string, context?: LogContext): void {
    if (this.logLevel >= LogLevel.DEBUG) {
      this.writeLog('DEBUG', message, context);
    }
  }

  /**
   * Log info message
   */
  info(message: string, context?: LogContext): void {
    if (this.logLevel >= LogLevel.INFO) {
      this.writeLog('INFO', message, context);
    }
  }

  /**
   * Log warning message
   */
  warn(message: string, context?: LogContext): void {
    if (this.logLevel >= LogLevel.WARN) {
      this.writeLog('WARN', message, context);
    }
  }

  /**
   * Log error message
   */
  error(message: string, error?: Error | any, context?: LogContext): void {
    if (this.logLevel >= LogLevel.ERROR) {
      const errorContext: LogContext = { ...context };
      
      if (error) {
        if (error instanceof Error) {
          errorContext.error = {
            message: error.message,
            stack: error.stack,
            name: error.name
          };
        } else {
          errorContext.error = error;
        }
      }
      
      this.writeLog('ERROR', message, errorContext);
    }
  }

  /**
   * Check if a log level is enabled
   */
  isDebugEnabled(): boolean {
    return this.logLevel >= LogLevel.DEBUG;
  }

  isInfoEnabled(): boolean {
    return this.logLevel >= LogLevel.INFO;
  }

  /**
   * Create a child logger with extended component path
   */
  child(subComponent: string): Logger {
    return new Logger(`${this.component}:${subComponent}`);
  }

  /**
   * Get current log level (useful for debugging configuration)
   */
  getCurrentLogLevel(): string {
    switch (this.logLevel) {
      case LogLevel.SILENT: return 'SILENT';
      case LogLevel.ERROR: return 'ERROR';
      case LogLevel.WARN: return 'WARN'; 
      case LogLevel.INFO: return 'INFO';
      case LogLevel.DEBUG: return 'DEBUG';
      default: return 'UNKNOWN';
    }
  }
}

/**
 * Create a logger instance for a component
 */
export function createLogger(component: string): Logger {
  return new Logger(component);
}

/**
 * Global logger for general use
 */
export const logger = new Logger('Deskbird');