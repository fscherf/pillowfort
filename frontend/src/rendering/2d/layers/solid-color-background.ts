import { Dimensions } from "../types.js";
import { Layer } from "../layer.js";

export class SolidColorBackgroundLayer extends Layer {
  public color: string = "#000000";

  render(timeDelta: number): void {
    const appDimensions: Dimensions = this.app.getDimensions();

    this.app.ctx.fillStyle = this.color;

    this.app.ctx.fillRect(0, 0, appDimensions.width, appDimensions.height);
  }
}
