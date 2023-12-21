export class Logger {
    constructor(private readonly className: string) {}

    log(message: string) {
        console.log(`${new Date().toISOString()} [${this.className}] ${message}`);
    }
    info(message: string) {
        console.info(`${new Date().toISOString()} [${this.className}] ${message}`);
    }
    warn(message: string) {
        console.warn(`${new Date().toISOString()} [${this.className}] ${message}`);
    }
    error(message: string) {
        console.error(`${new Date().toISOString()} [${this.className}] ${message}`);
    }
}
