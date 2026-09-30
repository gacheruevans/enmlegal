import { Injectable } from '@nestjs/common';

export interface ProcessLogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  context: string;
  message: string;
  meta?: any;
}

@Injectable()
export class LogBufferService {
  private readonly maxLogs = 500;
  private readonly logs: ProcessLogEntry[] = [];

  constructor() {
    this.addLog('info', 'System', 'LogBufferService initialized. Process monitoring active.');
  }

  addLog(
    level: 'info' | 'warn' | 'error' | 'debug',
    context: string,
    message: string,
    meta?: any,
  ): ProcessLogEntry {
    const entry: ProcessLogEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: new Date().toISOString(),
      level,
      context,
      message,
      meta,
    };

    this.logs.unshift(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.pop();
    }
    return entry;
  }

  getLogs(query: { level?: string; search?: string; limit?: number }): {
    total: number;
    logs: ProcessLogEntry[];
  } {
    let filtered = [...this.logs];

    if (query.level && query.level !== 'all') {
      const targetLevel = query.level.toLowerCase();
      filtered = filtered.filter((log) => log.level === targetLevel);
    }

    if (query.search) {
      const q = query.search.toLowerCase();
      filtered = filtered.filter(
        (log) =>
          log.message.toLowerCase().includes(q) ||
          log.context.toLowerCase().includes(q) ||
          log.level.toLowerCase().includes(q),
      );
    }

    const limit = query.limit || 100;
    return {
      total: filtered.length,
      logs: filtered.slice(0, limit),
    };
  }

  clearLogs(): void {
    this.logs.length = 0;
    this.addLog('info', 'System', 'Process log buffer cleared by Super Admin.');
  }
}
