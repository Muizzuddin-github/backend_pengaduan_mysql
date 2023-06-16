import mysqlQuery from "../DB/mysqlQuery.js";
import UserValidation from "../validation/UserValidation.js";
import bcryptjs from "bcryptjs";
import Response from "../func/Response.js";

class UsersControl {
  static async getAll(req, res) {
    try {
      const { result } = await mysqlQuery(
        "SELECT users.id,users.username,users.email,roles.role FROM users INNER JOIN roles ON roles.id=users.fk_role"
      );

      return Response.success(res, "semua data users", result);
    } catch (err) {
      return Response.serverError(res, err.message);
    }
  }

  static async post(req, res) {
    try {
      const userVal = new UserValidation(req.body);
      userVal.checkType();

      if (userVal.getErrors.length) {
        return Response.badRequest(res, userVal.getErrors);
      }

      userVal.checkLen();
      userVal.checkIsEmail();

      if (userVal.getErrors.length) {
        return Response.badRequest(res, userVal.getErrors);
      }

      await userVal.checkUniqEmail();

      if (userVal.getErrors.length) {
        return Response.badRequest(res, userVal.getErrors);
      }

      const salt = bcryptjs.genSaltSync(10);
      const hashPassword = bcryptjs.hashSync(userVal.getPassword, salt);

      await mysqlQuery(`INSERT INTO 
                users (
                    username,
                    email,
                    password
                ) VALUES (
                    '${userVal.getUsername}',
                    '${userVal.getEmail}',
                    '${hashPassword}'
                )
            `);

      return Response.created(res, "user berhasil registrasi");
    } catch (err) {
      return Response.serverError(res, err.message);
    }
  }
}

export default UsersControl;
