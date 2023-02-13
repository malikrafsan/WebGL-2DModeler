class Renderer {
  // A user-defined function to create and compile shaders
  private initShader(
    type: "VERTEX_SHADER" | "FRAGMENT_SHADER",
    source: string,
    gl: WebGLRenderingContext
  ) {
    const shader = gl.createShader(gl[type]);

    if (!shader) {
      throw new Error("Unable to create a shader.");
    }

    gl.shaderSource(shader, source);

    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      throw new Error(
        `An error occurred compiling the shaders: ${gl.getShaderInfoLog(
          shader
        )}`
      );
    }

    return shader;
  }

  public createGLContext(canvas: HTMLCanvasElement) {
    // WebGL rendering context
    const gl = canvas.getContext("webgl");

    if (!gl) {
      throw new Error("Unable to initialize WebGL.");
    }

    // Clear color
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Vertex shader
    const vertexShader = this.initShader(
      "VERTEX_SHADER",
      `
    attribute vec4 a_position;

    void main() {
      gl_Position = a_position;
    }
  `,
      gl
    );

    // Fragment shader
    const fragmentShader = this.initShader(
      "FRAGMENT_SHADER",
      `
    void main() {
      gl_FragColor = vec4(0, 0, 0, 1);
    }
  `,
      gl
    );

    // WebGL program
    const program = gl.createProgram();
    if (!program) {
      throw new Error("Unable to create the program.");
    }

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error(
        `Unable to link the shaders: ${gl.getProgramInfoLog(program)}`
      );
    }

    gl.useProgram(program);

    // Vertext buffer
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // const positions = [0, 1, 0.866, -0.5, -0.866, -0.5];
    const positions = [0, 1, 2];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    const index = gl.getAttribLocation(program, "a_position");
    const size = 2;
    const type = gl.FLOAT;
    const normalized = false;
    const stride = 0;
    const offset = 0;
    gl.vertexAttribPointer(index, size, type, normalized, stride, offset);
    gl.enableVertexAttribArray(index);

    return gl;
  }

  // Fungsi untuk melakukan render ulang data yang hendak ditampilkan pada kiri canvas
  public render(
    elmts: ElementContainer,
    state: WorldState,
    gl: WebGLRenderingContext
  ) {
    const list = document.createDocumentFragment();

    if (elmts.ul_data && elmts.ul_data.lastChild && gl) {
      while (elmts.ul_data.firstChild) {
        elmts.ul_data.removeChild(elmts.ul_data.lastChild);
      }
      state.shape.map((data, i) => {
        let li = document.createElement("li");
        let body = document.createElement("p");
        body.onclick = function (param) {
          let result = (<HTMLElement>param?.target)?.outerText;
          result = result.slice(10);
          state.id_clicked = parseInt(result);
          gl.clearColor(0, 0, 0, 0);
          gl.clear(gl.COLOR_BUFFER_BIT);
          for (let i = 0; i < state.shape.length; i++) {
            if (state.id_clicked !== i) {
              state.shape[i].draw();
            }
          }
        };
        body.innerHTML = `Object ke-${i}`;
        li.appendChild(body);
        list.appendChild(li);
      });
      elmts.ul_data.appendChild(list);
    }
  }

  // Fungsi untuk melakukan gambar ulang, parameter yang diminta adalah gl
  public redraw(state: WorldState, gl: WebGLRenderingContext) {
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    for (let i = 0; i < state.shape.length; i++) {
      state.shape[i].draw();
    }
  }
}
