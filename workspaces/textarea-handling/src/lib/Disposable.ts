export interface IDisposable {
    dispose(): void;
}

export abstract class Disposable implements IDisposable {
    private disposed = false;
    private readonly disposables: IDisposable[] = [];

    public dispose() {
        if (this.disposed) return;
        this.disposed = true;
        for (const disposable of this.disposables) disposable.dispose();
    }

    public register<T extends IDisposable>(disposable: T): T {
        if (this.disposed) {
            disposable.dispose();
        } else {
            this.disposables.push(disposable);
        }
        return disposable;
    }
}
