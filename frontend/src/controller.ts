type Timer = ReturnType<typeof setTimeout>;

export class Controller {
  public element: HTMLElement;
  public mappingsNormal: Map<string, string>;
  public mappingsShift: Map<string, string>;
  public mappingsControl: Map<string, string>;
  public mappingsShiftControl: Map<string, string>;

  public mouseOver: boolean;
  public mouseDown: boolean;
  public mouseX: number;
  public mouseY: number;
  public mouseDownX: number;
  public mouseDownY: number;

  public wheelDeltaX: number;
  public wheelDeltaY: number;

  public activeKeys: Array<string>;
  public activeActions: Array<string>;

  public onChange: () => void;

  private wheelEventTimer: Timer;

  constructor({ element }: { element: HTMLElement }) {
    this.element = element;
    this.onChange = (): void => {};

    this.mouseOver = false;
    this.mouseDown = false;
    this.mouseX = 0;
    this.mouseY = 0;
    this.mouseDownX = 0;
    this.mouseDownY = 0;

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

    this.element.addEventListener("keydown", this.handleKeyEvent);
    this.element.addEventListener("mouseover", this.handleMouseOverEvent);
    this.element.addEventListener("mouseout", this.handleMouseOutEvent);
    this.element.addEventListener("mousemove", this.handleMouseMoveEvent);
    this.element.addEventListener("mouseup", this.handleMouseUpEvent);
    this.element.addEventListener("mousedown", this.handleMouseDownEvent);
    this.element.addEventListener("keyup", this.handleKeyEvent);
    this.element.addEventListener("wheel", this.handleWheelEvent);

    window.addEventListener("keyup", this.handleKeyEvent);
    window.addEventListener("blur", this.handleBlurEvent);
  }

  private runOnChange(): void {
    if (!this.onChange) {
      return;
    }

    this.onChange();
  }

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

    this.runOnChange();
  };

  private handleMouseOutEvent = (event: MouseEvent): void => {
    this.mouseOver = false;

    this.runOnChange();
  };

  private handleMouseDownEvent = (event: MouseEvent): void => {
    const rect = this.element.getBoundingClientRect();

    this.mouseDown = true;
    this.mouseDownX = event.clientX - rect.left;
    this.mouseDownY = event.clientY - rect.top;

    this.runOnChange();
  };

  private handleMouseUpEvent = (): void => {
    this.mouseDown = false;

    this.runOnChange();
  };

  private handleMouseMoveEvent = (event: MouseEvent): void => {
    const rect = this.element.getBoundingClientRect();

    this.mouseX = event.clientX - rect.left;
    this.mouseY = event.clientY - rect.top;

    this.runOnChange();
  };

  private handleBlurEvent = (event: FocusEvent): void => {
    this.mouseOver = false;
    this.activeKeys.length = 0;
    this.activeActions.length = 0;

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
    return {
      mouseOver: this.mouseOver,
      mouseDown: this.mouseDown,
      mouseX: this.mouseX,
      mouseY: this.mouseY,
      mouseDownX: this.mouseDownX,
      mouseDownY: this.mouseDownY,
      wheelDeltaX: this.wheelDeltaX,
      wheelDeltaY: this.wheelDeltaY,
      activeKeys: this.activeKeys,
      activeActions: this.activeActions,
    };
  };
}
