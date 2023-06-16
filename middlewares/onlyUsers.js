import mysqlQuery from "../DB/mysqlQuery.js";
import Response from "../func/Response.js";

const onlyUsers = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      throw new Error("silahkan login terlebih dahulu");
    }

    const { result } = await mysqlQuery(
      "SELECT users.id, users.username ,users.email, roles.role FROM users INNER JOIN roles ON users.fk_role=roles.id WHERE refresh_token = ?",
      token
    );

    if (result.length === 0) {
      throw new Error("silahkan login terlebih dahulu");
    }

    req.user = result[0];
    next();
  } catch (err) {
    return Response.unauthorized(res, err.message);
  }
};

export default onlyUsers;
