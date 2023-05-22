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
          redirctURL: "",
        });
      }

      await val.checkEmailExists();

      if (val.getErrors.length) {
        return res.status(404).json({
          status: "Not Found",
          message: "terjadi kesalahan diclient",
          errors: val.getErrors,
          accessToken: "",
          redirctURL: "",
        });
      }

      val.checkPassword();
      if (val.getErrors.length) {
        return res.status(400).json({
          status: "Bad Request",
          message: "terjadi kesalahan diclient",
          errors: val.getErrors,
          accessToken: "",
          redirctURL: "",
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

  static async refreshAccessToken(req, res) {
    try {
      const refreshToken = req.cookies.refresh_token;

      if (!refreshToken) {
        return res.status(401).json({
          status: "Unauthorized",
          message: "terjadi kesalahan diserver",
          errors: ["silahkan login terlebih dahulu"],
          accessToken: "",
        });
      }

      const { result } = await mysqlQuery(
        "SELECT * FROM users WHERE refresh_token = ?",
        refreshToken
      );

      if (!result.length) {
        return res.status(401).json({
          status: "Unauthorized",
          message: "terjadi kesalahan diserver",
          errors: ["silahkan login terlebih dahulu"],
          accessToken: "",
        });
      }

      const accessToken = jwt.sign(
        { id: result[0].id },
        process.env.SECRET_ACCESS,
        {
          expiresIn: "1m",
        }
      );

      return res.status(200).json({
        status: "OK",
        message: "access token diberikan",
        errors: [],
        accessToken: accessToken,
      });
    } catch (err) {
      return res.status(500).json({
        status: "OK",
        message: "terjadi kesalahan diserver",
        errors: [err.message],
        accessToken: "",
      });
    }
  }

  static async isLogin(req, res) {
    try {
      const refreshToken = req.cookies.refresh_token;

      if (!refreshToken) {
        return res.status(401).json({
          status: "Unauthorized",
          message: "terjadi kesalahan diserver",
          errors: ["silahkan login terlebih dahulu"],
          data: [],
        });
      }

      const { result } = await mysqlQuery(
        "SELECT users.id,users.username,users.email,roles.role FROM users INNER JOIN roles on roles.id=users.fk_role WHERE refresh_token = ?",
        refreshToken
      );

      if (!result.length) {
        return res.status(401).json({
          status: "Unauthorized",
          message: "terjadi kesalahan diserver",
          errors: ["silahkan login terlebih dahulu"],
          data: [],
        });
      }

      return res.status(200).json({
        status: "OK",
        message: "sudah login",
        errors: [],
        data: result,
      });
    } catch (err) {
      return res.status(500).json({
        status: "OK",
        message: "terjadi kesalahan diserver",
        errors: [err.message],
        data: [],
      });
    }
  }
}

export default Auth;
