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

    if (!movedShape || !idxMovedVertex || !idxRefVertex) {
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
      renderer.redraw(this.state, this.gl);
    } else if (movedShape instanceof Line) {
      // TODO: NOT WORKING
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
      renderer.redraw(this.state, this.gl);
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
      renderer.redraw(this.state, this.gl);
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

    if (!movedShape || !idxMovedVertex) {
      return;
    }
    const movedVertex = movedShape.vertices[idxMovedVertex];

    movedVertex.x = x;
    movedVertex.y = y;

    renderer.redraw(this.state, this.gl);
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
    renderer.redraw(this.state, this.gl);
  }

  onMouseMove(event: MouseEvent) {
  }

  onMouseUp(event: MouseEvent) {
    this.state.featureState.clear();
  }
}
