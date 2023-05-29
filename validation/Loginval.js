import mysqlQuery from "../DB/mysqlQuery.js";
import bcryptjs from "bcryptjs";

class LoginVal {
  #id = 0;
  #url = 0;
  #email = "";
  #password = "";
  #passwordDB = "";
  #errors = [];

  constructor(user) {
    this.#email = user.email;
    this.#password = user.password;
  }

  get getEmail() {
    return this.#email;
  }

  get getID() {
    return this.#id;
  }

  get getURL() {
    return this.#url;
  }

  checkType() {
    if (typeof this.#email != "string") {
      this.#errors.push("email harus string");
    }
    if (typeof this.#password != "string") {
      this.#errors.push("password harus string");
    }
  }

  async checkEmailExists() {
    const { result } = await mysqlQuery(
      "SELECT * FROM users WHERE email = ?",
      this.#email
    );

    if (result.length) {
      this.#passwordDB = result[0].password;
      this.#id = result[0].id;
      this.#url = result[0].fk_role === 1 ? "/admin" : "/dashboard";
    } else {
      this.#errors.push("email tidak ditemukan");
    }
  }

  checkPassword() {
    if (!bcryptjs.compareSync(this.#password, this.#passwordDB)) {
      this.#errors.push("password tidak cocok");
    }
  }

  get getErrors() {
    return this.#errors;
  }
}

export default LoginVal;
