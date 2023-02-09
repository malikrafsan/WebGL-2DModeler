// import { Vertex, Color, Square } from "./models";

var sekarang = {
  "shape": "Garis",
  "filled": true,
  "focus": -1,
  "sides": 4,
  "color": "",

  "resize_mode": false,
  "changecolor_mode": false,
  "draw_mode": false,
  "poligon_coordinates": [],

  "origin_x": 0,
  "origin_y": 0,
}

let shape: Shape2D[]  = []; // Merupakan array untuk menyimpan daftar bentuk yang telah dibuat
let polygon: Vertex[] = []; // Merupakan array untuk menyimpan sisi dari poligon yang telah diklik pengguna
let n_sisi = 1; // Untuk memastikan bahwa pengguna mengklik setidaknya 3 kali untuk membentuk sebuah bangun datar
let is_clicked = false;

let x_awal = -1; // Kondisi awal sumbu x dimana pengguna mengklik mouse
let y_awal = -1; // Kondisi awal sumbu y dimana pengguna mengklik mouse


const main = () => {
  // Digunakan untuk mendefinisikan daftar button yang ada
  const canvas = document.querySelector("#canvas");
  const clear_button = document.querySelector("#clear");
  const pop_button = document.querySelector("#pop");
  const type_button = document.querySelector("#bentuk");

  if (!(canvas instanceof HTMLCanvasElement)) {
    throw new Error("No html canvas element.");
  }

  if (!(clear_button instanceof HTMLButtonElement)) {
    throw new Error("No html button element.");
  }

  if (!(pop_button instanceof HTMLButtonElement)) {
    throw new Error("No html button element.");
  }

  // WebGL rendering context
  const gl = canvas.getContext("webgl");

  if (!gl) {
    throw new Error("Unable to initialize WebGL.");
  }

  // Clear color
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  // A user-defined function to create and compile shaders
  const initShader = (
    type: "VERTEX_SHADER" | "FRAGMENT_SHADER",
    source: string
  ) => {
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
  };

  // Vertex shader
  const vertexShader = initShader(
    "VERTEX_SHADER",
    `
    attribute vec4 a_position;

    void main() {
      gl_Position = a_position;
    }
  `
  );

  // Fragment shader
  const fragmentShader = initShader(
    "FRAGMENT_SHADER",
    `
    void main() {
      gl_FragColor = vec4(0, 0, 0, 1);
    }
  `
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

  // Mulai dari sini ke bawah, merupakan bagian yang digunakan untuk fungsionalitas dari index.html

  // Melakukan penghapusan seluruh objek yang telah dibuat
  clear_button.addEventListener('click', function (e) {
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    shape = [];
  })

  // Melakukan penghapusan objek terbaru yang telah dibuat
  pop_button.addEventListener('click', function (e) {
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    shape.pop();
    for(let i = 0; i < shape.length; i++){
      shape[i].draw();
    }
  })

  // Fungsi untuk mengakhiri proses penggambaran poligon
  type_button?.addEventListener('click', function(e) {
    if(type_button?.value === "poligon") { // Jika pengguna memilih poligon
      if(polygon.length > 2) { // Memastikan sisi poligon setidaknya 3 sisi
        let poligon = new Polygon(polygon, gl);
        poligon.convexHull();
        shape.push(poligon);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        polygon = [];
        n_sisi = 0;
        for(let i = 0; i < shape.length; i++){
          shape[i].draw();
        }
      }
    }
  })
  
  // Fungsi untuk menggambar poligon dengan menggunakan click click
  canvas.addEventListener('click', function (e) {
    let type = document.getElementById("bentuk")?.value;

    if(type === "poligon") { // Memastikan tipe yang dipilih adalah poligon
      let x = e.offsetX / canvas.clientWidth * 2 - 1;
      let y = (1 - e.offsetY / canvas.clientHeight) * 2 - 1;
      let vertex = new Vertex(x, y, new Color(20, 20, 20), gl); // Menggambar sisi poligon
      polygon.push(vertex); // Mempush sisi ke array berisi daftar sisi poligon
      n_sisi += 1;

      if(n_sisi > 2) { // Jika sisi sudah lebih dari dua, dilakukan draw poligon
        let poligon = new Polygon(polygon, gl);
        poligon.convexHull();
        poligon.draw();
      }
    }
  });


  canvas.addEventListener('mousemove', function (e) {
    let type = document.getElementById("bentuk")?.value;
    let x = e.offsetX / canvas.clientWidth * 2 - 1;
    let y = (1 - e.offsetY / canvas.clientHeight) * 2 - 1;
    if(is_clicked) {
      if(type === "persegipanjang") {
        const vertex = new Vertex(x_awal, y_awal, new Color(20, 20, 20), gl);
        const vertex2 = new Vertex(x_awal, y, new Color(20, 20, 20), gl);
        const vertex3 = new Vertex(x, y, new Color(20, 20, 20), gl);
        const vertex4 = new Vertex(x, y_awal, new Color(20, 20, 20), gl);
        const square = new Square([vertex, vertex2, vertex3, vertex4], gl);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        for(let i = 0; i < shape.length; i++){
          shape[i].draw();
        }
        square.draw();
      } else if (type === "garis") {
        const vertex = new Vertex(x_awal, y_awal, new Color(20, 20, 20), gl);
        const vertex2 = new Vertex(x, y, new Color(20, 20, 20), gl);
        const line = new Line([vertex, vertex2], gl);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        for(let i = 0; i < shape.length; i++){
          shape[i].draw();
        }
        line.draw();
      } else if (type === "persegi") {
        let x_res_index;
        let y_res_index;
        let final_index;
  
        if(Math.abs(x - x_awal) <= Math.abs(y - y_awal)) {
          final_index = Math.abs(y - y_awal);
        } else {
          final_index = Math.abs(x - x_awal);
        }
        if(x < x_awal) {
          x_res_index = x_awal - final_index;
        } else {
          x_res_index = x_awal + final_index;
        }
  
        if(y < y_awal) {
          y_res_index = y_awal - final_index;
        } else {
          y_res_index = y_awal + final_index;
        }
        
        const vertex = new Vertex(x_awal, y_awal, new Color(20, 20, 20), gl);
        const vertex2 = new Vertex(x_awal, y_res_index, new Color(20, 20, 20), gl);
        const vertex3 = new Vertex(x_res_index, y_res_index, new Color(20, 20, 20), gl);
        const vertex4 = new Vertex(x_res_index, y_awal, new Color(20, 20, 20), gl);
        const square = new Square([vertex, vertex2, vertex3, vertex4], gl);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        for(let i = 0; i < shape.length; i++){
          shape[i].draw();
        }
        square.draw();
      }
    }
  });

  // Fungsi untuk menggambar bentuk dengan menggunakan drag, disini untuk pertama kali melakukan klik
  canvas.addEventListener('mousedown', function (e) {
    let x = e.offsetX / canvas.clientWidth * 2 - 1;
    let y = (1 - e.offsetY / canvas.clientHeight) * 2 - 1;
    x_awal = x; // Menyimpan posisi awal x
    y_awal = y; // Menyimpan posisi awal y
    is_clicked = true;
  });

  // Fungsi untuk menggambar bentuk dengan menggunakan drag, disini untuk terakhir kali menahan mouse (membangun bentuk)
  canvas.addEventListener('mouseup', function (e) {
    is_clicked = false;
    let type = document.getElementById("bentuk")?.value;
    let x = e.offsetX / canvas.clientWidth * 2 - 1;
    let y = (1 - e.offsetY / canvas.clientHeight) * 2 - 1;

    // Membangun berdasarkan tipe yang telah didefinisikan sebelumnya
    if(type === "persegipanjang") {
      const vertex = new Vertex(x_awal, y_awal, new Color(20, 20, 20), gl);
      const vertex2 = new Vertex(x_awal, y, new Color(20, 20, 20), gl);
      const vertex3 = new Vertex(x, y, new Color(20, 20, 20), gl);
      const vertex4 = new Vertex(x, y_awal, new Color(20, 20, 20), gl);
      const square = new Square([vertex, vertex2, vertex3, vertex4], gl);
      shape.push(square)
    } else if (type === "garis") {
      const vertex = new Vertex(x_awal, y_awal, new Color(20, 20, 20), gl);
      const vertex2 = new Vertex(x, y, new Color(20, 20, 20), gl);
      const line = new Line([vertex, vertex2], gl);
      shape.push(line)
    } else if (type === "persegi") {
      let x_res_index;
      let y_res_index;
      let final_index;

      if(Math.abs(x - x_awal) <= Math.abs(y - y_awal)) {
        final_index = Math.abs(y - y_awal);
      } else {
        final_index = Math.abs(x - x_awal);
      }
      if(x < x_awal) {
        x_res_index = x_awal - final_index;
      } else {
        x_res_index = x_awal + final_index;
      }

      if(y < y_awal) {
        y_res_index = y_awal - final_index;
      } else {
        y_res_index = y_awal + final_index;
      }
      
      const vertex = new Vertex(x_awal, y_awal, new Color(20, 20, 20), gl);
      const vertex2 = new Vertex(x_awal, y_res_index, new Color(20, 20, 20), gl);
      const vertex3 = new Vertex(x_res_index, y_res_index, new Color(20, 20, 20), gl);
      const vertex4 = new Vertex(x_res_index, y_awal, new Color(20, 20, 20), gl);
      const square = new Square([vertex, vertex2, vertex3, vertex4], gl);
      shape.push(square)
    }

    // Bagian untuk menghapus isi canvas dan melakukan draw ulang semua bentuk yang disimpan pada array shape
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    for(let i = 0; i < shape.length; i++){
      shape[i].draw();
    }
  }); 
};
window.onload = main;

