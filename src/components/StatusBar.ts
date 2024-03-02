export default class StatusBar {
    private element: HTMLElement;
    private changes: number;
    private behind: number;
    
    constructor(element: HTMLElement) {
        this.element = element;
    }

    updateChanges(changes: number) {
        this.changes = changes;
        this.onUpdate();
    }

    updateBehind(behind: number) {
        this.behind = behind;
        this.onUpdate();
    }

    update(changes: number, behind: number) {
        this.behind = behind;
        this.changes = changes;
        this.onUpdate();
    }

    private onUpdate() {
        this.element.setText(`Changes: ${this.changes} ${this.behind > 0 ? 'Commits behind' + this.behind : ''}`);
    }
}