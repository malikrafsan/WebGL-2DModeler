interface FeatureHandler {
  onMouseMove(event: MouseEvent): void;
  onMouseDown(event: MouseEvent): void;
  onMouseUp(event: MouseEvent): void;
}

class ConstraintMoveVertexHandler implements FeatureHandler {
  private elmts: ElementContainer;
  private state: WorldState;
  private gl: WebGLRenderingContext;

  constructor(
    elmts: ElementContainer,
    state: WorldState,
    gl: WebGLRenderingContext
  ) {
    this.elmts = elmts;
    this.state = state;
    this.gl = gl;
  }

  onMouseDown(event: MouseEvent) {
    const x = (event.offsetX / this.elmts.canvas.clientWidth) * 2 - 1;
    const y = (1 - event.offsetY / this.elmts.canvas.clientHeight) * 2 - 1;

    const shapeVertex = findShapeAndVertex(x, y, this.state);
    console.log(shapeVertex);
    console.log("this.state", this.state);
    console.log("x", x, "y", y);

    if (!shapeVertex) {
      return;
    }

    const shape = shapeVertex.shape;
    const idxVertex = shapeVertex.idxVertex;
    const clickVertex = shape.vertices[idxVertex];

    const allDist = shape.vertices.map((v) => {
      return calculateDist(clickVertex.x, clickVertex.y, v.x, v.y);
    });
    console.log("allDist", allDist);

    // find index max element from allDist
    const idxFarthestVertex = allDist.indexOf(Math.max(...allDist));

    this.state.featureState.selected_shape = shapeVertex.shape;
    this.state.featureState.idxVertex = shapeVertex.idxVertex;
    this.state.featureState.idxRefVertex = idxFarthestVertex;

    console.log("this.state.featureState", this.state.featureState);
  }

  onMouseMove(event: MouseEvent) {
    const x = (event.offsetX / this.elmts.canvas.clientWidth) * 2 - 1;
    const y = (1 - event.offsetY / this.elmts.canvas.clientHeight) * 2 - 1;

    const movedShape = this.state.featureState.selected_shape;
    const idxMovedVertex = this.state.featureState.idxVertex;
    const idxRefVertex = this.state.featureState.idxRefVertex;

    if (movedShape === null || idxMovedVertex === null || idxRefVertex === null) {
      return;
    }

    console.log("movedShape", movedShape);

    const movedVertex = movedShape.vertices[idxMovedVertex];

    if (movedShape instanceof Rectangle || movedShape instanceof Square) {
      console.log("rectangle || square");

      const farthestVertex = movedShape.vertices[idxRefVertex];
      const distNewVertex = calculateDist(
        x,
        y,
        farthestVertex.x,
        farthestVertex.y
      );
      const distOldVertex = calculateDist(
        movedVertex.x,
        movedVertex.y,
        farthestVertex.x,
        farthestVertex.y
      );

      const distCursor = calculateDist(x, y, movedVertex.x, movedVertex.y);

      const flip = distCursor > distOldVertex ? -1 : 1;
      const scale = (flip * distNewVertex) / distOldVertex;

      movedShape.scale(farthestVertex, scale);
      renderer.redraw(this.state, this.gl, this.elmts);
    } else if (movedShape instanceof Line) {
      const farthestVertex = movedShape.vertices[(idxMovedVertex + 1) % 2];
      const distNewVertex = calculateDist(
        x,
        y,
        farthestVertex.x,
        farthestVertex.y
      );
      const distOldVertex = calculateDist(
        movedVertex.x,
        movedVertex.y,
        farthestVertex.x,
        farthestVertex.y
      );

      const distCursor = calculateDist(x, y, movedVertex.x, movedVertex.y);

      const flip = distCursor > distOldVertex ? -1 : 1;
      const scale = (flip * distNewVertex) / distOldVertex;

      movedShape.scale(farthestVertex, scale);
      renderer.redraw(this.state, this.gl, this.elmts);
    } else if (movedShape instanceof Polygon) {
      const farthestVertex = movedShape.vertices[idxRefVertex];
      const distNewVertex = calculateDist(
        x,
        y,
        farthestVertex.x,
        farthestVertex.y
      );
      const distOldVertex = calculateDist(
        movedVertex.x,
        movedVertex.y,
        farthestVertex.x,
        farthestVertex.y
      );

      const distCursor = calculateDist(x, y, movedVertex.x, movedVertex.y);

      const flip = distCursor > distOldVertex ? -1 : 1;
      const scale = (flip * distNewVertex) / distOldVertex;

      movedShape.scale(farthestVertex, scale);
      renderer.redraw(this.state, this.gl, this.elmts);
    }
  }

  onMouseUp(event: MouseEvent) {
    this.state.featureState.clear();
  }
}

class FreeMoveVertexHandler implements FeatureHandler {
  private elmts: ElementContainer;
  private state: WorldState;
  private gl: WebGLRenderingContext;

  constructor(
    elmts: ElementContainer,
    state: WorldState,
    gl: WebGLRenderingContext
  ) {
    this.elmts = elmts;
    this.state = state;
    this.gl = gl;
  }

  onMouseDown(event: MouseEvent) {
    const x = (event.offsetX / this.elmts.canvas.clientWidth) * 2 - 1;
    const y = (1 - event.offsetY / this.elmts.canvas.clientHeight) * 2 - 1;

    const shapeVertex = findShapeAndVertex(x, y, this.state);
    console.log(shapeVertex);
    console.log("this.state", this.state);
    console.log("x", x, "y", y);

    if (!shapeVertex) {
      return;
    }

    this.state.featureState.selected_shape = shapeVertex.shape;
    this.state.featureState.idxVertex = shapeVertex.idxVertex;
  }

  onMouseMove(event: MouseEvent) {
    const x = (event.offsetX / this.elmts.canvas.clientWidth) * 2 - 1;
    const y = (1 - event.offsetY / this.elmts.canvas.clientHeight) * 2 - 1;

    const movedShape = this.state.featureState.selected_shape;
    const idxMovedVertex = this.state.featureState.idxVertex;

    if (movedShape === null || idxMovedVertex === null) {
      return;
    }
    const movedVertex = movedShape.vertices[idxMovedVertex];

    movedVertex.x = x;
    movedVertex.y = y;

    renderer.redraw(this.state, this.gl, this.elmts);
  }

  onMouseUp(event: MouseEvent) {
    this.state.featureState.clear();
  }
}

class ChangeColorVertexHandler implements FeatureHandler {
  private elmts: ElementContainer;
  private state: WorldState;
  private gl: WebGLRenderingContext;

  constructor(
    elmts: ElementContainer,
    state: WorldState,
    gl: WebGLRenderingContext
  ) {
    this.elmts = elmts;
    this.state = state;
    this.gl = gl;
  }

  onMouseDown(event: MouseEvent) {
    const x = (event.offsetX / this.elmts.canvas.clientWidth) * 2 - 1;
    const y = (1 - event.offsetY / this.elmts.canvas.clientHeight) * 2 - 1;

    const shapeVertex = findShapeAndVertex(x, y, this.state);
    console.log(shapeVertex);
    console.log("this.state", this.state);
    console.log("x", x, "y", y);

    if (!shapeVertex) {
      return;
    }

    const vertex = shapeVertex.shape.vertices[shapeVertex.idxVertex];
    vertex.changeColor(Color.fromHex(this.elmts.color_picker.value));
    renderer.redraw(this.state, this.gl, this.elmts);
  }

  onMouseMove(event: MouseEvent) {
  }

  onMouseUp(event: MouseEvent) {
    this.state.featureState.clear();
  }
}

class LockingVertexPositionHandler implements FeatureHandler{
  private elmts: ElementContainer;
  private state: WorldState;
  private gl: WebGLRenderingContext;

  constructor(
    elmts: ElementContainer,
    state: WorldState,
    gl: WebGLRenderingContext
  ) {
    this.elmts = elmts;
    this.state = state;
    this.gl = gl;
  }

  onMouseDown(event: MouseEvent) {
    const x = (event.offsetX / this.elmts.canvas.clientWidth) * 2 - 1;
    const y = (1 - event.offsetY / this.elmts.canvas.clientHeight) * 2 - 1;

    const shapeVertex = findShapeAndVertex(x, y, this.state);
    console.log(shapeVertex);
    console.log("this.state", this.state);
    console.log("x", x, "y", y);

    if (!shapeVertex) {
      return;
    }

    const vertex = shapeVertex.shape.vertices[shapeVertex.idxVertex];
    vertex.lockUnlockPosition();
    renderer.redraw(this.state, this.gl, this.elmts);
  }

  onMouseMove(event: MouseEvent) {
  }

  onMouseUp(event: MouseEvent) {
    this.state.featureState.clear();
  } 
}

class LockingVertexColorHandler implements FeatureHandler {
  private elmts: ElementContainer;
  private state: WorldState;
  private gl: WebGLRenderingContext;

  constructor(
    elmts: ElementContainer,
    state: WorldState,
    gl: WebGLRenderingContext
  ) {
    this.elmts = elmts;
    this.state = state;
    this.gl = gl;
  }

  onMouseDown(event: MouseEvent) {
    const x = (event.offsetX / this.elmts.canvas.clientWidth) * 2 - 1;
    const y = (1 - event.offsetY / this.elmts.canvas.clientHeight) * 2 - 1;

    const shapeVertex = findShapeAndVertex(x, y, this.state);
    console.log(shapeVertex);
    console.log("this.state", this.state);
    console.log("x", x, "y", y);

    if (!shapeVertex) {
      return;
    }

    const vertex = shapeVertex.shape.vertices[shapeVertex.idxVertex];
    vertex.lockUnlockColor();
    renderer.redraw(this.state, this.gl, this.elmts);
  }

  onMouseMove(event: MouseEvent) {}

  onMouseUp(event: MouseEvent) {
    this.state.featureState.clear();
  }
}

class RotateShapeHandler implements FeatureHandler {
  private elmts: ElementContainer;
  private state: WorldState;
  private gl: WebGLRenderingContext;

  constructor(
    elmts: ElementContainer,
    state: WorldState,
    gl: WebGLRenderingContext
  ) {
    this.elmts = elmts;
    this.state = state;
    this.gl = gl;
  }

  onMouseDown(event: MouseEvent) {
    const x = (event.offsetX / this.elmts.canvas.clientWidth) * 2 - 1;
    const y = (1 - event.offsetY / this.elmts.canvas.clientHeight) * 2 - 1;

    const shapeVertex = findShapeAndVertex(x, y, this.state);
    console.log(shapeVertex);
    console.log("this.state", this.state);
    console.log("x", x, "y", y);

    if (!shapeVertex) {
      return;
    }

    this.state.featureState.selected_shape = shapeVertex.shape;
    this.state.featureState.idxVertex = shapeVertex.idxVertex;
  }

  onMouseMove(event: MouseEvent) {
    const x = (event.offsetX / this.elmts.canvas.clientWidth) * 2 - 1;
    const y = (1 - event.offsetY / this.elmts.canvas.clientHeight) * 2 - 1;

    const movedShape = this.state.featureState.selected_shape;
    const idxMovedVertex = this.state.featureState.idxVertex;

    if (movedShape === null || idxMovedVertex === null) {
      return;
    }

    const vertex = movedShape.vertices[idxMovedVertex];
    const center = movedShape.centerPoint;

    const angle = findAngle({
      x, y
    }, {
      x: vertex.x,
      y: vertex.y,
    }, {
      x: center.x,
      y: center.y,
    });

    const flagClockwise = this.elmts.rotateClockwiseBtn.checked ? -1 : 1;
    const angleDeg = (flagClockwise * (angle * 180)) / Math.PI / BUMPER_ROTATOR;
    movedShape.rotate(angleDeg);
    renderer.redraw(this.state, this.gl, this.elmts);
  }

  onMouseUp(event: MouseEvent) {
    this.state.featureState.clear();
  }
}

class ShearHandler implements FeatureHandler {
  private elmts: ElementContainer;
  private state: WorldState;
  private gl: WebGLRenderingContext;

  constructor(
    elmts: ElementContainer,
    state: WorldState,
    gl: WebGLRenderingContext
  ) {
    this.elmts = elmts;
    this.state = state;
    this.gl = gl;
  }

  onMouseDown(event: MouseEvent) {
    const x = (event.offsetX / this.elmts.canvas.clientWidth) * 2 - 1;
    const y = (1 - event.offsetY / this.elmts.canvas.clientHeight) * 2 - 1;

    const shapeVertex = findShapeAndVertex(x, y, this.state);
    console.log("shapeVertex", "shear", shapeVertex);

    if (!shapeVertex) {
      this.state.featureState.clear();
      return;
    }
    
    if (this.state.featureState.selected_shape !== null) {
      if (this.state.featureState.selected_shape !== shapeVertex.shape) {
        alert("You can't shear two shapes at the same time. Clearing the selection state");
        this.state.featureState.clear();
      }

      this.state.featureState.idxRefVertex = shapeVertex.idxVertex;
      return;
    }

    this.state.featureState.selected_shape = shapeVertex.shape;
    this.state.featureState.idxVertex = shapeVertex.idxVertex;
  }

  onMouseMove(event: MouseEvent) {
    const x = (event.offsetX / this.elmts.canvas.clientWidth) * 2 - 1;
    const y = (1 - event.offsetY / this.elmts.canvas.clientHeight) * 2 - 1;

    const movedShape = this.state.featureState.selected_shape;
    const idxMovedVertex = this.state.featureState.idxVertex;
    const idxRefVertex = this.state.featureState.idxRefVertex;

    if (movedShape === null || idxMovedVertex === null || idxRefVertex === null) {
      return;
    }

    const vertex = movedShape.vertices[idxRefVertex];
    const refVertex = movedShape.vertices[idxMovedVertex];

    // const deltaX = x - vertex.x;
    // const deltaY = y - vertex.y;

    // vertex.x = vertex.x + deltaX;
    // vertex.y = vertex.y + deltaY;

    // refVertex.x = refVertex.x + deltaX;
    // refVertex.y = refVertex.y + deltaY;

    const gradien = (vertex.y - refVertex.y) / (vertex.x - refVertex.x);

    console.log("gradien", gradien);

    const deltaX = x - vertex.x;
    const deltaY = y - vertex.y;

    console.log("deltaX", deltaX);
    console.log("deltaY", deltaY);

    if (gradien < EPSILON && gradien > -EPSILON) {
      vertex.x += deltaX;
      refVertex.x += deltaX;
    } else if (gradien > 1 / EPSILON || gradien < -1 / EPSILON) {
      console.log("gradien > 1 / EPSILON");
      vertex.y += deltaY;
      refVertex.y += deltaY;
    }

    renderer.redraw(this.state, this.gl, this.elmts);
  }

  onMouseUp(event: MouseEvent) {
    if (this.state.featureState.idxRefVertex === null && this.state.featureState.selected_shape !== null) {
      return;
    }

    this.state.featureState.clear();
  }
}
