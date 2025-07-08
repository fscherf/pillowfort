import { Layer } from "@/2d/rendering/layer";
import { App } from "@/2d/rendering/app";

type Timer = ReturnType<typeof setTimeout>;

export class Controller {
  public app: App;
  public mappingsNormal: Map<string, string>;
  public mappingsShift: Map<string, string>;
  public mappingsControl: Map<string, string>;
  public mappingsShiftControl: Map<string, string>;

  public focused: boolean;

  public mouseOver: boolean;
  public mouseX: number;
  public mouseY: number;

  public mouseDownLeft: boolean;
  public mouseDownLeftX: number;
  public mouseDownLeftY: number;

  public mouseDownRight: boolean;
  public mouseDownRightX: number;
  public mouseDownRightY: number;

  public wheelDeltaX: number;
  public wheelDeltaY: number;

  public activeKeys: Array<string>;
  public activeActions: Array<string>;

  public hoveredLayer: Layer | null = null;

  public onChange: () => void;

  private wheelEventTimer: Timer;

  constructor({ app }: { app: App }) {
    this.app = app;
    this.onChange = (): void => {};

    this.focused = false;
    this.mouseOver = false;
    this.mouseX = 0;
    this.mouseY = 0;

    this.mouseDownLeft = false;
    this.mouseDownLeftX = 0;
    this.mouseDownLeftY = 0;

    this.mouseDownRight = false;
    this.mouseDownRightX = 0;
    this.mouseDownRightY = 0;

    this.wheelDeltaX = 0;
    this.wheelDeltaY = 0;

    this.activeKeys = [];
    this.activeActions = [];

    // mappings for wasd movement on qwerty and qwertz keyboards
    // and the same mapping adapted to dvorak keyboards

    this.mappingsNormal = new Map([
      // walknorth
      ["ArrowUp", "walknorth"],
      ["w", "walknorth"],
      [".", "walknorth"],

      // walkeast
      ["ArrowRight", "walkeast"],
      ["d", "walkeast"],
      ["u", "walkeast"],

      // walksouth
      ["ArrowDown", "walksouth"],
      ["s", "walksouth"],
      ["e", "walksouth"],

      // walkwest
      ["ArrowLeft", "walkwest"],
      ["a", "walkwest"],
      ["o", "walkwest"],

      // ui
      ["Escape", "overlaytoggle"],
      [" ", "overlaytoggle"],
    ]);

    this.mappingsShift = new Map([
      // walknorth
      ["ArrowUp", "runnorth"],
      [">", "runnorth"],
      [".", "runnorth"],

      // walkeast
      ["ArrowRight", "runeast"],
      ["D", "runeast"],
      ["U", "runeast"],

      // walksouth
      ["ArrowDown", "runsouth"],
      ["S", "runsouth"],
      ["E", "runsouth"],

      // walkwest
      ["ArrowLeft", "runwest"],
      ["A", "runwest"],
      ["O", "runwest"],
    ]);

    this.mappingsControl = new Map();

    this.app.appElement.addEventListener("focusin", this.handleFocusEvent);
    this.app.appElement.addEventListener("focusout", this.handleBlurEvent);

    this.app.appElement.addEventListener("keydown", this.handleKeyEvent);
    this.app.appElement.addEventListener(
      "mouseover",
      this.handleMouseOverEvent,
    );
    this.app.appElement.addEventListener("mouseout", this.handleMouseOutEvent);
    this.app.appElement.addEventListener(
      "mousemove",
      this.handleMouseMoveEvent,
    );
    this.app.appElement.addEventListener("mouseup", this.handleMouseUpEvent);
    this.app.appElement.addEventListener(
      "mousedown",
      this.handleMouseDownEvent,
    );
    this.app.appElement.addEventListener("keyup", this.handleKeyEvent);
    this.app.appElement.addEventListener("wheel", this.handleWheelEvent);

    window.addEventListener("keyup", this.handleKeyEvent);
    window.addEventListener("blur", this.handleWindowBlurEvent);

    // disable the browsers context menu
    this.app.appElement.addEventListener("contextmenu", (event) => {
      event.preventDefault();
      event.stopPropagation();
    });
  }

  private updateHoveredLayer(): void {
    if (!this.mouseOver) {
      this.hoveredLayer = null;

      return;
    }

    for (
      let index = this.app.layersSortedByZIndex.length - 1;
      index >= 0;
      index--
    ) {
      const layer: Layer = this.app.layersSortedByZIndex[index];

      if (
        layer.visible &&
        layer.handleInput &&
        this.mouseX >= layer.viewport.left &&
        this.mouseX <= layer.viewport.right &&
        this.mouseY >= layer.viewport.top &&
        this.mouseY <= layer.viewport.bottom
      ) {
        this.hoveredLayer = layer;

        break;
      }
    }
  }

  private runOnChange(): void {
    if (!this.onChange) {
      return;
    }

    this.onChange();
  }

  private handleFocusEvent = (event: FocusEvent): void => {
    this.focused = true;

    this.updateHoveredLayer();
    this.runOnChange();
  };

  private handleBlurEvent = (event: FocusEvent): void => {
    this.focused = false;

    this.updateHoveredLayer();
    this.runOnChange();
  };

  private handleKeyEvent = (event: KeyboardEvent): void => {
    // find mappings
    let mappings = this.mappingsNormal;

    if (event.shiftKey) {
      if (event.ctrlKey) {
        mappings = this.mappingsShiftControl;
      } else {
        mappings = this.mappingsShift;
      }
    } else if (event.ctrlKey) {
      mappings = this.mappingsControl;
    }

    // find action
    const key: string = event.key;
    const action: string = mappings.get(key);

    if (!event.repeat) {
      if (event.type == "keydown") {
        this.activeKeys.push(key);

        if (action) {
          this.activeActions.push(action);
        }
      } else {
        this.activeKeys = this.activeKeys.filter((element: string) => {
          return element != key;
        });

        if (action) {
          this.activeActions = this.activeActions.filter((element: string) => {
            return element != action;
          });
        }
      }

      this.runOnChange();
    }

    event.preventDefault();
    event.stopPropagation();
  };

  private handleMouseOverEvent = (event: MouseEvent): void => {
    this.mouseOver = true;

    this.updateHoveredLayer();
    this.runOnChange();
  };

  private handleMouseOutEvent = (event: MouseEvent): void => {
    this.mouseOver = false;

    this.updateHoveredLayer();
    this.runOnChange();
  };

  private handleMouseDownEvent = (event: MouseEvent): void => {
    const rect = this.app.appElement.getBoundingClientRect();

    if (event.button == 0) {
      // left
      this.mouseDownLeft = true;
      this.mouseDownLeftX = event.clientX - rect.left;
      this.mouseDownLeftY = event.clientY - rect.top;
    } else if (event.button == 2) {
      // right
      this.mouseDownRight = true;
      this.mouseDownRightX = event.clientX - rect.left;
      this.mouseDownRightY = event.clientY - rect.top;
    }

    this.runOnChange();
  };

  private handleMouseUpEvent = (event: MouseEvent): void => {
    if (event.button == 0) {
      // left
      this.mouseDownLeft = false;
    } else if (event.button == 2) {
      // right
      this.mouseDownRight = false;
    }

    this.runOnChange();
  };

  private handleMouseMoveEvent = (event: MouseEvent): void => {
    const rect = this.app.appElement.getBoundingClientRect();

    this.mouseX = event.clientX - rect.left;
    this.mouseY = event.clientY - rect.top;

    this.updateHoveredLayer();
    this.runOnChange();
  };

  private handleWindowBlurEvent = (event: FocusEvent): void => {
    this.focused = false;
    this.mouseOver = false;
    this.activeKeys.length = 0;
    this.activeActions.length = 0;

    this.updateHoveredLayer();
    this.runOnChange();
  };

  private handleWheelEvent = (event: WheelEvent): void => {
    event.preventDefault();
    event.stopPropagation();

    this.wheelDeltaX = event.deltaX;
    this.wheelDeltaY = event.deltaY;

    // debouncing
    // There is no dedicated stop event for wheel events so we need
    // to wait until no new wheel events are coming and use that as the end
    // of the event.
    clearTimeout(this.wheelEventTimer);

    this.wheelEventTimer = setTimeout(() => {
      this.wheelDeltaX = 0;
      this.wheelDeltaY = 0;

      this.runOnChange();
    }, 100);

    this.runOnChange();
  };

  public getState = (): object => {
    let hoveredLayerName: string = "";

    if (this.hoveredLayer) {
      hoveredLayerName = this.hoveredLayer.name;
    }

    return {
      focused: this.focused,
      mouseOver: this.mouseOver,
      mouseX: this.mouseX,
      mouseY: this.mouseY,
      mouseDownLeft: this.mouseDownLeft,
      mouseDownLeftX: this.mouseDownLeftX,
      mouseDownLeftY: this.mouseDownLeftY,
      mouseDownRight: this.mouseDownRight,
      mouseDownRightX: this.mouseDownRightX,
      mouseDownRightY: this.mouseDownRightY,
      wheelDeltaX: this.wheelDeltaX,
      wheelDeltaY: this.wheelDeltaY,
      activeKeys: this.activeKeys,
      activeActions: this.activeActions,
      hoveredLayer: hoveredLayerName,
    };
  };
}
