import { getProperty, setProperty } from "@/utils";
import { Component } from "@/gui/component";

export class GUIAttributeTableComponent extends Component {
  public getRootElement(): HTMLElement {
    const tableElement: HTMLElement = document.createElement("table");

    tableElement.classList.add("gui-component-attribute-table");

    tableElement.innerHTML = `
      <tbody>
      </tbody>
    `;

    return tableElement;
  }

  public clear(): void {
    const tBodyElement: HTMLElement = this.rootElement.querySelector("tbody");

    tBodyElement.innerHTML = "";
  }

  // attributes
  public addAttribute(
    name: string,
    verboseName?: string,
    inintialValue?: unknown,
  ): void {
    verboseName = verboseName || name;
    inintialValue = inintialValue || "";

    const tBodyElement: HTMLElement = this.rootElement.querySelector("tbody");
    const trElement: HTMLElement = document.createElement("tr");

    trElement.innerHTML = `
      <th>${verboseName}</th>
      <td data-name="${name}">${inintialValue.toString()}</td>
    `;

    tBodyElement.appendChild(trElement);
  }

  public setAttribute(name: string, value: unknown): void {
    const tdElement: HTMLElement = this.rootElement.querySelector(
      `td[data-name=${name}]`,
    );

    if (tdElement) {
      tdElement.innerHTML = value.toString();
    }
  }

  public update(data: object): void {
    for (const [name, value] of Object.entries(data)) {
      this.setAttribute(name, value);
    }
  }

  // properties
  public addCheckbox(obj: object, name: string, verboseName?: string): void {
    verboseName = verboseName || name;

    const tBodyElement: HTMLElement = this.rootElement.querySelector("tbody");
    const trElement: HTMLElement = document.createElement("tr");

    trElement.innerHTML = `
      <th>${verboseName}</th>
      <td data-name="${name}">
        <input type="checkbox">
      </td>
    `;

    const checkboxElement: HTMLInputElement = trElement.querySelector("input");

    checkboxElement.checked = getProperty(obj, name);

    checkboxElement.addEventListener("change", () => {
      setProperty(obj, name, checkboxElement.checked);
    });

    setInterval(() => {
      checkboxElement.checked = getProperty(obj, name);
    }, 1000);

    tBodyElement.appendChild(trElement);
  }

  public addRange(
    obj: object,
    name: string,
    verboseName?: string,
    min: number = 0,
    max: number = 100,
  ): void {
    verboseName = verboseName || name;

    const tBodyElement: HTMLElement = this.rootElement.querySelector("tbody");
    const trElement: HTMLElement = document.createElement("tr");

    trElement.innerHTML = `
      <th>${verboseName}</th>
      <td data-name="${name}" style="text-align: center">
        <span></span>
        <input type="range" min="${min}" max="${max}">
      </td>
    `;

    const spanElement: HTMLElement = trElement.querySelector("span");
    const rangeElement: HTMLInputElement = trElement.querySelector("input");
    const initialValue = getProperty(obj, name);

    rangeElement.value = initialValue.toString();
    spanElement.innerHTML = initialValue.toString();

    rangeElement.addEventListener("input", () => {
      const value: number = parseInt(rangeElement.value);

      spanElement.innerHTML = value.toString();
      setProperty(obj, name, value);
    });

    setInterval(() => {
      const value: number = getProperty(obj, name);

      spanElement.innerHTML = value.toString();
      rangeElement.value = value.toString();
    }, 1000);

    tBodyElement.appendChild(trElement);
  }
}
