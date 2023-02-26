// GLOBAL VARIABLES / SINGLETONS
const renderer = new Renderer();

// Fungsi untuk membuat sebuah shape, fungsi yang diminta adalah
// Koordinat awal x dan y, koordinat akhir x dan y, gl, serta boolean apakah itu adalah bangunan baru atau hanya temp bangunan
const createShape = (x_awal: number, y_awal: number, x: number, y: number, gl: WebGLRenderingContext, isNewShape: boolean, elmts: ElementContainer, state: WorldState) => {
  let type = (<HTMLInputElement>document.getElementById("bentuk"))?.value;
  if (state.select_mode) {
    if (state.clicked_corner === true && state.selected) {
      // find vertex yang paling deket dengan x_awal dan y_awal yang diassign. Lalu kembalikan indexnya.
      let idx_update_shape = state.shape.indexOf(state.selected);
      let idx_update_vertex = findNearestVertex(x_awal, y_awal, state.shape[idx_update_shape]);
      state.shape[idx_update_shape].vertices[idx_update_vertex].x = x;
      state.shape[idx_update_shape].vertices[idx_update_vertex].y = y;
      // find vertex yang paling deket dengan x_awal dan y_awal yang diassign. Lalu kembalikan indexnya.
      // Ambill index itu, lalu update vertexnya
      state.clicked_corner = false;
    }
  } else if (type === SHAPE_TYPE.PERSEGI_PANJANG) {
    const vertex = new Vertex(x_awal, y_awal, Color.fromHex(elmts.color_picker.value), gl);
    const vertex2 = new Vertex(x_awal, y, Color.fromHex(elmts.color_picker.value), gl);
    const vertex3 = new Vertex(x, y, Color.fromHex(elmts.color_picker.value), gl);
    const vertex4 = new Vertex(x, y_awal, Color.fromHex(elmts.color_picker.value), gl);
    const square = new Rectangle([vertex, vertex2, vertex3, vertex4], gl, elmts.fill_btn.checked);

    renderer.redraw(state, gl);
    if (isNewShape) {
      state.shape.push(square);
      renderer.render(elmts, state, gl);
    } else {
      square.draw();
    }
  } else if (type === SHAPE_TYPE.GARIS) {
    const vertex = new Vertex(x_awal, y_awal, Color.fromHex(elmts.color_picker.value), gl);
    const vertex2 = new Vertex(x, y, Color.fromHex(elmts.color_picker.value), gl);
    const line = new Line([vertex, vertex2], gl, elmts.fill_btn.checked);
    renderer.redraw(state, gl);
    if (isNewShape) {
      state.shape.push(line);
      renderer.render(elmts, state, gl);
    } else {
      line.draw();
    }
  } else if (type === SHAPE_TYPE.PERSEGI) {
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

    const vertex = new Vertex(x_awal, y_awal, Color.fromHex(elmts.color_picker.value), gl);
    const vertex2 = new Vertex(x_awal, y_res_index, Color.fromHex(elmts.color_picker.value), gl);
    const vertex3 = new Vertex(x_res_index, y_res_index, Color.fromHex(elmts.color_picker.value), gl);
    const vertex4 = new Vertex(x_res_index, y_awal, Color.fromHex(elmts.color_picker.value), gl);
    const square = new Square([vertex, vertex2, vertex3, vertex4], gl, elmts.fill_btn.checked);
    renderer.redraw(state, gl);
    if (isNewShape) {
      state.shape.push(square);
      renderer.render(elmts, state, gl);
    } else {
      square.draw();
    }
  }
};

const initListener = (state: WorldState, elmts: ElementContainer, gl: WebGLRenderingContext, handler: Handler) => {
  // Melakukan penghapusan seluruh objek yang telah dibuat
  elmts.clear_button.addEventListener("click", function (e) {
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    state.shape = [];
    state.polygon = [];
    renderer.render(elmts, state, gl);
  });

  // Melakukan penghapusan objek terbaru yang telah dibuat
  elmts.pop_button.addEventListener("click", function (e) {
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    state.shape.pop();
    for (let i = 0; i < state.shape.length; i++) {
      state.shape[i].draw();
    }
    renderer.render(elmts, state, gl);
  });

  // Melakukan hold untuk button select
  elmts.select_button.addEventListener("click", function (e) {
    elmts.select_button?.classList.toggle("active");
    state.select_mode = !state.select_mode;
  });

  // Melakukan save data yang telah dibuat
  elmts.save_button?.addEventListener("click", function (e) {
    save(state.shape, "shape.json");
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
            let vertex_data = data.vertices.map((el: any) => {
              return new Vertex(el.x, el.y, new Color(el.c.r, el.c.g, el.c.b), gl);
            });
            // Membuat shapes baru berdasarkan bentuk yang telah disimpan
            if (data.shape === "Square") {
              return new Square(vertex_data, gl, data.filled);
            } else if (data.shape === "Rectangle") {
              return new Rectangle(vertex_data, gl, data.filled);
            } else if (data.shape === "Polygon") {
              return new Polygon(vertex_data, gl, data.filled);
            } else if (data.shape === "Line") {
              return new Line(vertex_data, gl, data.filled);
            }
          });
          state.shape = vertex_result;
          renderer.render(elmts, state, gl);
          renderer.redraw(state, gl);
        };
        elmts.file_name_span!.textContent = file[0].name;
      }
    };
  });

  // Fungsi untuk mengakhiri proses penggambaran poligon
  elmts.type_button.addEventListener("click", function (e) {
    let functionals = <HTMLInputElement>document.getElementById("functionals");
    let button_delete = document.getElementById("polygoncorner_delete");
    let button_add = document.getElementById("polygoncorner_add");
    // Jika pengguna memilih poligon
    if (state.polygon.length > 2) {
      // Memastikan sisi poligon setidaknya 3 sisi
      let poligon = new Polygon(state.polygon, gl, elmts.fill_btn.checked);
      poligon.convexHull();
      state.shape.push(poligon);
      renderer.render(elmts, state, gl);
      state.polygon = [];
      state.n_sisi = 0;
      renderer.redraw(state, gl);
    }
    if (elmts.type_button.value === SHAPE_TYPE.POLIGON) {
      // menambahkan button untuk bantu proses penggambaran ke dokumen html
      if (!document.getElementById("polygoncorner_delete")) {
        let button_delete = document.createElement("button");
        let button_add = document.createElement("button");

        button_delete.id = "polygoncorner_delete";
        button_delete.textContent = "Delete Corner Polygon";
        button_delete.className = "grid-item spacing toggling";

        button_add.id = "polygoncorner_add";
        button_add.textContent = "Add Corner Polygon";
        button_add.className = "grid-item spacing toggling";

        button_delete.addEventListener("click", function (e) {
          state.delete_selected = !state.delete_selected;
          button_delete?.classList.toggle("active");
          if (state.add_selected) {
            button_add.click();
          }
          if (state.polygon.length > 2) {
            // Memastikan sisi poligon setidaknya 3 sisi
            let poligon = new Polygon(state.polygon, gl, elmts.fill_btn.checked);
            poligon.convexHull();
            state.shape.push(poligon);
            renderer.render(elmts, state, gl);
            state.polygon = [];
            state.n_sisi = 0;
            renderer.redraw(state, gl);
          } else {
            state.polygon = [];
          }
        });

        button_add.addEventListener("click", function (e) {
          state.add_selected = !state.add_selected;
          button_add?.classList.toggle("active");
          if (state.delete_selected) {
            button_delete.click();
          }
          if (state.polygon.length > 2) {
            // Memastikan sisi poligon setidaknya 3 sisi
            let poligon = new Polygon(state.polygon, gl, elmts.fill_btn.checked);
            poligon.convexHull();
            state.shape.push(poligon);
            renderer.render(elmts, state, gl);
            state.polygon = [];
            state.n_sisi = 0;
            renderer.redraw(state, gl);
          } else {
            state.polygon = [];
          }
        });
        functionals.appendChild(button_delete);
        functionals.appendChild(button_add);
      }
    } else {
      // Menghapus button yang telah dibuat
      let parent_button = button_delete?.parentElement;
      if (!!button_delete) {
        setTimeout(function () {
          parent_button?.removeChild(button_add!!);
          parent_button?.removeChild(button_delete!!);
        }, 5);
      }
      state.add_selected = false;
      state.delete_selected = false;
    }
  });

  // Fungsi untuk menggambar poligon dengan menggunakan click click
  elmts.canvas.addEventListener("click", function (e) {
    switch (elmts.featureModeSelect.value) {
      case FEATURE_MODES.ConstraintMoveVertex:
        return;
      case FEATURE_MODES.FreeMoveVertex:
        return;
      case FEATURE_MODES.ChangeColorVertex:
        return;
      case FEATURE_MODES.ChangeColorShape:
        return;
      case FEATURE_MODES.LockingVertexPosition:
        return;
      case FEATURE_MODES.LockingVertexColor:
        return;
      case FEATURE_MODES.RotateShape:
        return;
      case FEATURE_MODES.Shear:
        return;
    }

    let type = (<HTMLInputElement>document.getElementById("bentuk"))?.value;

    let x = (e.offsetX / elmts.canvas.clientWidth) * 2 - 1;
    let y = (1 - e.offsetY / elmts.canvas.clientHeight) * 2 - 1;
    const found = findVertex(x, y, state);
    if (!!found) {
      state.selected = found.shape;
    }

    if (state.id_clicked === -1) {
      if (type === "poligon") {
        // Memastikan tipe yang dipilih adalah poligon

        if (state.delete_selected == true && state.selected instanceof Polygon) {
          // Jika pengguna ingin menghapus sisi poligon
          const found = findVertex(x, y, state);
          // if my cursor on that polygon then execute this
          if (!!found) {
            state.selected.vertices.splice(state.selected.vertices.indexOf(found.vertex), 1);
            if (state.selected.vertices.length < 3) {
              state.shape.splice(state.shape.indexOf(state.selected), 1);
              renderer.render(elmts, state, gl);
            }
            renderer.redraw(state, gl);
          }
        } else if (state.add_selected == true && state.polygon.length == 0) {
          let polygon_shape = filterShape(state, "Polygon");
          if (polygon_shape.length > 0 && !!polygon_shape) {
            const found_nearest = findNearestVertexShapes(x, y, polygon_shape);
            if (found_nearest) {
              const nearest_position = findClosestPairVertexByIndex(found_nearest.vertex_index, found_nearest.shape);
              if (nearest_position?.vertex1 != null && nearest_position?.vertex2 != null) {
                let newPoligon = [];
                if (nearest_position.vertex2 - nearest_position.vertex1 === 1) {
                  for (let i = 0; i < found_nearest.shape.vertices.length; i++) {
                    newPoligon.push(new Vertex(found_nearest.shape.vertices[i].x, found_nearest.shape.vertices[i].y, found_nearest.shape.vertices[i].c, gl));
                    if (i === nearest_position.vertex1) {
                      newPoligon.push(new Vertex(x, y, Color.fromHex(elmts.color_picker.value), gl));
                    }
                  }
                } else {
                  for (let i = 0; i < found_nearest.shape.vertices.length; i++) {
                    newPoligon.push(new Vertex(found_nearest.shape.vertices[i].x, found_nearest.shape.vertices[i].y, found_nearest.shape.vertices[i].c, gl));
                    if (i === nearest_position.vertex2) {
                      newPoligon.push(new Vertex(x, y, Color.fromHex(elmts.color_picker.value), gl));
                    }
                  }
                }
                let poligon = new Polygon(newPoligon, gl, elmts.fill_btn.checked);
                poligon.convexHull();
                state.shape.splice(state.shape.indexOf(found_nearest.shape), 1);
                state.shape.push(poligon);
                renderer.render(elmts, state, gl);
                renderer.redraw(state, gl);
              }
            }
          }
        } else {
          let vertex = new Vertex(x, y, Color.fromHex(elmts.color_picker.value), gl); // Menggambar sisi poligon
          state.polygon.push(vertex); // Mempush sisi ke array berisi daftar sisi poligon
          state.n_sisi += 1;
          if (state.n_sisi > 2) {
            // Jika sisi sudah lebih dari dua, dilakukan draw poligon
            let poligon = new Polygon(state.polygon, gl, elmts.fill_btn.checked);
            poligon.convexHull();
            poligon.draw();
          }
        }
      }
    } else {
      // Untuk menandai jika pengguna ingin mengsave hasil transformasi geometri
      if (state.saver_tranformation_shape) {
        state.shape[state.id_clicked] = state.saver_tranformation_shape;
        state.id_clicked = -1;
        renderer.redraw(state, gl);
      }
    }
  });

  elmts.canvas.addEventListener("mousemove", function (e) {
    let x = (e.offsetX / elmts.canvas.clientWidth) * 2 - 1;
    let y = (1 - e.offsetY / elmts.canvas.clientHeight) * 2 - 1;

    const found = findVertex(x, y, state);
    if (!found) {
      elmts.canvas.style.cursor = "default";
      state.circle = null;
      renderer.redraw(state, gl);
    } else {
      elmts.canvas.style.cursor = "pointer";
      const vc = found.vertex.c;

      state.circle = new Circle(x, y, gl, vc.flipColor());
      console.log(state.circle);
      renderer.redraw(state, gl);
    }

    switch (elmts.featureModeSelect.value) {
      case FEATURE_MODES.ConstraintMoveVertex:
        handler.constraintMoveVertex.onMouseMove(e);
        return;
      case FEATURE_MODES.FreeMoveVertex:
        handler.freeMoveVertex.onMouseMove(e);
        return;
      case FEATURE_MODES.ChangeColorVertex:
        handler.changeColorVertex.onMouseMove(e);
        return;
      case FEATURE_MODES.ChangeColorShape:
        handler.changeColorVertex.onMouseMove(e);
        return;
      case FEATURE_MODES.LockingVertexPosition:
        handler.lockingVertexPosition.onMouseMove(e);
        return;
      case FEATURE_MODES.LockingVertexColor:
        handler.lockingVertexColor.onMouseMove(e);
        return;
      case FEATURE_MODES.RotateShape:
        handler.rotateShape.onMouseMove(e);
        return;
      case FEATURE_MODES.Shear:
        handler.shear.onMouseMove(e);
        return;
    }

    if (state.add_selected || state.delete_selected) {
      const found = findVertex(x, y, state);
      if (!found) {
        elmts.canvas.style.cursor = "default";
      } else {
        elmts.canvas.style.cursor = "pointer";
      }
    }

    if (state.select_mode) {
      function matching(shape: Shape2D) {
        return shape.vertices.find((el) => {
          return Math.abs(el.x - x) < NEAR_POINT_THRESHOLD && Math.abs(el.y - y) < NEAR_POINT_THRESHOLD;
        });
      }
      var findMatch = state.shape.find(matching);
      if (findMatch && state.counter === 0) {
        let x = (e.offsetX / elmts.canvas.clientWidth) * 2 - 1;
        let y = (1 - e.offsetY / elmts.canvas.clientHeight) * 2 - 1;
        let lingkaran = new Circle(x, y, gl, new Color(0.5, 0.5, 0.5));
        state.counter++;
        state.shape.push(lingkaran);
        renderer.redraw(state, gl);
        state.selected = findMatch;
      } else {
        if (state.counter !== 0) {
          state.shape.pop();
          state.counter--;
          renderer.redraw(state, gl);
        }
      }
    } else if (state.id_clicked === -1 && state.is_clicked) {
      createShape(state.x_awal, state.y_awal, x, y, gl, false, elmts, state);
    } else if (state.id_clicked !== -1 && (elmts.featureModeSelect.value === FEATURE_MODES.Translasi || elmts.featureModeSelect.value === FEATURE_MODES.Dilatasi)) {
      // Fungsi untuk dilatasi dan translasi
      let shape_clicked = state.shape[state.id_clicked];
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
        min_jarak_y_dil = Math.min(min_jarak_y_dil, y - shape_clicked.vertices[i].y);
        smallest_x = Math.min(smallest_x, shape_clicked.vertices[i].x);
        smallest_y = Math.min(smallest_y, shape_clicked.vertices[i].y);
        biggest_x = Math.max(biggest_x, shape_clicked.vertices[i].x);
        biggest_y = Math.max(biggest_y, shape_clicked.vertices[i].y);
      }

      // Perhitungan untuk persen dilatasi
      let persen_y = (Math.max(min_jarak_y_dil, min_jarak_y) + Math.abs(biggest_y - smallest_y)) / Math.abs(biggest_y - smallest_y);
      persen_y = Math.min(persen_y, 1.1);

      // Proses transformasi geometri
      for (let i = 0; i < shape_clicked.vertices.length; i++) {
        if (elmts.featureModeSelect.value === FEATURE_MODES.Translasi) {
          shape_clicked.vertices[i].x = shape_clicked.vertices[i].x - min_jarak_x;
          shape_clicked.vertices[i].y = shape_clicked.vertices[i].y - min_jarak_y;
        } else if (elmts.featureModeSelect.value === FEATURE_MODES.Dilatasi) {
          shape_clicked.vertices[i].x = shape_clicked.vertices[i].x * persen_y;
          shape_clicked.vertices[i].y = shape_clicked.vertices[i].y * persen_y;
        }
      }
      gl.clearColor(1.0, 1.0, 1.0, 1.0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      for (let i = 0; i < state.shape.length; i++) {
        if (i !== state.id_clicked) {
          state.shape[i].draw();
        }
      }
      shape_clicked.draw();
      state.saver_tranformation_shape = shape_clicked;
    }
  });

  // Fungsi untuk menggambar bentuk dengan menggunakan drag, disini untuk pertama kali melakukan klik
  elmts.canvas.addEventListener("mousedown", function (e) {
    switch (elmts.featureModeSelect.value) {
      case FEATURE_MODES.ConstraintMoveVertex:
        handler.constraintMoveVertex.onMouseDown(e);
        return;
      case FEATURE_MODES.FreeMoveVertex:
        handler.freeMoveVertex.onMouseDown(e);
        return;
      case FEATURE_MODES.ChangeColorVertex:
        handler.changeColorVertex.onMouseDown(e);
        return;
      case FEATURE_MODES.ChangeColorShape:
        return;
      case FEATURE_MODES.LockingVertexPosition:
        handler.lockingVertexPosition.onMouseDown(e);
        return;
      case FEATURE_MODES.LockingVertexColor:
        handler.lockingVertexColor.onMouseDown(e);
        return;
      case FEATURE_MODES.RotateShape:
        handler.rotateShape.onMouseDown(e);
        return;
      case FEATURE_MODES.Shear:
        handler.shear.onMouseDown(e);
        return;
    }

    let x = (e.offsetX / elmts.canvas.clientWidth) * 2 - 1;
    let y = (1 - e.offsetY / elmts.canvas.clientHeight) * 2 - 1;
    state.x_awal = x; // Menyimpan posisi awal x
    state.y_awal = y; // Menyimpan posisi awal y
    state.is_clicked = true;
    if (state.select_mode) {
      if (state.counter !== 0) {
        state.clicked_corner = true;
      }
    }
  });

  // Fungsi untuk menggambar bentuk dengan menggunakan drag, disini untuk terakhir kali menahan mouse (membangun bentuk)
  elmts.canvas.addEventListener("mouseup", function (e) {
    switch (elmts.featureModeSelect.value) {
      case FEATURE_MODES.ConstraintMoveVertex:
        handler.constraintMoveVertex.onMouseUp(e);
        return;
      case FEATURE_MODES.FreeMoveVertex:
        handler.freeMoveVertex.onMouseUp(e);
        return;
      case FEATURE_MODES.ChangeColorVertex:
        handler.changeColorVertex.onMouseUp(e);
        return;
      case FEATURE_MODES.ChangeColorShape:
        handler.changeColorVertex.onMouseUp(e);
        return;
      case FEATURE_MODES.LockingVertexPosition:
        handler.lockingVertexPosition.onMouseUp(e);
        return;
      case FEATURE_MODES.LockingVertexColor:
        handler.lockingVertexColor.onMouseUp(e);
        return;
      case FEATURE_MODES.RotateShape:
        handler.rotateShape.onMouseUp(e);
        return;
      case FEATURE_MODES.Shear:
        handler.shear.onMouseUp(e);
        return;
    }

    state.is_clicked = false;
    let x = (e.offsetX / elmts.canvas.clientWidth) * 2 - 1;
    let y = (1 - e.offsetY / elmts.canvas.clientHeight) * 2 - 1;

    // Membangun berdasarkan tipe yang telah didefinisikan sebelumnya
    if (state.id_clicked === -1) {
      createShape(state.x_awal, state.y_awal, x, y, gl, true, elmts, state);

      // Bagian untuk menghapus isi canvas dan melakukan draw ulang semua bentuk yang disimpan pada array shape
      renderer.redraw(state, gl);
    }
  });
};

const main = () => {
  const elmts = new ElementContainer();
  const state = new WorldState();

  const gl = renderer.createGLContext(elmts.canvas);

  const handler = new Handler(elmts, state, gl);

  // Mulai dari sini ke bawah, merupakan bagian yang digunakan untuk fungsionalitas dari index.html
  initListener(state, elmts, gl, handler);
};
window.onload = main;
