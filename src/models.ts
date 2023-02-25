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

  static fromHex(hex: string): Color {
    const r = parseInt(hex.substring(1, 3), 16);
    const g = parseInt(hex.substring(3, 5), 16);
    const b = parseInt(hex.substring(5, 7), 16);

    return new Color(r, g, b);
  }
}

class Vertex {
  protected static counter: number = 0;

  public x: number;
  public y: number;
  public c: Color;
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
  public vertices: Vertex[];
  protected id: number;
  protected gl: WebGLRenderingContext;
  protected shapeType: SHAPE_TYPES;
  protected filled: boolean;

  constructor(vertices: Vertex[], gl: WebGLRenderingContext, shapeType: SHAPE_TYPES, filled: boolean) {
    this.id = Shape2D.counter++;
    this.vertices = vertices;
    this.gl = gl;
    this.shapeType = shapeType;
    this.filled = filled;
  }

  protected materialize(glShape: number): void {
    const flatVertices = this.vertices.map((v) => {
      return v.toArray();
    });

    let temp = [];
    for (let i = 0; i < flatVertices.length; i++) {
      temp.push(...flatVertices[i]);
    }

    const array = new Float32Array(temp);

    this.gl.bufferData(this.gl.ARRAY_BUFFER, array, this.gl.STATIC_DRAW);
    this.gl.drawArrays(glShape, 0, this.vertices.length);
  }

  draw() {
    throw new Error("Method not implemented.");
  }
}

class Square extends Shape2D {
  constructor(vertices: Vertex[], gl: WebGLRenderingContext, filled: boolean) {
    if (vertices.length !== 4) {
      throw new Error("A square must have 4 vertices.");
    }
    super(vertices, gl, SHAPE_TYPE.PERSEGI, filled);
  }

  draw() {
    this.materialize(this.filled ? this.gl.TRIANGLE_FAN : this.gl.LINE_LOOP);
  }
}

class Line extends Shape2D {
  constructor(vertices: Vertex[], gl: WebGLRenderingContext, filled: boolean) {
    if (vertices.length !== 2) {
      throw new Error("A line must have 1 vertices.");
    }
    super(vertices, gl, SHAPE_TYPE.GARIS, filled);
  }

  draw() {
    this.materialize(this.gl.LINES);
  }
}

class Polygon extends Shape2D {
  constructor(vertices: Vertex[], gl: WebGLRenderingContext, filled: boolean) {
    if (vertices.length < 3) {
      throw new Error("A polygon must have more than 3 vertices.");
    }
    super(vertices, gl, SHAPE_TYPE.POLIGON, filled);
  }

  draw() {
    this.materialize(this.filled ? this.gl.TRIANGLE_FAN : this.gl.LINE_LOOP);
  }

  orientation(p: Vertex, q: Vertex, r: Vertex) {
    let nilai = (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);
    if (nilai == 0) {
      return 0;
    } else {
      return nilai > 0 ? 1 : 2;
    }
  }

  convexHull() {
    if (this.vertices.length < 3) {
      return;
    }

    let hull = [];
    let l = 0;

    for (let i = 1; i < this.vertices.length; i++) {
      if (this.vertices[i].x < this.vertices[l].x) {
        l = i;
      }
    }
    let p = l,
      q;
    do {
      hull.push(this.vertices[p]);
      q = (p + 1) % this.vertices.length;
      for (let i = 0; i < this.vertices.length; i++) {
        if (this.orientation(this.vertices[p], this.vertices[i], this.vertices[q]) == 2) {
          q = i;
        }
      }
      p = q;
    } while (p != l);
    this.vertices = hull;
  }
}

class Circle extends Shape2D {
  constructor(x: number, y: number, gl: WebGLRenderingContext, filled: boolean) {
    var vertexlingkaran: Vertex[] = [];
    let steps = 10;
    let rad = 0.02;
    let numberOfVertices = steps;
    let doublePI = 2 * Math.PI;

    for (var i = 0; i < numberOfVertices; i++) {
      var vertex = new Vertex(x + rad * Math.cos((i * doublePI) / steps), y + rad * Math.sin((i * doublePI) / steps), new Color(20, 20, 20), gl);
      vertexlingkaran.push(vertex);
    }
    super(vertexlingkaran, gl, SHAPE_TYPE.LINGKARAN, filled);
  }

  draw() {
    this.materialize(this.filled ? this.gl.TRIANGLE_FAN : this.gl.LINE_LOOP);
  }
}
