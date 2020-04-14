interface Disposable {
    /**
     * Dispose this object.
     */
    dispose(): void;
}

export class DisposableCollection implements Disposable {
    private disposables: Disposable[] = [];

    dispose(): void {
        while (this.disposables.length > 0) {
            this.disposables.pop()!.dispose();
        }
    }

    push(disposable: Disposable): Disposable {
        const disposables = this.disposables;
        disposables.push(disposable);
        return {
            dispose(): void {
                const index = disposables.indexOf(disposable);
                if (index !== -1) {
                    disposables.splice(index, 1);
                }
            }
        }
    }

}
