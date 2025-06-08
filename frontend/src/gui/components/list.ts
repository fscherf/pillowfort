import { Component } from "@/gui/component";

export class GUIListComponent extends Component {
  public getRootElement(): HTMLElement {
    const ulElement: HTMLElement = document.createElement("ul");

    ulElement.classList.add("gui-component-list");

    return ulElement;
  }

  public addItem(component: Component): void {
    const liElement: HTMLElement = document.createElement("li");

    liElement.appendChild(component.rootElement);
    this.rootElement.appendChild(liElement);
    this.addComponent(component);
  }
}
