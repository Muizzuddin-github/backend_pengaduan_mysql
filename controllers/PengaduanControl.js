import mysqlQuery from "../DB/mysqlQuery.js";
import imgParser from "../func/imgParser.js";
import ImgVal from "../validation/ImgVal.js";
import PengaduanVal from "../validation/PengaduanVal.js";
import moveUploadedFile from "../func/moveUploadedFile.js";
import getDirName from "../func/getDirName.js";
import fs from "fs/promises";
import checkDir from "../func/checkDir.js";
import Response from "../func/Response.js";

class PengaduanControl {
  static async getAll(req, res) {
    const status = ["terkirim", "ditolak", "selesai", "diproses"];
    try {
      if (!status.includes(req.params.status)) {
        return Response.badRequest(res, "status tidak ada");
      }
      const { result } = await mysqlQuery(
        "SELECT p.id,p.foto,p.lokasi,p.status,p.deskripsi, p.tanggal,kt.nama,users.username,users.email FROM pengaduan AS p INNER JOIN kategori_pengaduan AS kt ON p.fk_kategori_pengaduan=kt.id INNER JOIN users ON p.fk_user=users.id WHERE p.status = ? ORDER BY p.tanggal DESC",
        req.params.status
      );

      return Response.success(res, "semua data pengaduan", result);
    } catch (err) {
      return Response.serverError(res, err.message);
    }
  }
  static async getAllByUser(req, res) {
    try {
      const status = ["terkirim", "ditolak", "selesai", "diproses"];
      if (!status.includes(req.params.status)) {
        return Response.badRequest(res, "status tidak ada");
      }

      const { result } = await mysqlQuery(
        "SELECT p.id,p.foto,p.lokasi,p.deskripsi,p.status,p.tanggal,users.username,users.email,kt.nama FROM pengaduan AS p INNER JOIN kategori_pengaduan AS kt ON p.fk_kategori_pengaduan=kt.id INNER JOIN users ON p.fk_user=users.id WHERE users.id = ? AND p.status = ?",
        [req.user.id, req.params.status]
      );

      return Response.success(res, "semua data pengaduan anda", result);
    } catch (err) {
      return Response.serverError(res, err.message);
    }
  }

  static async getByid(req, res) {
    try {
      const { result } = await mysqlQuery(
        `SELECT p.id,users.username,users.email,p.deskripsi,p.foto,p.lokasi,p.tanggal FROM pengaduan as p INNER JOIN users ON p.fk_user=users.id WHERE p.id = ${req.params.id}`
      );

      if (!result.length) {
        return Response.notFound(res, "pengaduan tidak ditemukan");
      }

      return Response.success(res, "single data pengaduan", result);
    } catch (err) {
      return Response.serverError(res, err.message);
    }
  }

  static async post(req, res) {
    try {
      const checkFolder = await checkDir("./images");
      if (!checkFolder) {
        await fs.mkdir("./images");
      }

      const checkContentType = req.is("multipart/form-data");
      if (!checkContentType) {
        return Response.badRequest(
          res,
          "content type harus multipart/form-data"
        );
      }

      const data = await imgParser(req);
      const ubah = JSON.stringify(data);
      const parse = JSON.parse(ubah);

      if (typeof parse.files.foto === "undefined") {
        const keyUp = Object.keys(parse.files)[0];
        if (keyUp) {
          await fs.unlink(parse.files[keyUp].filepath);
        }
        return Response.badRequest(
          res,
          "harus mengupload foto dengan properti foto"
        );
      }

      const checkPengaduan = new PengaduanVal(parse.field);
      checkPengaduan.checkType();
      checkPengaduan.checkLen();

      if (checkPengaduan.getErrors().length) {
        await fs.unlink(parse.files.foto.filepath);
        return Response.notFound(res, checkPengaduan.getErrors());
      }

      await checkPengaduan.checkKategori();

      if (checkPengaduan.getErrors().length) {
        await fs.unlink(parse.files.foto.filepath);
        return Response.badRequest(res, checkPengaduan.getErrors());
      }

      const checkImg = new ImgVal(parse.files.foto);
      checkImg.checkSize();
      checkImg.checkIsImg();

      if (checkImg.getErrors().length) {
        await fs.unlink(parse.files.foto.filepath);
        return Response.badRequest(res, checkImg.getErrors());
      }

      const img = await moveUploadedFile(parse.files.foto);
      const imgUrl = `${req.protocol}://${req.headers.host}/public/image/${img}`;

      const sql =
        "INSERT INTO pengaduan (foto,lokasi,deskripsi,fk_kategori_pengaduan,fk_user) VALUES(?,?,?,?,?)";

      await mysqlQuery(sql, [
        imgUrl,
        checkPengaduan.lokasi,
        checkPengaduan.deskripsi,
        +checkPengaduan.kategoriPengaduan,
        req.userID,
      ]);

      return Response.created(res, "berhasil menambah pengaduan");
    } catch (err) {
      return Response.serverError(res, err.message);
    }
  }

  static async del(req, res) {
    try {
      const { result } = await mysqlQuery(
        `SELECT * FROM pengaduan WHERE id = ${req.params.id}`
      );

      if (!result.length) {
        return Response.notFound(res, "pengaduan tidak ditemukan");
      }

      if (result[0].status !== "terkirim") {
        return Response.badRequest(
          res,
          "status selain terkirim pengaduan tidak bisa dihapus"
        );
      }

      const imgUrl = result[0].foto.split("/");
      const img = imgUrl[imgUrl.length - 1];
      const dirName = getDirName();

      await fs.unlink(`${dirName}/images/${img}`);

      await mysqlQuery(`DELETE FROM pengaduan WHERE id = ${req.params.id}`);

      return Response.success(res, "berhasil mengahapus pengaduan");
    } catch (err) {
      return Response.serverError(res, err.message);
    }
  }

  static async ubahStatus(req, res) {
    try {
      const status = req.body.status;
      if (status != "diproses") {
        return Response.badRequest(res, "status hanya boleh diproses");
      }

      const { result } = await mysqlQuery(
        "SELECT * FROM pengaduan WHERE id = ? AND status = ?",
        [req.params.id, "terkirim"]
      );

      if (result.length === 0) {
        return Response.notFound(res, "pengaduan tidak ditemukan");
      }

      await mysqlQuery("UPDATE pengaduan SET status = ? WHERE id = ?", [
        status,
        req.params.id,
      ]);

      return Response.success(res, "berhasil mengubah status");
    } catch (err) {
      return Response.serverError(res, err.message);
    }
  }
}

export default PengaduanControl;
