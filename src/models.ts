// import globalVars from "./globals";

class Color {
  protected r: number;
  protected g: number;
  protected b: number;

  constructor(r: number, g: number, b: number) {
    this.r = this.normalizeColor(r);
    this.g = this.normalizeColor(g);
    this.b = this.normalizeColor(b);
  }

  protected normalizeColor(color: number): number {
    let normalizedColor = color;
    if (color > 1.0 || color < 0.0) {
      normalizedColor = color / 255;
    }

    if (normalizedColor > 1.0) {
      return 1.0;
    }

    if (normalizedColor < 0.0) {
      return 0.0;
    }

    return normalizedColor;
  }

  toArray(): number[] {
    return [this.r, this.g, this.b];
  }
}

class Vertex {
  protected static counter: number = 0;

  protected x: number;
  protected y: number;
  protected c: Color;
  protected id: number;
  protected gl: WebGLRenderingContext;

  constructor(x: number, y: number, c: Color, gl: WebGLRenderingContext) {
    this.id = Vertex.counter++;
    this.x = x;
    this.y = y;
    this.c = c;
    this.gl = gl;
  }

  toArray(): number[] {
    return [this.x, this.y, ...this.c.toArray()];
  }
}

class Shape2D {
  protected static counter: number = 0;
  protected vertices: Vertex[];
  protected id: number;
  protected gl: WebGLRenderingContext;

  constructor(vertices: Vertex[], gl: WebGLRenderingContext) {
    this.id = Shape2D.counter++;
    this.vertices = vertices;
    this.gl = gl;
  }

  protected materialize(glShape: number): void {
    const flatVertices = this.vertices
      .map((v) => {
        return v.toArray();
      })
      .flat();
    console.log(flatVertices);

    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      new Float32Array(flatVertices),
      this.gl.STATIC_DRAW
    );
    
    this.gl.drawArrays(glShape, 0, this.vertices.length);
  }

  draw() {
    throw new Error("Method not implemented.");
  }
}

class Square extends Shape2D {
  constructor(vertices: Vertex[], gl: WebGLRenderingContext) {
    if (vertices.length !== 4) {
      throw new Error("A square must have 4 vertices.");
    }
    super(vertices, gl);
  }

  draw() {
    this.materialize(this.gl.TRIANGLE_FAN);
  }
}

// export {
//   Color,
//   Vertex,
//   Shape2D,
//   Square,
// }
