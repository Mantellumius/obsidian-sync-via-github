export default class StatusBar {
    private element: HTMLElement;
    private changes: number;

    constructor(element: HTMLElement) {
        this.element = element;
    }

    update(changes: number) {
        this.changes = changes;
        this.onUpdate();
    }

    private onUpdate() {
        this.element.setText(`Changes: ${this.changes}`);
    }
}