import { Layer } from "@/rendering/2d/layer";

export class CallbackLayer extends Layer {
  public callback: (layer: Layer, timeDelta: number) => void;

  render(timeDelta: number): void {
    this.callback(this, timeDelta);
  }
}
