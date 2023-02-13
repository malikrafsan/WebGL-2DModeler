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

    this.canvas = canvas;
    this.clear_button = clear_button;
    this.pop_button = pop_button;
    this.type_button = type_button;
    this.ul_data = ul_data;
    this.select_button = select_button;
    this.save_button = save_button;
    this.load_button = load_button;
    this.file_name_span = file_name_span;
  }
}
