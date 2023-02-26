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

const calculateDist = (x1: number, y1: number, x2: number, y2: number) => {
  return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
};

const findVertex = (x: number, y: number, state: WorldState) => {
  for (let i = 0; i < state.shape.length; i++) {
    for (let j = 0; j < state.shape[i].vertices.length; j++) {
      let x1 = state.shape[i].vertices[j].x;
      let y1 = state.shape[i].vertices[j].y;
      let jarak = calculateDist(x, y, x1, y1);
      if (jarak < 0.05) {
        return {
          shape: state.shape[i],
          vertex: state.shape[i].vertices[j],
        };
      }
    }
  }

  return null;
};

const filterShape = (state: WorldState, shape: string) => {
  state.shape.map((el) => console.log(el.constructor.name));
  let shapes = state.shape.filter((el) => el.constructor.name === shape);
  if (shapes.length > 0) {
    return shapes;
  }
  return [];
};

const findNearestVertexShapes = (x: number, y: number, shape: Shape2D[]) => {
  let min = 9999;
  let index = 0;
  let indexShape = 0;
  for (let i = 0; i < shape.length; i++) {
    for (let j = 0; j < shape[i].vertices.length; j++) {
      let x1 = shape[i].vertices[j].x;
      let y1 = shape[i].vertices[j].y;
      let jarak = calculateDist(x, y, x1, y1);
      if (jarak < min) {
        min = jarak;
        index = j;
        indexShape = i;
      }
    }
  }
  return {
    shape: shape[indexShape],
    vertex_index: index,
  };
};

const findClosestPairVertexByIndex = (index: number, shape: Shape2D) => {
  if (shape.vertices.length === 1) {
    return null;
  } else if (shape.vertices.length === 2) {
    return {
      vertex1: 0,
      vertex2: 1,
    };
  } else if (index == 0) {
    let jarak = calculateDist(shape.vertices[0].x, shape.vertices[0].y, shape.vertices[1].x, shape.vertices[1].y);
    let jarak2 = calculateDist(shape.vertices[0].x, shape.vertices[0].y, shape.vertices[shape.vertices.length - 1].x, shape.vertices[shape.vertices.length - 1].y);
    if (jarak < jarak2) {
      return {
        vertex1: 0,
        vertex2: 1,
      };
    } else {
      return {
        // vertex2 baru
        vertex1: 0,
        vertex2: shape.vertices.length - 1,
      };
    }
  } else if (index == shape.vertices.length - 1) {
    let jarak = calculateDist(shape.vertices[index].x, shape.vertices[index].y, shape.vertices[index - 1].x, shape.vertices[index - 1].y);
    let jarak2 = calculateDist(shape.vertices[index].x, shape.vertices[index].y, shape.vertices[0].x, shape.vertices[0].y);
    if (jarak < jarak2) {
      return {
        // vertex2 baru vertex1
        vertex1: index - 1,
        vertex2: index,
      };
    } else {
      return {
        // vertex1 baru vertex2
        vertex1: 0,
        vertex2: index,
      };
    }
  } else {
    let jarak = calculateDist(shape.vertices[index].x, shape.vertices[index].y, shape.vertices[index + 1].x, shape.vertices[index + 1].y);
    let jarak2 = calculateDist(shape.vertices[index].x, shape.vertices[index].y, shape.vertices[index - 1].x, shape.vertices[index - 1].y);
    if (jarak < jarak2) {
      return {
        // vertex1 baru vertex2
        vertex1: index,
        vertex2: index + 1,
      };
    } else {
      return {
        // vertex2 baru vertex1
        vertex1: index - 1,
        vertex2: index,
      };
    }
  }
};

function save(shapes: Shape2D[], filename: string) {
  // Membuat data
  let data = shapes.map((el) => {
    return {
      shape: el.constructor.name,
      vertices: el.vertices,
      filled: el.filled,
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

const objKey = <T extends Object>(obj: T) => {
  return Object.keys(obj) as (keyof T)[];
};

const findShapeAndVertex = (x: number, y: number, state: WorldState) => {
  for (let i = 0; i < state.shape.length; i++) {
    for (let j = 0; j < state.shape[i].vertices.length; j++) {
      const x1 = state.shape[i].vertices[j].x;
      const y1 = state.shape[i].vertices[j].y;

      if (Math.abs(x-x1) < NEAR_POINT_THRESHOLD
        && Math.abs(y-y1) < NEAR_POINT_THRESHOLD  
      ) {
        return {
          shape: state.shape[i],
          idxVertex: j,
        };
      }
    }
  }

  return null;
};
