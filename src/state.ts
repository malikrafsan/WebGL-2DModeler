// import { Shape2D} from "./models";
// import { MODES, MODE_TYPES } from "./enums";

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

// export {
//   WorldState,
// }