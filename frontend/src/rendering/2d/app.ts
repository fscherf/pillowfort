import {
  BrowserInterface,
  TestCanvasRenderingContext2D,
} from "../../browser-interface.js";
import { Viewport } from "./types.js";
import { Layer } from "./layer.js";

export class App {
  public rootElement: HTMLElement;
  public browserInterface: BrowserInterface;
  public appElement: HTMLDivElement;
  public canvasElement: HTMLCanvasElement;
  public ctx: CanvasRenderingContext2D | TestCanvasRenderingContext2D;
  public layers: Array<Layer>;
  public running: boolean;
  public fps: number;
  public tps: number;

  // configuration
  public accumulatorMaxInMs: number = 250;
  public tpsMax: number = 60;
  public autoScale: boolean = false;
  public width: number = 800;
  public height: number = 600;

  // layers
  private layersSortedByZIndex: Array<Layer>;
  private layersByName: Map<string, Layer>;

  // loop
  private lastTimestamp: number;
  private fixedDeltaTime: number;
  private accumulator: number;
  private tickCount: number;
  private frameCount: number;
  private lastTpsUpdateTimestamp: number;
  private lastFpsUpdateTimestamp: number;

  constructor({
    rootElement,
    browserInterface,
  }: {
    rootElement: HTMLElement;
    browserInterface?: BrowserInterface;
  }) {
    this.rootElement = rootElement;
    this.browserInterface = browserInterface;

    if (!this.browserInterface) {
      this.browserInterface = new BrowserInterface();
    }

    // bootstrap HTML structure
    rootElement.innerHTML = `
      <div class="app app-2d">
        <canvas tabindex=0></canvas>
      </div>
    `;

    this.appElement = this.rootElement.querySelector(
      "div.app",
    ) as HTMLDivElement;

    this.canvasElement = this.rootElement.querySelector(
      "canvas",
    ) as HTMLCanvasElement;

    this.ctx = this.browserInterface.get2dContext(this.canvasElement);

    // setup layers
    this.layers = [];
    this.layersSortedByZIndex = [];
    this.layersByName = new Map();

    // setup event listeners
    // scaling
    window.addEventListener("resize", () => {
      if (!this.autoScale) {
        return;
      }

      this.scale();
    });

    // finish
    // make HTML visible
    this.appElement.style.display = "block";
  }

  // main loop
  private mainLoop(timestamp: number): void {
    const timeDelta: number = timestamp - this.lastTimestamp;

    // ticks
    this.accumulator += timeDelta;
    this.accumulator = Math.min(this.accumulator, this.accumulatorMaxInMs);

    while (this.accumulator >= this.fixedDeltaTime) {
      for (const layer of this.layersSortedByZIndex) {
        layer.tick(this.fixedDeltaTime);
      }

      this.accumulator -= this.fixedDeltaTime;
      this.tickCount += 1;
    }

    // calculate TPS
    const tpsUpdateTimeDelta: number = timestamp - this.lastTpsUpdateTimestamp;

    if (tpsUpdateTimeDelta >= 1000) {
      this.tps = this.tickCount / (tpsUpdateTimeDelta / 1000);
      this.tickCount = 0;
      this.lastTpsUpdateTimestamp = timestamp;
    }

    // render
    for (const layer of this.layersSortedByZIndex) {
      if (!layer.visible) {
        continue;
      }

      layer.render(timeDelta);
    }

    this.frameCount += 1;

    // calculate FPS
    const fpsUpdateTimeDelta: number = timestamp - this.lastFpsUpdateTimestamp;

    if (fpsUpdateTimeDelta >= 1000) {
      this.fps = this.frameCount / (fpsUpdateTimeDelta / 1000);
      this.frameCount = 0;
      this.lastFpsUpdateTimestamp = timestamp;
    }

    // finish
    this.lastTimestamp = timestamp;

    if (this.running) {
      requestAnimationFrame(this.mainLoop.bind(this));
    }
  }

  public setTpsMax(tpsMax: number): void {
    this.tpsMax = tpsMax;
    this.fixedDeltaTime = 1000 / this.tpsMax;
  }

  public start(): void {
    // initial scaling
    if (this.autoScale) {
      this.scale();
    } else {
      this.resize(this.width, this.height);
    }

    // internal state
    this.running = true;
    this.tps = 0;
    this.fps = 0;
    this.lastTimestamp = 0;
    this.accumulator = 0;
    this.tickCount = 0;
    this.frameCount = 0;
    this.lastTpsUpdateTimestamp = 0;
    this.lastFpsUpdateTimestamp = 0;

    this.setTpsMax(this.tpsMax);

    // start rendering loop
    requestAnimationFrame(this.mainLoop.bind(this));
  }

  public stop(): void {
    this.running = false;
  }

  // layers
  public layersCacheUpdate(): void {
    this.layersSortedByZIndex.length = 0;
    this.layersByName.clear();

    this.layersSortedByZIndex = this.layers
      .slice()
      .sort((a: Layer, b: Layer) => {
        return b.zIndex - a.zIndex;
      });

    for (const layer of this.layers) {
      if (layer.name == "") {
        continue;
      }

      this.layersByName.set(layer.name, layer);
    }
  }

  public layerAdd(layer: Layer): void {
    layer.app = this;

    this.layers.push(layer);
    this.layersCacheUpdate();
  }

  public layerRemove(layer: Layer): void {
    const index = this.layers.indexOf(layer);

    if (index == -1) {
      return;
    }

    layer.app = undefined;

    this.layers.splice(index, 1);
    this.layersCacheUpdate();
  }

  public layerGetByName(layerName: string): Layer | undefined {
    return this.layersByName.get(layerName);
  }

  // scaling
  public getViewport(): Viewport {
    return this.browserInterface.getViewport(this.canvasElement);
  }

  public scale(): void {
    this.appElement.style.width = "100%";
    this.appElement.style.height = "100%";

    // We scale to a (presumably) lower resolution first so the app HTML
    // element has time to collapse before we measure its size.
    // Without this step, the canvas element would infinitely grow when
    // trying to scale.
    this.resize(100, 100);

    this.resize(this.appElement.clientWidth, this.appElement.clientHeight);
  }

  public resize(width: number, height: number): void {
    this.canvasElement.style.width = `${width}px`;
    this.canvasElement.style.height = `${height}px`;
    this.canvasElement.width = width;
    this.canvasElement.height = height;
  }
}
