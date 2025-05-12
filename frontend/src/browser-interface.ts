import { Viewport } from "./rendering/2d/types.js";

export class BrowserInterface {
  public getViewport(element: HTMLElement): Viewport {
    const clientRect = element.getClientRects()[0];

    return {
      x: clientRect.x,
      y: clientRect.y,
      width: clientRect.width,
      height: clientRect.height,
      top: clientRect.top,
      right: clientRect.right,
      bottom: clientRect.bottom,
      left: clientRect.left,
    };
  }

  public get2dContext(
    canvasElement: HTMLCanvasElement,
  ): CanvasRenderingContext2D | TestCanvasRenderingContext2D {
    const ctx: CanvasRenderingContext2D = canvasElement.getContext("2d");

    ctx.imageSmoothingEnabled = false;

    return ctx;
  }
}

export class TestCanvasRenderingContext2D {
  public imageSmoothingEnabled: boolean = true;

  public font: string = "";
  public fillStyle: string = "";
  public textAlign: string = "";
  public textBaseline: string = "";

  public fillRect(): void {}
  public fillText(): void {}
  public rotate(): void {}
  public translate(): void {}
  public resetTransform(): void {}
}

export class TestBrowserInterface extends BrowserInterface {
  public viewport: Viewport;

  public getViewport(element: HTMLElement): Viewport {
    return this.viewport;
  }

  public get2dContext(
    canvasElement: HTMLCanvasElement,
  ): TestCanvasRenderingContext2D {
    return new TestCanvasRenderingContext2D();
  }
}
