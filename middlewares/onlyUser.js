import mysqlQuery from "../DB/mysqlQuery.js";
import Response from "../func/Response.js";
const onlyUser = async (req, res, next) => {
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

    if (result[0].role !== "User") {
      return Response.forbidden(res, "hanya user yang boleh akses");
    }

    req.user = result[0];

    next();
  } catch (err) {
    return Response.unauthorized(res, err.message);
  }
};

export default onlyUser;
