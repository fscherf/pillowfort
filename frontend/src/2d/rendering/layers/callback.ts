import { Layer } from "@/2d/rendering/layer";

export class CallbackLayer extends Layer {
  public callback: (layer: Layer, timeDelta: number) => void;

  render(timeDelta: number): void {
    this.callback(this, timeDelta);
  }
}
