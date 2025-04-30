import { Layer } from "../layer.js";

export class CallbackLayer extends Layer {
  public callback: (layer: Layer, timeDelta: number) => void;

  render(timeDelta: number): void {
    this.callback(this, timeDelta);
  }
}
