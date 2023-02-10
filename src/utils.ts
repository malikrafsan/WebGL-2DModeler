// find vertex yang paling deket dengan x_awal dan y_awal yang diassign. Lalu kembalikan indexnya.
function findNearestVertex(x_awal: number, y_awal: number, shape: Shape2D): number {
  let min = 9999;
  let index = 0;
  for (let i = 0; i < shape.vertices.length; i++) {
    let x = shape.vertices[i].x;
    let y = shape.vertices[i].y;
    let jarak = Math.sqrt(Math.pow(x - x_awal, 2) + Math.pow(y - y_awal, 2));
    if (jarak < min) {
      min = jarak;
      index = i;
    }
  }
  return index;
}

function save(shapes: Shape2D[], filename: string) {
  // Membuat data
  let data = shapes.map((el) => {
    return {
      shape: el.constructor.name,
      vertices: el,
    };
  });
  // Download data
  let blob = new Blob([JSON.stringify(data)], { type: "text/plain;charset=utf-8" });
  let a = document.createElement("a"),
    url = URL.createObjectURL(blob);
  a.href = url;
  a.download = filename;
  a.click();
}
