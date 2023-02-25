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
    const gl = canvas.getContext("webgl", {
      preserveDrawingBuffer: true,
    });

    if (!gl) {
      throw new Error("Unable to initialize WebGL.");
    }

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

    if (!vertexShader || !fragmentShader) {
      throw new Error("Unable to create the shaders.");
    }

    const vertexShaderConfig = `
      precision mediump float;

      attribute vec2 vertPosition;
      attribute vec3 vertColor;
      varying vec3 fragColor;

      void main() {
        fragColor = vertColor;
        gl_Position = vec4(vertPosition,0.0,1.0);
      }
    `;

    const fragmentShaderConfig = `
      precision mediump float;
      varying vec3 fragColor;

      void main() {
        gl_FragColor = vec4(fragColor, 1.0);
      }
    `;

    gl.shaderSource(vertexShader, vertexShaderConfig);
    gl.shaderSource(fragmentShader, fragmentShaderConfig);

    gl.compileShader(vertexShader);
    gl.compileShader(fragmentShader);

    // WebGL program
    const program = gl.createProgram();
    if (!program) {
      throw new Error("Unable to create the program.");
    }

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.validateProgram(program);

    const vertexBufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferObject);

    const positionAttrLocation = gl.getAttribLocation(program, "vertPosition");
    const colorAttrLocation = gl.getAttribLocation(program, "vertColor");

    gl.vertexAttribPointer(
      positionAttrLocation,
      2,
      gl.FLOAT,
      false,
      5 * Float32Array.BYTES_PER_ELEMENT,
      0
    );

    gl.vertexAttribPointer(
      colorAttrLocation,
      3,
      gl.FLOAT,
      false,
      5 * Float32Array.BYTES_PER_ELEMENT,
      2 * Float32Array.BYTES_PER_ELEMENT
    );
    
    gl.enableVertexAttribArray(positionAttrLocation);
    gl.enableVertexAttribArray(colorAttrLocation);
    gl.useProgram(program);

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
        body.onclick = (param) => {
          let result = (<HTMLElement>param?.target)?.outerText;
          result = result.slice(10);
          state.id_clicked = parseInt(result);
          this.redraw(state, gl);
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
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    for (let i = 0; i < state.shape.length; i++) {
      state.shape[i].draw();
    }
  }
}