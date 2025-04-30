import { Dimensions } from "../types.js";
import { Layer } from "../layer.js";

export class StatsLayer extends Layer {
  // text
  public defaultGutter: number = 8;
  public textColor: string = "yellow";
  public fontFamily: string = "monospace";
  public fontSize: number = 16;

  // stats
  public showFps: boolean = false;
  public showTps: boolean = false;

  // corners
  public showCorners: boolean = false;
  public cornerColor: string = "red";
  public cornerWidth: number = 4;
  public cornerLength: number = 32;

  render(timeDelta: number): void {
    const appDimensions: Dimensions = this.app.getDimensions();

    // stats
    const lines: Array<string> = [];

    if (this.showFps) {
      lines.push(`FPS: ${this.app.fps.toFixed(2)}`);
    }

    if (this.showTps) {
      lines.push(`TPS: ${this.app.tps.toFixed(2)}`);
    }

    if (lines.length > 0) {
      this.app.ctx.font = `${this.fontSize}px ${this.fontFamily}`;
      this.app.ctx.fillStyle = this.textColor;
      this.app.ctx.textBaseline = "top";
      this.app.ctx.textAlign = "right";

      const x = appDimensions.width - this.defaultGutter;
      let y = this.defaultGutter;

      for (const line of lines) {
        this.app.ctx.fillText(line, x, y);

        y += this.fontSize;
      }
    }

    // corners
    if (this.showCorners) {
      this.app.ctx.fillStyle = this.cornerColor;

      // top left
      this.app.ctx.fillRect(0, 0, this.cornerLength, this.cornerWidth);

      this.app.ctx.fillRect(0, 0, this.cornerWidth, this.cornerLength);

      // top right
      this.app.ctx.fillRect(
        appDimensions.width - this.cornerLength,
        0,
        appDimensions.width,
        this.cornerWidth,
      );

      this.app.ctx.fillRect(
        appDimensions.width - this.cornerWidth,
        0,
        appDimensions.width,
        this.cornerLength,
      );

      // bottom right
      this.app.ctx.fillRect(
        appDimensions.width - this.cornerLength,
        appDimensions.height - this.cornerWidth,
        appDimensions.width,
        appDimensions.height,
      );

      this.app.ctx.fillRect(
        appDimensions.width - this.cornerWidth,
        appDimensions.height - this.cornerLength,
        appDimensions.width,
        appDimensions.height,
      );

      // bottom left
      this.app.ctx.fillRect(
        0,
        appDimensions.height - this.cornerWidth,
        this.cornerLength,
        appDimensions.height,
      );

      this.app.ctx.fillRect(
        0,
        appDimensions.height - this.cornerLength,
        this.cornerWidth,
        appDimensions.height,
      );
    }
  }
}
