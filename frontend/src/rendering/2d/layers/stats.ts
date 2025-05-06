import { Layer } from "@/rendering/2d/layer";

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
  public cornerWidth: number = 1;
  public cornerLength: number = 32;

  render(timeDelta: number): void {
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

      const x = this.app.viewport.width - this.defaultGutter;
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
        this.app.viewport.width - this.cornerLength,
        0,
        this.app.viewport.width,
        this.cornerWidth,
      );

      this.app.ctx.fillRect(
        this.app.viewport.width - this.cornerWidth,
        0,
        this.app.viewport.width,
        this.cornerLength,
      );

      // bottom right
      this.app.ctx.fillRect(
        this.app.viewport.width - this.cornerLength,
        this.app.viewport.height - this.cornerWidth,
        this.app.viewport.width,
        this.app.viewport.height,
      );

      this.app.ctx.fillRect(
        this.app.viewport.width - this.cornerWidth,
        this.app.viewport.height - this.cornerLength,
        this.app.viewport.width,
        this.app.viewport.height,
      );

      // bottom left
      this.app.ctx.fillRect(
        0,
        this.app.viewport.height - this.cornerWidth,
        this.cornerLength,
        this.app.viewport.height,
      );

      this.app.ctx.fillRect(
        0,
        this.app.viewport.height - this.cornerLength,
        this.cornerWidth,
        this.app.viewport.height,
      );
    }
  }
}
