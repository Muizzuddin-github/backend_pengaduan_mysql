import mysqlQuery from "../DB/mysqlQuery.js";
import Response from "../func/Response.js";

const onlyAdmin = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      throw new Error("silahkan login terlebih dahulu");
    }

    const { result } = await mysqlQuery(
      "SELECT * FROM users INNER JOIN roles ON users.fk_role=roles.id WHERE refresh_token = ?",
      token
    );

    if (result.length === 0) {
      throw new Error("silahkan login terlebih dahulu");
    }

    if (result[0].role !== "Admin") {
      return Response.forbidden(res, "hanya admin yang boleh akses");
    }

    next();
  } catch (err) {
    return Response.unauthorized(res, err.message);
  }
};

export default onlyAdmin;
