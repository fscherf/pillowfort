import { GUIWindowManager } from "@/gui/window-manager";

const WINDOW_THEMES: Array<string> = ["light", "dark", "classic"];
const WINDOW_CLASS: string = "gui-window";
const WINDOW_MOVING_CLASS: string = "gui-window-moving";
const WINDOW_RESIZING_CLASS: string = "gui-window-resizing";

const WINDOW_TEMPLATE: string = `
  <div class="gui-window-title-bar">
    <div class="gui-window-title-bar-left">
      <i class="gui-window-collapse-toggle fa-solid fa-caret-down"></i>
    </div>
    <div class="gui-window-title-bar-title"></div>
    <div class="gui-window-title-bar-right">
      <i class="gui-window-close fa-solid fa-xmark"></i>
    </div>
  </div>
  <div class="gui-window-body">
    <div class="gui-window-content"></div>
  </div>
  <div class="gui-window-body-overlay"></div>
  <div class="gui-window-resizer gui-window-resize-w"></div>
  <div class="gui-window-resizer gui-window-resize-e"></div>
  <div class="gui-window-resizer gui-window-resize-s"></div>
  <div class="gui-window-resizer gui-window-resize-sw"></div>
  <div class="gui-window-resizer gui-window-resize-se"></div>
`;

const WINDOW_DEFAULT_ON_START = (guiWindow: GUIWindow): void => {};
const WINDOW_DEFAULT_ON_CLOSE = (guiWindow: GUIWindow): void => {};
const WINDOW_DEFAULT_ON_RESIZE = (guiWindow: GUIWindow): void => {};

export class GUIWindow {
  public guiWindowManager: GUIWindowManager;
  public identifier: Array<string>;

  public rootElement: HTMLElement;
  public titleBarElement: HTMLElement;
  public titleBarTitleElement: HTMLElement;
  public bodyElement: HTMLElement;
  public contentElement: HTMLElement;
  public collapseToggleElement: HTMLElement;
  public closeElement: HTMLElement;
  public activeResizer: HTMLElement;

  public onStart: (guiWindow: GUIWindow) => void = WINDOW_DEFAULT_ON_START;
  public onClose: (guiWindow: GUIWindow) => void = WINDOW_DEFAULT_ON_CLOSE;
  public onResize: (guiWindow: GUIWindow) => void = WINDOW_DEFAULT_ON_RESIZE;

  constructor(guiWindowManager: GUIWindowManager, identifier: Array<string>) {
    this.guiWindowManager = guiWindowManager;
    this.identifier = identifier;

    // setup root element
    this.rootElement = document.createElement("div");
    this.rootElement.classList.add(WINDOW_CLASS);
    this.rootElement.innerHTML = WINDOW_TEMPLATE;

    // find elements
    this.titleBarElement = this.rootElement.querySelector(
      ".gui-window-title-bar",
    );

    this.collapseToggleElement = this.rootElement.querySelector(
      ".gui-window-collapse-toggle",
    );

    this.titleBarTitleElement = this.rootElement.querySelector(
      ".gui-window-title-bar-title",
    );

    this.closeElement = this.rootElement.querySelector(".gui-window-close");
    this.bodyElement = this.rootElement.querySelector(".gui-window-body");
    this.contentElement = this.rootElement.querySelector(".gui-window-content");

    // setup events
    this.setupFocus();
    this.setupMouseMove();
    this.setupMouseResize();
    this.setupCollapse();
    this.setupClose();

    // default configuration
    this.setTheme("dark");
    this.setSize(500, 300);
    this.setCollapsible(true);
    this.setClosable(true);
  }

  /* zIndex */
  public setZIndex(zIndex: number) {
    this.rootElement.style.zIndex = `${zIndex}`;
  }

  public getZIndex(): number {
    return parseInt(this.rootElement.style.zIndex);
  }

  /* size */
  public setSize(width: number, height: number): void {
    this.rootElement.style.width = `${width}px`;
    this.rootElement.style.height = `${height}px`;
  }

  public getSize(): { width: number; height: number } {
    return {
      width: parseInt(this.rootElement.style.width),
      height: parseInt(this.rootElement.style.height),
    };
  }

  /* position */
  public setPosition(x: number, y: number): void {
    this.rootElement.style.top = `${x}px`;
    this.rootElement.style.left = `${y}px`;
  }

  public getPosition(): { x: number; y: number } {
    return {
      x: parseInt(this.rootElement.style.top),
      y: parseInt(this.rootElement.style.left),
    };
  }

  /* theme */
  public setTheme(name: string): void {
    if (!WINDOW_THEMES.includes(name)) {
      throw "invalid theme name";
    }

    this.rootElement.classList.remove("gui-theme-dark");
    this.rootElement.classList.remove("gui-theme-light");
    this.rootElement.classList.remove("gui-theme-classic");

    this.rootElement.classList.add(`gui-theme-${name}`);
  }

  /* active */
  public setActive(active: boolean): void {
    if (active) {
      this.rootElement.classList.add("gui-window-active");
    } else {
      this.rootElement.classList.remove("gui-window-active");
    }
  }

  public getActive(): boolean {
    return this.rootElement.classList.contains("gui-window-active");
  }

  /* configuration */
  public setCollapsible(collapsible: boolean) {
    if (collapsible) {
      this.collapseToggleElement.style.display = "block";
    } else {
      this.collapseToggleElement.style.display = "none";
    }
  }

  public setClosable(closable: boolean) {
    if (closable) {
      this.closeElement.style.display = "block";
    } else {
      this.closeElement.style.display = "none";
    }
  }

  public setTitle(title: string): void {
    this.titleBarTitleElement.innerHTML = title;
  }

  /* actions */
  public raise(): void {
    this.guiWindowManager.raiseWindow(this);
  }

  public collapse(): void {}

  public close(): void {
    this.onClose(this);
    this.rootElement.remove();
  }

  /* event listener */
  private setupFocus(): void {
    this.rootElement.addEventListener(
      "mousedown",
      (event: MouseEvent) => {
        if (this.getActive()) {
          return;
        }

        this.raise();
      },
      true,
    );
  }

  private setupMouseMove(): void {
    const handleMouseMove = (event: MouseEvent) => {
      event.preventDefault();

      this.rootElement.classList.add(WINDOW_MOVING_CLASS);

      const clientRect = this.rootElement.getClientRects()[0];

      this.rootElement.style.left =
        (parseInt(this.rootElement.style.left) || clientRect.left) +
        event.movementX +
        "px";

      this.rootElement.style.top =
        (parseInt(this.rootElement.style.top) || clientRect.top) +
        event.movementY +
        "px";
    };

    const handleMouseUp = (event: MouseEvent) => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);

      this.rootElement.classList.remove(WINDOW_MOVING_CLASS);
    };

    this.titleBarElement.addEventListener("mousedown", (event: MouseEvent) => {
      // skip if click was no left click
      if (event.which != 1) {
        return;
      }

      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    });
  }

  private setupMouseResize() {
    const resizeStart = (event: MouseEvent) => {
      event.preventDefault();

      this.rootElement.classList.add(WINDOW_RESIZING_CLASS);

      const clientRect = this.rootElement.getClientRects()[0];

      // fint resizing direction
      let resizeLeft = false;
      let resizeRight = false;
      let resizeBottom = false;

      if (
        this.activeResizer.classList.contains("gui-window-resize-w") ||
        this.activeResizer.classList.contains("gui-window-resize-sw")
      ) {
        resizeLeft = true;
      }

      if (
        this.activeResizer.classList.contains("gui-window-resize-e") ||
        this.activeResizer.classList.contains("gui-window-resize-se")
      ) {
        resizeRight = true;
      }

      if (
        this.activeResizer.classList.contains("gui-window-resize-s") ||
        this.activeResizer.classList.contains("gui-window-resize-sw") ||
        this.activeResizer.classList.contains("gui-window-resize-se")
      ) {
        resizeBottom = true;
      }

      if (resizeLeft) {
        this.rootElement.style.left =
          (parseInt(this.rootElement.style.left) || clientRect.left) +
          event.movementX +
          "px";

        this.rootElement.style.width =
          (parseInt(this.rootElement.style.width) || clientRect.width) +
          event.movementX * -1 +
          "px";
      }

      if (resizeRight) {
        this.rootElement.style.width =
          (parseInt(this.rootElement.style.width) || clientRect.width) +
          event.movementX +
          "px";
      }

      if (resizeBottom) {
        this.rootElement.style.height =
          (parseInt(this.rootElement.style.height) || clientRect.height) +
          event.movementY +
          "px";
      }

      this.onResize(this);
    };

    const resizeStop = () => {
      window.removeEventListener("mousemove", resizeStart);
      window.removeEventListener("mouseup", resizeStop);

      this.rootElement.classList.remove(WINDOW_RESIZING_CLASS);
    };

    const resizers: NodeListOf<HTMLElement> = this.rootElement.querySelectorAll(
      ".gui-window-resizer",
    );

    resizers.forEach((resizer) => {
      resizer.addEventListener("mousedown", (event: MouseEvent) => {
        // skip if click was no left click
        if (event.which != 1) {
          return;
        }

        this.activeResizer = resizer;

        window.addEventListener("mousemove", resizeStart);
        window.addEventListener("mouseup", resizeStop);
      });
    });
  }

  private setupCollapse(): void {
    // TODO
  }

  private setupClose(): void {
    this.closeElement.addEventListener("click", (event: MouseEvent) => {
      // skip if click was no left click
      if (event.which != 1) {
        return;
      }

      this.close();
    });
  }
}
