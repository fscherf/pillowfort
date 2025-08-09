import { parseCSSValue, CSSValue } from "./css";
import { Viewport } from "./types";
import { Engine } from "./";

export class Layer {
  public engine: Engine;
  public viewport: Viewport;

  // configuration
  public visible: boolean = true;
  public handleInput: boolean = true;

  // meta data
  public name: string = "";
  public zIndex: number = 0;

  // viewport
  public width: string = "";
  public height: string = "";
  public top: string = "";
  public right: string = "";
  public bottom: string = "";
  public left: string = "";

  // Engine entrypoints
  public tick(timeDelta: number): void {}
  public render(timeDelta: number): void {}

  // viewport calculations
  public recalculateViewport(): void {
    //                     Viewport
    // +------------------------------------------------+
    // |              -                    -            |
    // |              | y / top            |            |
    // |              -                    |            |
    // | |----------| +------------------+ | bottom     |
    // |  x / left    |                  | |            |
    // |              |      Layer       | |            |
    // |              |                  | |            |
    // |              +------------------+ -            |
    // | |-------------------------------|              |
    // |              right                             |
    // |                                                |
    // +------------------------------------------------+

    let width: number = 0;
    let height: number = 0;
    let top: number = 0;
    let right: number = 0;
    let bottom: number = 0;
    let left: number = 0;

    const parseRalativeValue = (
      value: string,
      viewportDimension: number,
    ): number => {
      const cssValue: CSSValue = parseCSSValue(value);

      if (cssValue.unit == "px") {
        return cssValue.value;
      } else if (cssValue.unit == "percent") {
        return (viewportDimension / 100) * cssValue.value;
      }
    };

    // horizontal
    if (this.width) {
      width = parseRalativeValue(this.width, this.engine.viewport.width);

      if (this.left) {
        left = parseRalativeValue(this.left, this.engine.viewport.width);

        right = left + width;
      } else if (this.right) {
        right =
          this.engine.viewport.width -
          parseRalativeValue(this.right, this.engine.viewport.width);

        left = right - width;
      } else {
        right = left + width;
      }
    } else {
      if (this.left) {
        left = parseRalativeValue(this.left, this.engine.viewport.width);
      }

      if (this.right) {
        right = parseRalativeValue(this.right, this.engine.viewport.width);
      }

      width = this.engine.viewport.width - left - right;
      right = left + width;
    }

    // vertical
    if (this.height) {
      height = parseRalativeValue(this.height, this.engine.viewport.height);

      if (this.top) {
        top = parseRalativeValue(this.top, this.engine.viewport.height);

        bottom = top + height;
      } else if (this.bottom) {
        bottom =
          this.engine.viewport.height -
          parseRalativeValue(this.bottom, this.engine.viewport.height);

        top = bottom - height;
      } else {
        bottom = top + height;
      }
    } else {
      if (this.top) {
        top = parseRalativeValue(this.top, this.engine.viewport.height);
      }

      if (this.bottom) {
        bottom = parseRalativeValue(this.bottom, this.engine.viewport.height);
      }

      height = this.engine.viewport.height - top - bottom;
      bottom = top + height;
    }

    // finish
    this.viewport = {
      x: left,
      y: top,
      top: top,
      right: right,
      bottom: bottom,
      left: left,
      width: width,
      height: height,
    };
  }
}
