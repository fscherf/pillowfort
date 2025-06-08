export class Component {
  public rootElement: HTMLElement;
  public identifier: Array<string>;
  public components: Array<Component>;

  constructor(identifier: Array<string> = undefined) {
    this.identifier = identifier || [];

    this.components = [];
    this.rootElement = this.getRootElement();
  }

  public getRootElement(): HTMLElement {
    return document.createElement("div");
  }

  public addComponent(component: Component): void {
    this.components.push(component);
  }
}
