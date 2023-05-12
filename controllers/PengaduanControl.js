import mysqlQuery from "../DB/mysqlQuery.js";
import fs from "fs";
import imgParser from "../func/imgParser.js";
import ImgVal from "../validation/ImgVal.js";
import PengaduanVal from "../validation/PengaduanVal.js";
import moveUploadedFile from "../func/moveUploadedFile.js";
import getDirName from "../func/getDirName.js";

class PengaduanControl {
  static async getAll(req, res) {
    try {
      const { result } = await mysqlQuery(
        "SELECT p.id,p.foto,p.lokasi,p.status,p.tanggal,kt.nama,users.username,users.email FROM pengaduan AS p INNER JOIN kategori_pengaduan AS kt ON p.fk_kategori_pengaduan=kt.id INNER JOIN users ON p.fk_user=users.id"
      );

      return res.status(200).json({
        status: "OK",
        message: "semua data pengaduan",
        errors: [],
        data: result,
      });
    } catch (err) {
      return res.status(500).json({
        status: "Internal Server Error",
        message: "terjadi kesalahan diserver",
        errors: [err.message],
        data: [],
      });
    }
  }
  static async getAllByUser(req, res) {
    try {
      const status = ["terkirim", "ditolak", "selesai", "diproses"];
      if (status.includes(req.params.status)) {
        return res.status(400).json({
          status: "Bad Request",
          message: "terjadi kesalahan diclient",
          errors: [],
          data: [],
        });
      }
      const { result } = await mysqlQuery(
        "SELECT * FROM pengaduan AS p INNER JOIN kategori_pengaduan AS kt ON p.fk_kategori_pengaduan=kt.id INNER JOIN users ON p.fk_user=users.id WHERE users.id = ? AND users.status = ?",
        req.userID,
        req.params.status
      );

      return res.status(200).json({
        status: "OK",
        message: "semua data pengaduan",
        errors: [],
        data: result,
      });
    } catch (err) {
      return res.status(500).json({
        status: "Internal Server Error",
        message: "terjadi kesalahan diserver",
        errors: [err.message],
        data: [],
      });
    }
  }

  static async getByid(req, res) {
    try {
      const { result } = await mysqlQuery(
        `SELECT * FROM pengaduan WHERE id = ${req.params.id}`
      );

      if (!result.length) {
        return res.status(404).json({
          status: "Not Found",
          message: "terjadi kesalahan diclient",
          errors: ["pengaduan tidak ditemukan"],
          data: [],
        });
      }

      return res.status(200).json({
        status: "OK",
        message: "semua data pengaduan",
        errors: [],
        data: result,
      });
    } catch (err) {
      return res.status(500).json({
        status: "Internal Server Error",
        message: "terjadi kesalahan diserver",
        errors: [err.message],
        data: [],
      });
    }
  }

  static async post(req, res) {
    try {
      const checkFolder = fs.existsSync("./images");
      if (!checkFolder) {
        fs.mkdirSync("./images");
      }

      const checkContentType = req.is("multipart/form-data");
      if (!checkContentType) {
        return res.status(400).json({
          status: "Bad Request",
          message: "terjadi kesalahan diclient",
          errors: ["content type harus multipart/form-data"],
          data: [],
        });
      }

      const data = await imgParser(req);
      const ubah = JSON.stringify(data);
      const parse = JSON.parse(ubah);

      if (typeof parse.files.foto === "undefined") {
        const keyUp = Object.keys(parse.files)[0];
        if (keyUp) {
          fs.unlinkSync(parse.files[keyUp].filepath);
        }
        return res.status(400).json({
          status: "Bad Request",
          message: "terjadi kesalahan diclient",
          errors: ["harus mengupload foto dengan properti foto"],
          data: [],
        });
      }

      const checkPengaduan = new PengaduanVal(parse.field);
      checkPengaduan.checkType();
      checkPengaduan.checkLen();

      if (checkPengaduan.getErrors().length) {
        fs.unlinkSync(parse.files.foto.filepath);
        return res.status(404).json({
          status: "Bad Request",
          message: "terjadi kesalahan diclient",
          errors: checkPengaduan.getErrors(),
          data: [],
        });
      }

      await checkPengaduan.checkKategori();

      if (checkPengaduan.getErrors().length) {
        fs.unlinkSync(parse.files.foto.filepath);
        return res.status(400).json({
          status: "Bad Request",
          message: "terjadi kesalahan diclient",
          errors: checkPengaduan.getErrors(),
          data: [],
        });
      }

      const checkImg = new ImgVal(parse.files.foto);
      checkImg.checkSize();
      checkImg.checkIsImg();

      if (checkImg.getErrors().length) {
        fs.unlinkSync(parse.files.foto.filepath);
        return res.status(400).json({
          status: "Bad Request",
          message: "terjadi kesalahan diclient",
          errors: checkImg.getErrors(),
          data: [],
        });
      }

      const img = moveUploadedFile(parse.files.foto);
      const imgUrl = `${req.protocol}://${req.headers.host}/public/image/${img}`;

      const sql = `INSERT INTO pengaduan (foto,lokasi,deskripsi,fk_kategori_pengaduan,fk_user) VALUES('${imgUrl}','${
        checkPengaduan.lokasi
      }','${
        checkPengaduan.deskripsi
      }',${+checkPengaduan.kategoriPengaduan},${4})`;

      await mysqlQuery(sql);

      return res.status(201).json({
        status: "Created",
        message: "berhasil menambah pengaduan",
        errors: [],
        data: [],
      });
    } catch (err) {
      return res.status(200).json({
        status: "Internal Server Error",
        message: "terjadi kesalahan diserver",
        errors: [err.message],
        data: [],
      });
    }
  }

  static async del(req, res) {
    try {
      const { result } = await mysqlQuery(
        `SELECT * FROM pengaduan WHERE id = ${req.params.id}`
      );

      if (!result.length) {
        return res.status(404).json({
          status: "Not Found",
          message: "terjadi kesalahan diclient",
          errors: ["pengaduan tidak ditemukan"],
          data: [],
        });
      }

      if (result[0].status !== "terkirim") {
        return res.status(400).json({
          status: "Bad Request",
          message: "terjadi kesalahan diclient",
          errors: ["status selain terkirim pengaduan tidak bisa dihapus"],
          data: [],
        });
      }

      const imgUrl = result[0].foto.split("/");
      const img = imgUrl[imgUrl.length - 1];
      const dirName = getDirName();

      fs.unlinkSync(`${dirName}/images/${img}`);

      await mysqlQuery(`DELETE FROM pengaduan WHERE id = ${req.params.id}`);

      return res.status(200).json({
        status: "OK",
        message: "berhasil dihapus",
        errors: [],
        data: [],
      });
    } catch (err) {
      return res.status(200).json({
        status: "Internal Server Error",
        message: "terjadi kesalahan diserver",
        errors: [err.message],
        data: [],
      });
    }
  }
}

export default PengaduanControl;
