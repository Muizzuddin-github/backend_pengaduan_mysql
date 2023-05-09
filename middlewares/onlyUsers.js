import mysqlQuery from "../DB/mysqlQuery.js";
import jwt from "jsonwebtoken";

const onlyUsers = async (req, res, next) => {
  try {
    const accessToken = req.headers.authorization;

    if (!accessToken) {
      throw new Error("butuh access token");
    }

    const [schema, token] = accessToken.split(" ");

    if (schema !== "Bearer") {
      throw new Error("hanya Bearer auth");
    }

    const { id } = jwt.verify(token, process.env.SECRET_ACCESS);

    const { result } = await mysqlQuery(
      "SELECT * FROM users INNER JOIN roles ON users.fk_role=roles.id WHERE users.id = ?",
      id
    );

    if (!result.length) {
      throw new Error("access token tidak valid");
    }

    next();
  } catch (err) {
    return res.status(401).json({
      status: "Unauthorized",
      message: "terjadi kesalahan diclient",
      errors: [err.message],
      data: [],
    });
  }
};

export default onlyUsers;
