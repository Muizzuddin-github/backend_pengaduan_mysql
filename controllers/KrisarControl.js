import mysqlQuery from "../DB/mysqlQuery.js";

class KrisarControl {
  //admin
  static async getAll(req, res) {
    try {
      const { result } = await mysqlQuery(
        "SELECT kritik_saran.id, kritik_saran.kritik, kritik_saran.saran, kritik_saran.tanggal , users.username, users.email FROM kritik_saran INNER JOIN users ON kritik_saran.fk_user=users.id ORDER BY kritik_saran.tanggal DESC"
      );

      return res.status(200).json({
        status: "OK",
        message: "Data kritik dari user",
        errors: [],
        data: result,
      });
    } catch (err) {
      res.status(500).json({
        status: "Internal Server Error",
        message: "terjadi kesalahan diserver",
        errors: [err.message],
        data: [],
      });
    }
  }

  //user
  static async getAllByUser(req, res) {
    try {
      const { result } = await mysqlQuery(
        "SELECT kritik_saran.id, kritik_saran.kritik, kritik_saran.saran, kritik_saran.tanggal , users.username, users.email FROM kritik_saran INNER JOIN users ON kritik_saran.fk_user=users.id WHERE users.id = ? ORDER BY kritik_saran.tanggal DESC",
        req.user.id
      );
      return res.status(200).json({
        status: "OK",
        message: "Data kritik dari user",
        errors: [],
        data: result,
      });
    } catch (err) {
      res.status(500).json({
        status: "Internal Server Error",
        message: "terjadi kesalahan diserver",
        errors: [err.message],
        data: [],
      });
    }
  }

  static async post(req, res) {
    try {
      const checkContentType = req.is("application/json");
      if (!checkContentType) {
        return res.status(400).json({
          status: "Bad Request",
          message: "terjadi kesalahan diclient",
          errors: ["content type harus application/json"],
          data: [],
        });
      }
      const isiKritik = req.body.kritik;
      const isisaran = req.body.saran;
      await mysqlQuery(
        `INSERT INTO kritik_saran (kritik,saran,fk_user) VALUES(?,?,?)`,
        [isiKritik, isisaran, req.user.id]
      );
      return res.status(200).json({
        status: "OK",
        message: "Berhasil menambahkan data kritik dari user",
        errors: [],
        data: [],
      });
    } catch (err) {
      res.status(500).json({
        status: "Internal Server Error",
        message: "terjadi kesalahan diserver",
        errors: [err.message],
        data: [],
      });
    }
  }
  static async del(req, res) {
    try {
      const idKritik = +req.params.id;
      const { result } = await mysqlQuery(
        `SELECT * FROM kritik_saran WHERE id=${idKritik}`
      );
      // memeriksa kritik & saran ada atau tidak
      if (result.length === 0) {
        return res.status(404).json({
          status: "Not Found",
          message: "Terjadi kesalahan di user",
          errors: ["Kritik & Saran sudah terhapus"],
          data: [],
        });
      }
      await mysqlQuery(`DELETE FROM kritik_saran WHERE id=${idKritik}`);
      return res.status(200).json({
        status: "OK",
        message: "Kritik & Saran berhasil dihapus",
        errors: [],
        data: [],
      });
    } catch (err) {
      res.status(500).json({
        status: "Internal Server Error",
        message: "terjadi kesalahan diserver",
        errors: [err.message],
        data: [],
      });
    }
  }
}
export default KrisarControl;
