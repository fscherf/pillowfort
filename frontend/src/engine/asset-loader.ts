export class AssetLoader {
  rootElement: HTMLElement;
  assets: Map<string, HTMLImageElement>;

  constructor({ rootElement }: { rootElement: HTMLElement }) {
    this.rootElement = rootElement;

    this.assets = new Map<string, HTMLImageElement>();
  }

  async load({ id, src }: { id: string; src: string }): Promise<void> {
    return new Promise((resolve, reject) => {
      const imgElement = document.createElement("img");

      this.rootElement.appendChild(imgElement);

      imgElement.addEventListener("load", () => {
        this.assets.set(id, imgElement);

        resolve();
      });

      imgElement.addEventListener("error", () => {
        reject();
      });

      imgElement.id = id;
      imgElement.src = src;
    });
  }

  get({ id }: { id: string }): HTMLImageElement {
    return this.assets.get(id);
  }

  remove({ id }: { id: string }): boolean {
    const imgElement: HTMLImageElement = this.get({ id: id });

    if (imgElement == undefined) {
      return false;
    }

    imgElement.remove();

    this.assets.delete(id);

    return true;
  }

  clear(): boolean {
    for (const id in this.assets) {
      this.remove({ id: id });
    }

    return true;
  }
}
