class GlobalVars {
  public readonly gl: WebGLRenderingContext;

  constructor() {
    const canvas = document.getElementById("canvas") as HTMLCanvasElement;
    this.gl = canvas.getContext("webgl") as WebGLRenderingContext;
  }
}

const globalVars = new GlobalVars();
