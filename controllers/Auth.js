import LoginVal from "../validation/Loginval.js";
import jwt from "jsonwebtoken";
import mysqlQuery from "../DB/mysqlQuery.js";
import Response from "../func/Response.js";

class Auth {
  static async login(req, res) {
    try {
      const val = new LoginVal(req.body);

      val.checkType();

      if (val.getErrors.length) {
        return res.status(400).json({
          status: "Bad Request",
          message: "terjadi kesalahan diclient",
          errors: val.getErrors,
          redirctURL: "",
        });
      }

      await val.checkEmailExists();

      if (val.getErrors.length) {
        return res.status(404).json({
          status: "Not Found",
          message: "terjadi kesalahan diclient",
          errors: val.getErrors,
          redirctURL: "",
        });
      }

      val.checkPassword();
      if (val.getErrors.length) {
        return res.status(400).json({
          status: "Bad Request",
          message: "terjadi kesalahan diclient",
          errors: val.getErrors,
          redirctURL: "",
        });
      }

      const token = jwt.sign({ id: val.getID }, process.env.SECRET_TOKEN, {
        expiresIn: "1d",
      });

      await mysqlQuery("UPDATE users SET refresh_token = ? WHERE id = ?", [
        token,
        val.getID,
      ]);

      res.cookie("token", token, {
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 1000,
        secure: false,
      });

      return res.status(200).json({
        status: "OK",
        message: "berhasil login",
        errors: [],
        redirectURL: val.getURL,
      });
    } catch (err) {
      return res.status(500).json({
        status: "Internal Server Error",
        message: "terjadi kesalahan diserver",
        errors: [err.message],
        redirctURL: "",
      });
    }
  }

  static async logout(req, res) {
    try {
      const token = req.cookies.token;

      await mysqlQuery(
        "UPDATE users SET refresh_token = ? WHERE refresh_token = ?",
        [null, token]
      );

      res.clearCookie("token");

      return Response.success(res, "logout berhasil");
    } catch (err) {
      return Response.serverError(res, err.message);
    }
  }
}

export default Auth;
