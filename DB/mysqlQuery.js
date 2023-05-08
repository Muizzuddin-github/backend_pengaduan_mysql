import mysqlConn from "./mysqlConn.js";

const mysqlQuery = (sql, data) => {
  return new Promise((resolve, reject) => {
    mysqlConn.query(sql, data, function (err, result, field) {
      if (err) return reject(err);
      return resolve({ result, field });
    });
  });
};

export default mysqlQuery;
