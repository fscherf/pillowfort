import { Layer } from "@/2d/rendering/layer";
import { Scene } from "@/2d/rendering/scene";

export class Camera extends Layer {
  public scene: Scene;

  // configuration
  public backgroundEnabled: boolean = true;
  public backgroundColor: string = "#000000";

  public gridEnabled: boolean = false;
  public gridColor: string = "#FFFFFF";

  public cursorEnabled: boolean = false;
  public cursorColor: string = "#FF0000";

  public zoomEnabled: boolean = true;

  // state
  public offsetX: number = 0;
  public offsetY: number = 0;
  public zoom: number = 1;

  private lastOffsetX: number = 0;
  private lastOffsetY: number = 0;

  constructor({ scene }: { scene: Scene }) {
    super();

    this.scene = scene;
  }

  private drawBackground(): void {
    this.app.ctx.fillStyle = this.backgroundColor;

    this.app.ctx.fillRect(0, 0, this.viewport.width, this.viewport.height);
  }

  private drawGrid(): void {
    this.app.ctx.fillStyle = this.gridColor;

    // horizontal lines
    for (let tileX = 0; tileX <= this.scene.sceneWidth; tileX++) {
      const x = tileX * this.scene.tileWidth;

      this.app.ctx.fillRect(
        this.viewport.left + x,
        this.viewport.top,
        1,
        this.scene.sceneHeight * this.scene.tileHeight + 1,
      );
    }

    // vertical lines
    for (let tileY = 0; tileY <= this.scene.sceneHeight; tileY++) {
      const y = tileY * this.scene.tileHeight;

      this.app.ctx.fillRect(
        this.viewport.left,
        this.viewport.top + y,
        this.scene.sceneWidth * this.scene.tileWidth + 1,
        1,
      );
    }
  }

  private drawCursor(): void {
    if (this.app.controller.hoveredLayer != this) {
      return;
    }

    const mouseX = this.app.controller.mouseX - this.offsetX;
    const mouseY = this.app.controller.mouseY - this.offsetY;

    const coordinateX =
      Math.ceil(mouseX / (this.scene.tileWidth * this.zoom)) - 1;

    const coordinateY =
      Math.ceil(mouseY / (this.scene.tileHeight * this.zoom)) - 1;

    // cursor is out of bounds
    if (
      coordinateX < 0 ||
      coordinateX >= this.scene.sceneWidth ||
      coordinateY < 0 ||
      coordinateY >= this.scene.sceneHeight
    ) {
      return;
    }

    this.app.ctx.fillStyle = this.cursorColor;

    // top
    this.app.ctx.fillRect(
      coordinateX * this.scene.tileWidth,
      coordinateY * this.scene.tileHeight,
      this.scene.tileWidth + 1,
      1,
    );

    // right
    this.app.ctx.fillRect(
      coordinateX * this.scene.tileWidth + this.scene.tileWidth,
      coordinateY * this.scene.tileHeight,
      1,
      this.scene.tileHeight,
    );

    // bottom
    this.app.ctx.fillRect(
      coordinateX * this.scene.tileWidth,
      coordinateY * this.scene.tileHeight + this.scene.tileHeight,
      this.scene.tileWidth + 1,
      1,
    );

    // right
    this.app.ctx.fillRect(
      coordinateX * this.scene.tileWidth,
      coordinateY * this.scene.tileHeight,
      1,
      this.scene.tileHeight,
    );
  }

  public tick(timeDelta: number): void {
    // TODO: does not work correctly if mouse gets out of bounds while dragging
    // TODO: zoom into specific sectors does not work

    if (this.app.controller.hoveredLayer != this) {
      return;
    }

    // zoom
    if (this.app.controller.wheelDeltaY != 0) {
      this.zoom = Math.max(
        this.zoom + (this.app.controller.wheelDeltaY / 1000) * -1,
        0.25,
      );
    }

    // drag (mouse left)
    if (this.app.controller.mouseDownLeft) {
      this.offsetX =
        this.lastOffsetX +
        (this.app.controller.mouseX - this.app.controller.mouseDownLeftX);
      this.offsetY =
        this.lastOffsetY +
        (this.app.controller.mouseY - this.app.controller.mouseDownLeftY);
    } else {
      this.lastOffsetX = this.offsetX;
      this.lastOffsetY = this.offsetY;
    }
  }

  public render(timeDelta: number): void {
    if (this.backgroundEnabled) {
      this.drawBackground();
    }

    this.app.ctx.translate(this.offsetX, this.offsetY);
    this.app.ctx.scale(this.zoom, this.zoom);

    if (this.gridEnabled) {
      this.drawGrid();
    }

    if (this.cursorEnabled) {
      this.drawCursor();
    }
  }
}
