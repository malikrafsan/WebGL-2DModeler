class FeatureState {
  public selected_shape: Shape2D | null = null;
  public idxVertex: number | null = null;
  public idxRefVertex: number | null = null;

  clear() {
    this.selected_shape = null;
    this.idxVertex = null;
    this.idxRefVertex = null;
  }
}

class WorldState {
  public shape: Shape2D[] = []; // Merupakan array untuk menyimpan daftar bentuk yang telah dibuat
  public polygon: Vertex[] = []; // Merupakan array untuk menyimpan sisi dari poligon yang telah diklik pengguna
  public n_sisi = 1; // Untuk memastikan bahwa pengguna mengklik setidaknya 3 kali untuk membentuk sebuah bangun datar
  public is_clicked = false; // Untuk mengetahui apakah pengguna sedang mengklik suatu bangunan atau tidak
  public id_clicked = -1; // Untuk mengetahui id bangunan yang sedang diklik
  public saver_tranformation_shape: Shape2D | undefined = undefined; // Untuk menyimpan sementara bangunan yang sedang dilakukan translasi atau dilatasi
  public clicked_corner = false; // untuk mengetahui jika pengguna mengklik salah satu sudut dari sebuah bangunan
  public select_mode = false; // untuk mengetahui apakah pengguna sedang melakukan select mode atau tidak
  public selected: Shape2D | undefined = undefined; // untuk menyimpan shape yang dipilih sudutnya
  public counter = 0; // untuk menghilangkan titik pada shape yang diselect
  public x_awal = -1;
  public y_awal = -1;
  public delete_selected = false;
  public add_selected = false;
  public featureMode: FEATURE_MODE_TYPES = FEATURE_MODES.General; // untuk mengetahui mode yang sedang aktif
  public featureState: FeatureState = new FeatureState();
}

class ElementContainer {
  public readonly canvas;
  public readonly clear_button;
  public readonly pop_button;
  public readonly type_button;
  public readonly ul_data;
  public readonly select_button;
  public readonly save_button;
  public readonly load_button;
  public readonly file_name_span;
  public readonly fill_btn;
  public readonly color_picker;
  public readonly featureModeSelect;

  constructor() {
    const canvas = document.querySelector("#canvas");
    const clear_button = document.querySelector("#clear");
    const pop_button = document.querySelector("#pop");
    const type_button = <HTMLInputElement>document.querySelector("#bentuk");
    const ul_data = document.querySelector("#card");
    const select_button = document.querySelector("#select");
    const save_button = document.querySelector("#save");
    const load_button = document.querySelector("#load");
    const file_name_span = document.querySelector("#current_file");
    const fill_btn = document.querySelector("#fill");
    const color_picker = document.querySelector("#color_picker");
    const featureModeSelect = document.querySelector("#feature_mode");

    if (!(canvas instanceof HTMLCanvasElement)) {
      throw new Error("No html canvas element.");
    }

    if (!(clear_button instanceof HTMLButtonElement)) {
      throw new Error("No html button element.");
    }

    if (!(pop_button instanceof HTMLButtonElement)) {
      throw new Error("No html button element.");
    }

    if (!(select_button instanceof HTMLButtonElement)) {
      throw new Error("No html button element.");
    }

    if (!(fill_btn instanceof HTMLInputElement)) {
      throw new Error("No html input element.");
    }

    if (!(color_picker instanceof HTMLInputElement)) {
      throw new Error("No html input element.");
    }

    if (!(featureModeSelect instanceof HTMLSelectElement)) {
      throw new Error("No html select element.");
    }

    this.canvas = canvas;
    this.clear_button = clear_button;
    this.pop_button = pop_button;
    this.type_button = type_button;
    this.ul_data = ul_data;
    this.select_button = select_button;
    this.save_button = save_button;
    this.load_button = load_button;
    this.file_name_span = file_name_span;
    this.fill_btn = fill_btn;
    this.color_picker = color_picker;
    this.featureModeSelect = featureModeSelect;

    this.onConstruct();
  }

  private onConstruct() {
    objKey(FEATURE_MODES).forEach((key) => {
      const option = document.createElement("option");
      option.value = key;
      option.innerText = key;
      this.featureModeSelect.appendChild(option);
    });
  }
}

class Handler {
  public readonly constraintMoveVertex: ConstraintMoveVertexHandler;
  public readonly freeMoveVertex: FreeMoveVertexHandler;
  public readonly changeColorVertex: ChangeColorVertexHandler;

  constructor(
    elmts: ElementContainer,
    state: WorldState,
    gl: WebGLRenderingContext
  ) {
    this.constraintMoveVertex = new ConstraintMoveVertexHandler(
      elmts,
      state,
      gl
    );
    this.freeMoveVertex = new FreeMoveVertexHandler(elmts, state, gl);
    this.changeColorVertex = new ChangeColorVertexHandler(elmts, state, gl);
  }
}
