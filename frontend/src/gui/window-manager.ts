import { GUIWindow } from "@/gui/window";

export type GUIWindowDefinitionsType = Map<
  string,
  (guiWindow: GUIWindow) => void
>;

const WINDOW_DEFAULT_IDENTIFIER: string = "default";

export class GUIWindowManager {
  public rootElement: HTMLElement;
  public zIndexBase: number;

  public guiWindowDefinitions: GUIWindowDefinitionsType;
  public guiWindows: Array<GUIWindow>;

  constructor({
    rootElement,
    guiWindowDefinitions,
    zIndexBase,
  }: {
    rootElement: HTMLElement;
    guiWindowDefinitions: GUIWindowDefinitionsType;
    zIndexBase?: number;
  }) {
    this.rootElement = rootElement;
    this.guiWindowDefinitions = guiWindowDefinitions;
    this.zIndexBase = zIndexBase || 1000;

    this.guiWindows = [];
  }

  /* window management */
  public getWindow(windowClass: string, identifier?: string): GUIWindow | null {
    const _identifier: Array<string> = [
      windowClass,
      identifier || WINDOW_DEFAULT_IDENTIFIER,
    ];

    for (const guiWindow of this.guiWindows) {
      if (guiWindow.identifier == _identifier) {
        return guiWindow;
      }
    }

    return null;
  }

  public createWindow(windowClass: string, identifier?: string): GUIWindow {
    const windowDefinition: (guiWindow: GUIWindow) => void =
      this.guiWindowDefinitions.get(windowClass);

    const guiWindow: GUIWindow = new GUIWindow(this, [
      windowClass,
      identifier || WINDOW_DEFAULT_IDENTIFIER,
    ]);

    windowDefinition(guiWindow);

    this.rootElement.appendChild(guiWindow.rootElement);
    this.guiWindows.push(guiWindow);
    this.raiseWindow(guiWindow);

    // schedule a timeout to give the browser time to render the HTML elements
    setTimeout(() => {
      guiWindow.onStart(guiWindow);
    }, 0);

    return guiWindow;
  }

  public getOrCreateWindow(
    windowClass: string,
    identifier?: string,
  ): GUIWindow {
    const guiWindow: GUIWindow | null = this.getWindow(windowClass, identifier);

    if (guiWindow) {
      return guiWindow;
    }

    return this.createWindow(windowClass, identifier);
  }

  public getWindowsSortedByZIndex(): Array<GUIWindow> {
    return this.guiWindows.sort((a: GUIWindow, b: GUIWindow) => {
      if (a.rootElement.style.zIndex < b.rootElement.style.zIndex) {
        return -1;
      }

      if (a.rootElement.style.zIndex > b.rootElement.style.zIndex) {
        return 1;
      }

      return 0;
    });
  }

  public raiseWindow(guiWindow: GUIWindow): void {
    const guiWindows: Array<GUIWindow> = this.getWindowsSortedByZIndex();

    for (const [index, _guiWindow] of Array.from(guiWindows.entries())) {
      if (_guiWindow == guiWindow) {
        _guiWindow.setZIndex(this.zIndexBase + guiWindows.length);
        _guiWindow.setActive(true);
      } else {
        _guiWindow.setZIndex(this.zIndexBase + index);
        _guiWindow.setActive(false);
      }
    }
  }
}
