import LoginVal from "../validation/Loginval.js";
import jwt from "jsonwebtoken";
import mysqlQuery from "../DB/mysqlQuery.js";

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
          accessToken: "",
        });
      }

      await val.checkEmailExists();

      if (val.getErrors.length) {
        return res.status(400).json({
          status: "Bad Request",
          message: "terjadi kesalahan diclient",
          errors: val.getErrors,
          accessToken: "",
        });
      }

      val.checkPassword();
      if (val.getErrors.length) {
        return res.status(400).json({
          status: "Bad Request",
          message: "terjadi kesalahan diclient",
          errors: val.getErrors,
          accessToken: "",
        });
      }

      const refreshToken = jwt.sign(
        { id: val.getID },
        process.env.SECRET_REFRESH,
        {
          expiresIn: "1d",
        }
      );
      const accessToken = jwt.sign(
        { id: val.getID },
        process.env.SECRET_ACCESS,
        {
          expiresIn: "10m",
        }
      );

      await mysqlQuery("UPDATE users SET refresh_token = ? WHERE id = ?", [
        refreshToken,
        val.getID,
      ]);

      res.cookie("refresh_token", refreshToken, {
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 1000,
        secure: false,
      });

      return res.status(200).json({
        status: "OK",
        message: "berhasil login",
        errors: [],
        accessToken: accessToken,
        redirctURL: val.getURL,
      });
    } catch (err) {
      return res.status(500).json({
        status: "Internal Server Error",
        message: "terjadi kesalahan diserver",
        errors: [err.message],
        accessToken: "",
        redirctURL: "",
      });
    }
  }
}

export default Auth;
