import { Layer } from "../layer";

export class StatsLayer extends Layer {
  public handleInput: boolean = false;

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
      lines.push(`FPS: ${this.engine.fps.toFixed(2)}`);
    }

    if (this.showTps) {
      lines.push(`TPS: ${this.engine.tps.toFixed(2)}`);
    }

    if (lines.length > 0) {
      this.engine.ctx.font = `${this.fontSize}px ${this.fontFamily}`;
      this.engine.ctx.fillStyle = this.textColor;
      this.engine.ctx.textBaseline = "top";
      this.engine.ctx.textAlign = "right";

      const x = this.engine.viewport.width - this.defaultGutter;
      let y = this.defaultGutter;

      for (const line of lines) {
        this.engine.ctx.fillText(line, x, y);

        y += this.fontSize;
      }
    }

    // corners
    if (this.showCorners) {
      this.engine.ctx.fillStyle = this.cornerColor;

      // top left
      this.engine.ctx.fillRect(0, 0, this.cornerLength, this.cornerWidth);

      this.engine.ctx.fillRect(0, 0, this.cornerWidth, this.cornerLength);

      // top right
      this.engine.ctx.fillRect(
        this.engine.viewport.width - this.cornerLength,
        0,
        this.engine.viewport.width,
        this.cornerWidth,
      );

      this.engine.ctx.fillRect(
        this.engine.viewport.width - this.cornerWidth,
        0,
        this.engine.viewport.width,
        this.cornerLength,
      );

      // bottom right
      this.engine.ctx.fillRect(
        this.engine.viewport.width - this.cornerLength,
        this.engine.viewport.height - this.cornerWidth,
        this.engine.viewport.width,
        this.engine.viewport.height,
      );

      this.engine.ctx.fillRect(
        this.engine.viewport.width - this.cornerWidth,
        this.engine.viewport.height - this.cornerLength,
        this.engine.viewport.width,
        this.engine.viewport.height,
      );

      // bottom left
      this.engine.ctx.fillRect(
        0,
        this.engine.viewport.height - this.cornerWidth,
        this.cornerLength,
        this.engine.viewport.height,
      );

      this.engine.ctx.fillRect(
        0,
        this.engine.viewport.height - this.cornerLength,
        this.cornerWidth,
        this.engine.viewport.height,
      );
    }
  }
}
