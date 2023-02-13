class WorldState {
  private shapes: Shape2D[];
  private mode: MODE_TYPES;
  // TODO: add new needed attributes

  constructor() {
    this.shapes = [];
    this.mode = MODES.DRAW;
  }

  public addShape(shape: Shape2D): void {
    this.shapes.push(shape);
  }
}

class ElementContainer {
  public readonly canvas;
  public readonly clear_button;
  public readonly pop_button;
  public readonly type_button;
  public readonly ul_data;
  public readonly select_button;
  public readonly save_button;
  public readonly load_button;
  public readonly file_name_span;

  constructor() {
    const canvas = document.querySelector("#canvas");
    const clear_button = document.querySelector("#clear");
    const pop_button = document.querySelector("#pop");
    const type_button = <HTMLInputElement>document.querySelector("#bentuk");
    const ul_data = document.querySelector("#card");
    const select_button = document.querySelector("#select");
    const save_button = document.querySelector("#save");
    const load_button = document.querySelector("#load");
    const file_name_span = document.querySelector("#current_file");

    if (!(canvas instanceof HTMLCanvasElement)) {
      throw new Error("No html canvas element.");
    }

    if (!(clear_button instanceof HTMLButtonElement)) {
      throw new Error("No html button element.");
    }

    if (!(pop_button instanceof HTMLButtonElement)) {
      throw new Error("No html button element.");
    }

    if (!(select_button instanceof HTMLButtonElement)) {
      throw new Error("No html button element.");
    }

    this.canvas = canvas;
    this.clear_button = clear_button;
    this.pop_button = pop_button;
    this.type_button = type_button;
    this.ul_data = ul_data;
    this.select_button = select_button;
    this.save_button = save_button;
    this.load_button = load_button;
    this.file_name_span = file_name_span;
  }
}
