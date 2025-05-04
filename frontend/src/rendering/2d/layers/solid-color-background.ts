import { Layer } from "@/rendering/2d/layer";

export class SolidColorBackgroundLayer extends Layer {
  public color: string = "#000000";

  render(timeDelta: number): void {
    this.app.ctx.fillStyle = this.color;

    this.app.ctx.fillRect(
      0,
      0,
      this.app.viewport.width,
      this.app.viewport.height,
    );
  }
}
