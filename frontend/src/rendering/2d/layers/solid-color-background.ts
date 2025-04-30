import { Viewport } from "../types.js";
import { Layer } from "../layer.js";

export class SolidColorBackgroundLayer extends Layer {
  public color: string = "#000000";

  render(timeDelta: number): void {
    const appViewport: Viewport = this.app.getViewport();

    this.app.ctx.fillStyle = this.color;

    this.app.ctx.fillRect(0, 0, appViewport.width, appViewport.height);
  }
}
