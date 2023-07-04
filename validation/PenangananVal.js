class PenangananVal {
  #deskripsi = "";
  #status = "";
  #errors = [];
  constructor(data) {
    this.#deskripsi = data.deskripsi;
    this.#status = data.status;
  }

  get getDeskripsi() {
    return this.#deskripsi;
  }
  get getStatus() {
    return this.#status;
  }

  checkLen() {
    if (this.#deskripsi.length < 12) {
      this.#errors.push("deskripsi minimal 12 karakter");
    }
  }

  get getErrors() {
    return this.#errors;
  }
}

export default PenangananVal;
