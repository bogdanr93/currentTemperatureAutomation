export type LogLevel = 'info' | 'warn' | 'error' | 'debug'

function stamp() {
  const d = new Date()
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

export const logger = {
  log(level: LogLevel, message: string, meta?: Record<string, unknown>) {
    const base = `[${stamp()}] [${level.toUpperCase()}] ${message}`
    if (meta) {
      console.log(base, JSON.stringify(meta))
    } else {
      console.log(base)
    }
  },
  info(message: string, meta?: Record<string, unknown>) {
    this.log('info', message, meta)
  },
  warn(message: string, meta?: Record<string, unknown>) {
    this.log('warn', message, meta)
  },
  error(message: string, meta?: Record<string, unknown>) {
    this.log('error', message, meta)
  },
  debug(message: string, meta?: Record<string, unknown>) {
    this.log('debug', message, meta)
  }
}
