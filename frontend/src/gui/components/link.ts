import { Component } from "@/gui/component";

export class GUILinkComponent extends Component {
  public callback: () => void;

  public getRootElement(): HTMLElement {
    const htmlElement: HTMLElement = document.createElement("div");

    htmlElement.classList.add("gui-component-link");

    htmlElement.addEventListener("click", (event: MouseEvent) => {
      event.preventDefault();

      if (!this.callback) {
        return;
      }

      this.callback();
    });

    return htmlElement;
  }

  public setText(text: string): void {
    this.rootElement.innerHTML = text;
  }

  public setCallback(callback: () => void) {
    this.callback = callback;
  }
}
