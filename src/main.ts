let shape: Shape2D[] = []; // Merupakan array untuk menyimpan daftar bentuk yang telah dibuat
let polygon: Vertex[] = []; // Merupakan array untuk menyimpan sisi dari poligon yang telah diklik pengguna
let n_sisi = 1; // Untuk memastikan bahwa pengguna mengklik setidaknya 3 kali untuk membentuk sebuah bangun datar
let is_clicked = false; // Untuk mengetahui apakah pengguna sedang mengklik suatu bangunan atau tidak
let id_clicked = -1; // Untuk mengetahui id bangunan yang sedang diklik
let saver_tranformation_shape: Shape2D | undefined = undefined; // Untuk menyimpan sementara bangunan yang sedang dilakukan translasi atau dilatasi
let clicked_corner = false; // untuk mengetahui jika pengguna mengklik salah satu sudut dari sebuah bangunan
let select_mode = false; // untuk mengetahui apakah pengguna sedang melakukan select mode atau tidak
let selected: Shape2D; // untuk menyimpan shape yang dipilih sudutnya
let counter = 0; // untuk menghilangkan titik pada shape yang diselect

let x_awal = -1; // Kondisi awal sumbu x dimana pengguna mengklik mouse
let y_awal = -1; // Kondisi awal sumbu y dimana pengguna mengklik mouse

const main = () => {
  const elmts = new ElementContainer();

  // WebGL rendering context
  const gl = elmts.canvas.getContext("webgl");

  if (!gl) {
    throw new Error("Unable to initialize WebGL.");
  }

  // Clear color
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  // A user-defined function to create and compile shaders
  const initShader = (type: "VERTEX_SHADER" | "FRAGMENT_SHADER", source: string) => {
    const shader = gl.createShader(gl[type]);

    if (!shader) {
      throw new Error("Unable to create a shader.");
    }

    gl.shaderSource(shader, source);

    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      throw new Error(`An error occurred compiling the shaders: ${gl.getShaderInfoLog(shader)}`);
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
    throw new Error(`Unable to link the shaders: ${gl.getProgramInfoLog(program)}`);
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
  elmts.clear_button.addEventListener("click", function (e) {
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    shape = [];
    polygon = [];
    displayData();
  });

  // Melakukan penghapusan objek terbaru yang telah dibuat
  elmts.pop_button.addEventListener("click", function (e) {
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    shape.pop();
    for (let i = 0; i < shape.length; i++) {
      shape[i].draw();
    }
    displayData();
  });

  // Melakukan hold untuk button select
  elmts.select_button.addEventListener("click", function (e) {
    elmts.select_button?.classList.toggle("active");
    select_mode = !select_mode;
  });

  // Melakukan save data yang telah dibuat
  elmts.save_button?.addEventListener("click", function (e) {
    save(shape, "shape.json");
  });

  // Melakukan load data yang telah disimpan
  elmts.load_button?.addEventListener("click", function (e) {
    let input = document.createElement("input");
    input.type = "file";
    input.hidden = true;
    input.accept = ".json";
    input.click();
    input.onchange = (e) => {
      let file = (<HTMLInputElement>e.target)?.files;
      if (file) {
        let reader = new FileReader();
        reader.readAsText(file[0]);
        reader.onload = function () {
          let result = JSON.parse(reader.result as string);
          // Membuat vertex baru berdasarkan data yang telah disimpan
          let vertex_result = result.map((data: any) => {
            let vertex_data = data.vertices.vertices.map((el: any) => {
              return new Vertex(
                el.x,
                el.y,
                new Color(el.c.r, el.c.g, el.c.b),
                gl
              );
            });
            // Membuat shapes baru berdasarkan bentuk yang telah disimpan
            if (data.shape === "Square") {
              return new Square(vertex_data, gl);
            } else if (data.shape === "Polygon") {
              return new Polygon(vertex_data, gl);
            } else if (data.shape === "Line") {
              return new Line(vertex_data, gl);
            }
          });
          shape = vertex_result;
          displayData();
          redrawShape(gl);
        };
        elmts.file_name_span!.textContent = file[0].name;
      }
    };
  });

  // Fungsi untuk melakukan render ulang data yang hendak ditampilkan pada kiri canvas
  function displayData() {
    const list = document.createDocumentFragment();

    if (elmts.ul_data && elmts.ul_data.lastChild && gl) {
      while (elmts.ul_data.firstChild) {
        elmts.ul_data.removeChild(elmts.ul_data.lastChild);
      }
      shape.map((data, i) => {
        let li = document.createElement("li");
        let body = document.createElement("p");
        body.onclick = function (param) {
          let result = (<HTMLElement>param?.target)?.outerText;
          result = result.slice(10);
          id_clicked = parseInt(result);
          gl.clearColor(0, 0, 0, 0);
          gl.clear(gl.COLOR_BUFFER_BIT);
          for (let i = 0; i < shape.length; i++) {
            if (id_clicked !== i) {
              shape[i].draw();
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

  // Fungsi untuk membuat sebuah shape, fungsi yang diminta adalah
  // Koordinat awal x dan y, koordinat akhir x dan y, gl, serta boolean apakah itu adalah bangunan baru atau hanya temp bangunan
  function createShape(x_awal: number, y_awal: number, x: number, y: number, gl: WebGLRenderingContext, isNewShape: boolean) {
    let type = (<HTMLInputElement>document.getElementById("bentuk"))?.value;
    if (select_mode) {
      if (clicked_corner === true) {
        // find vertex yang paling deket dengan x_awal dan y_awal yang diassign. Lalu kembalikan indexnya.
        let idx_update_shape = shape.indexOf(selected);
        let idx_update_vertex = findNearestVertex(x_awal, y_awal, shape[idx_update_shape]);
        shape[idx_update_shape].vertices[idx_update_vertex].x = x;
        shape[idx_update_shape].vertices[idx_update_vertex].y = y;
        // find vertex yang paling deket dengan x_awal dan y_awal yang diassign. Lalu kembalikan indexnya.
        // Ambill index itu, lalu update vertexnya
        clicked_corner = false;
      }
    } else if (type === "persegipanjang") {
      const vertex = new Vertex(x_awal, y_awal, new Color(20, 20, 20), gl);
      const vertex2 = new Vertex(x_awal, y, new Color(20, 20, 20), gl);
      const vertex3 = new Vertex(x, y, new Color(20, 20, 20), gl);
      const vertex4 = new Vertex(x, y_awal, new Color(20, 20, 20), gl);
      const square = new Square([vertex, vertex2, vertex3, vertex4], gl);
      redrawShape(gl);
      if (isNewShape) {
        shape.push(square);
        displayData();
      } else {
        square.draw();
      }
    } else if (type === "garis") {
      const vertex = new Vertex(x_awal, y_awal, new Color(20, 20, 20), gl);
      const vertex2 = new Vertex(x, y, new Color(20, 20, 20), gl);
      const line = new Line([vertex, vertex2], gl);
      redrawShape(gl);
      if (isNewShape) {
        shape.push(line);
        displayData();
      } else {
        line.draw();
      }
    } else if (type === "persegi") {
      let x_res_index;
      let y_res_index;
      let final_index;

      if (Math.abs(x - x_awal) <= Math.abs(y - y_awal)) {
        final_index = Math.abs(y - y_awal);
      } else {
        final_index = Math.abs(x - x_awal);
      }
      if (x < x_awal) {
        x_res_index = x_awal - final_index;
      } else {
        x_res_index = x_awal + final_index;
      }

      if (y < y_awal) {
        y_res_index = y_awal - final_index;
      } else {
        y_res_index = y_awal + final_index;
      }

      const vertex = new Vertex(x_awal, y_awal, new Color(20, 20, 20), gl);
      const vertex2 = new Vertex(x_awal, y_res_index, new Color(20, 20, 20), gl);
      const vertex3 = new Vertex(x_res_index, y_res_index, new Color(20, 20, 20), gl);
      const vertex4 = new Vertex(x_res_index, y_awal, new Color(20, 20, 20), gl);
      const square = new Square([vertex, vertex2, vertex3, vertex4], gl);
      redrawShape(gl);
      if (isNewShape) {
        shape.push(square);
        displayData();
      } else {
        square.draw();
      }
    }
  }

  // Fungsi untuk melakukan gambar ulang, parameter yang diminta adalah gl
  function redrawShape(gl: WebGLRenderingContext) {
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    for (let i = 0; i < shape.length; i++) {
      shape[i].draw();
    }
  }

  // Fungsi untuk mengakhiri proses penggambaran poligon
  elmts.type_button?.addEventListener("click", function (e) {
    if (elmts.type_button?.value === "poligon") {
      // Jika pengguna memilih poligon
      if (polygon.length > 2) {
        // Memastikan sisi poligon setidaknya 3 sisi
        let poligon = new Polygon(polygon, gl);
        poligon.convexHull();
        shape.push(poligon);
        displayData();
        polygon = [];
        n_sisi = 0;
        redrawShape(gl);
      }
    }
  });

  // Fungsi untuk menggambar poligon dengan menggunakan click click
  elmts.canvas.addEventListener("click", function (e) {
    let type = (<HTMLInputElement>document.getElementById("bentuk"))?.value;
    if (id_clicked === -1) {
      if (type === "poligon") {
        // Memastikan tipe yang dipilih adalah poligon
        let x = (e.offsetX / elmts.canvas.clientWidth) * 2 - 1;
        let y = (1 - e.offsetY / elmts.canvas.clientHeight) * 2 - 1;
        let vertex = new Vertex(x, y, new Color(20, 20, 20), gl); // Menggambar sisi poligon
        polygon.push(vertex); // Mempush sisi ke array berisi daftar sisi poligon
        n_sisi += 1;

        if (n_sisi > 2) {
          // Jika sisi sudah lebih dari dua, dilakukan draw poligon
          let poligon = new Polygon(polygon, gl);
          poligon.convexHull();
          poligon.draw();
        }
      }
    } else {
      // Untuk menandai jika pengguna ingin mengsave hasil transformasi geometri
      if (saver_tranformation_shape) {
        shape[id_clicked] = saver_tranformation_shape;
        id_clicked = -1;
        redrawShape(gl);
      }
    }
  });

  elmts.canvas.addEventListener("mousemove", function (e) {
    let transformasi = (<HTMLInputElement>(
      document.getElementById("transformasi")
    ))?.value;
    let x = (e.offsetX / elmts.canvas.clientWidth) * 2 - 1;
    let y = (1 - e.offsetY / elmts.canvas.clientHeight) * 2 - 1;
    if (select_mode) {
      function matching(shape: Shape2D) {
        return shape.vertices.find((el) => {
          return Math.abs(el.x - x) < 0.01 && Math.abs(el.y - y) < 0.01;
        });
      }
      var findMatch = shape.find(matching);
      if (findMatch && counter === 0) {
        let x = (e.offsetX / elmts.canvas.clientWidth) * 2 - 1;
        let y = (1 - e.offsetY / elmts.canvas.clientHeight) * 2 - 1;
        let lingkaran = new Circle(x, y, gl);
        counter++;
        shape.push(lingkaran);
        redrawShape(gl);
        selected = findMatch;
      } else {
        if (counter !== 0) {
          shape.pop();
          counter--;
          redrawShape(gl);
        }
      }
    } else if (id_clicked === -1 && is_clicked) {
      createShape(x_awal, y_awal, x, y, gl, false);
    } else if (id_clicked !== -1) {
      // Fungsi untuk dilatasi dan translasi
      let shape_clicked = shape[id_clicked];
      let min_jarak_x = 2;
      let min_jarak_y = 2;
      let min_jarak_y_dil = 2;
      let smallest_x = 2;
      let smallest_y = 2;
      let biggest_x = -2;
      let biggest_y = -2;

      // Mencari data-data yang dibutuhkan
      for (let i = 0; i < shape_clicked.vertices.length; i++) {
        min_jarak_x = Math.min(min_jarak_x, shape_clicked.vertices[i].x - x);
        min_jarak_y = Math.min(min_jarak_y, shape_clicked.vertices[i].y - y);
        min_jarak_y_dil = Math.min(
          min_jarak_y_dil,
          y - shape_clicked.vertices[i].y
        );
        smallest_x = Math.min(smallest_x, shape_clicked.vertices[i].x);
        smallest_y = Math.min(smallest_y, shape_clicked.vertices[i].y);
        biggest_x = Math.max(biggest_x, shape_clicked.vertices[i].x);
        biggest_y = Math.max(biggest_y, shape_clicked.vertices[i].y);
      }

      // Perhitungan untuk persen dilatasi
      let persen_y =
        (Math.max(min_jarak_y_dil, min_jarak_y) +
          Math.abs(biggest_y - smallest_y)) /
        Math.abs(biggest_y - smallest_y);
      persen_y = Math.min(persen_y, 1.1);

      // Proses transformasi geometri
      for (let i = 0; i < shape_clicked.vertices.length; i++) {
        if (transformasi === "translasi") {
          shape_clicked.vertices[i].x =
            shape_clicked.vertices[i].x - min_jarak_x;
          shape_clicked.vertices[i].y =
            shape_clicked.vertices[i].y - min_jarak_y;
        } else if (transformasi === "dilatasi") {
          shape_clicked.vertices[i].x = shape_clicked.vertices[i].x * persen_y;
          shape_clicked.vertices[i].y = shape_clicked.vertices[i].y * persen_y;
        }
      }
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      for (let i = 0; i < shape.length; i++) {
        if (i !== id_clicked) {
          shape[i].draw();
        }
      }
      shape_clicked.draw();
      saver_tranformation_shape = shape_clicked;
    }
  });

  // Fungsi untuk menggambar bentuk dengan menggunakan drag, disini untuk pertama kali melakukan klik
  elmts.canvas.addEventListener("mousedown", function (e) {
    let x = (e.offsetX / elmts.canvas.clientWidth) * 2 - 1;
    let y = (1 - e.offsetY / elmts.canvas.clientHeight) * 2 - 1;
    x_awal = x; // Menyimpan posisi awal x
    y_awal = y; // Menyimpan posisi awal y
    is_clicked = true;
    if (select_mode) {
      if (counter !== 0) {
        clicked_corner = true;
      }
    }
  });

  // Fungsi untuk menggambar bentuk dengan menggunakan drag, disini untuk terakhir kali menahan mouse (membangun bentuk)
  elmts.canvas.addEventListener("mouseup", function (e) {
    is_clicked = false;
    let x = (e.offsetX / elmts.canvas.clientWidth) * 2 - 1;
    let y = (1 - e.offsetY / elmts.canvas.clientHeight) * 2 - 1;

    // Membangun berdasarkan tipe yang telah didefinisikan sebelumnya
    if (id_clicked === -1) {
      createShape(x_awal, y_awal, x, y, gl, true);

      // Bagian untuk menghapus isi canvas dan melakukan draw ulang semua bentuk yang disimpan pada array shape
      redrawShape(gl);
    }
  });
};
window.onload = main;
