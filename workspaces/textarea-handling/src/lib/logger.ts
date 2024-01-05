export class Logger {
    constructor(private readonly className: string) {}

    static of(object: { name: string }) {
        return new Logger(object.name);
    }

    log(...messages: unknown[]) {
        console.log(`${new Date().toISOString()} [${this.className}]`, ...messages);
    }
    info(...messages: unknown[]) {
        console.log(`${new Date().toISOString()} [${this.className}]`, ...messages);
    }
    warn(...messages: unknown[]) {
        console.log(`${new Date().toISOString()} [${this.className}]`, ...messages);
    }
    error(...messages: unknown[]) {
        console.log(`${new Date().toISOString()} [${this.className}]`, ...messages);
    }
}
