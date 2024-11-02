export interface LoggerInjected {
  logger: Logger;
}

export class Logger {
  private static instances: Map<string, Logger> = new Map();
  private prefix: string;
  private enabled: boolean = true;

  private constructor(prefix: string) {
    this.prefix = prefix;
  }

  static getLogger(prefix: string): Logger {
    if (!this.instances.has(prefix)) {
      this.instances.set(prefix, new Logger(prefix));
    }
    return this.instances.get(prefix)!;
  }

  static enableAll() {
    this.instances.forEach((logger) => logger.enable());
  }

  static disableAll() {
    this.instances.forEach((logger) => logger.disable());
  }

  log(...args: any[]) {
    if (!this.enabled) return;
    console.log(this.prefix, ...args);
  }

  error(...args: any[]) {
    if (!this.enabled) return;
    console.error(this.prefix, ...args);
  }

  warn(...args: any[]) {
    if (!this.enabled) return;
    console.warn(this.prefix, ...args);
  }

  disable() {
    this.enabled = false;
  }

  enable() {
    this.enabled = true;
  }
}
