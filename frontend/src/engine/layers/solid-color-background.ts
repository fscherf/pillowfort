import { Layer } from "../layer";

export class SolidColorBackgroundLayer extends Layer {
  public handleInput: boolean = false;

  public color: string = "#000000";

  render(timeDelta: number): void {
    this.engine.ctx.fillStyle = this.color;

    this.engine.ctx.fillRect(
      0,
      0,
      this.engine.viewport.width,
      this.engine.viewport.height,
    );
  }
}
