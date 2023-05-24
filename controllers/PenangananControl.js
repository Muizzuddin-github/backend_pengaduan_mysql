import mysqlQuery from "../DB/mysqlQuery.js";
import imgParser from "../func/imgParser.js";
import checkDir from "../func/checkDir.js";
import fs from "fs/promises";
import moveUploadedFile from "../func/moveUploadedFile.js";
import ImgVal from "../validation/ImgVal.js";
import PenangananVal from "../validation/PenangananVal.js";
import getDirName from "../func/getDirName.js";

class PenangananControl {
  static async getAll(req, res) {
    try {
      const { result } = await mysqlQuery(
        "SELECT pen.id,pen.foto_bukti,pen.deskripsi,pen.tanggal,users.username,users.email FROM penanganan as pen INNER JOIN pengaduan as p ON pen.fk_pengaduan=p.id INNER JOIN users ON p.fk_user=users.id WHERE p.status = ?",
        "selesai"
      );

      return res.status(200).json({
        status: "OK",
        message: "semua data penanganan",
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
  static async getAllAdmin(req, res) {
    try {
      const status = ["selesai", "ditolak"];

      if (!status.includes(req.params.status)) {
        return res.status(400).json({
          status: "Bad Request",
          message: "terjadi kesalahan diclient",
          errors: ["status harus selesai atau ditolak"],
          data: [],
        });
      }

      const { result } = await mysqlQuery(
        "SELECT pen.id,pen.foto_bukti,pen.deskripsi,pen.tanggal,users.username,users.email  FROM penanganan as pen INNER JOIN pengaduan as p ON pen.fk_pengaduan=p.id INNER JOIN users ON p.fk_user=users.id WHERE p.status = ?",
        req.params.status
      );

      return res.status(200).json({
        status: "OK",
        message: "semua data penanganan",
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
  static async getAllUser(req, res) {
    try {
      const status = ["selesai", "ditolak"];

      if (!status.includes(req.params.status)) {
        return res.status(400).json({
          status: "Bad Request",
          message: "terjadi kesalahan diclient",
          errors: ["status harus selesai atau ditolak"],
          data: [],
        });
      }

      const { result } = await mysqlQuery(
        "SELECT pen.id,pen.foto_bukti,pen.deskripsi,pen.tanggal,users.username,users.email FROM penanganan as pen INNER JOIN pengaduan as p ON pen.fk_pengaduan=p.id INNER JOIN users ON p.fk_user=users.id WHERE users.id = ? AND p.status = ?",
        [req.userID, req.params.status]
      );

      return res.status(200).json({
        status: "OK",
        message: "semua data penanganan",
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
      const checkFolder = await checkDir("./images");
      if (!checkFolder) {
        await fs.mkdir("./images");
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
      const jsonString = JSON.stringify(data);
      const parse = JSON.parse(jsonString);
      const field = parse.field;
      const file = parse.files;

      if (typeof parse.files.foto_bukti === "undefined") {
        const keyUp = Object.keys(parse.files)[0];
        if (keyUp) {
          await fs.unlink(parse.files[keyUp].filepath);
        }
        return res.status(400).json({
          status: "Bad Request",
          message: "terjadi kesalahan diclient",
          errors: ["harus mengupload foto dengan properti foto_bukti"],
          data: [],
        });
      }

      const { result } = await mysqlQuery(
        "SELECT * FROM pengaduan WHERE id = ? AND status = ?",
        [+field.pengaduanID, "diproses"]
      );

      if (!result.length) {
        await fs.unlink(file.foto_bukti.filepath);
        return res.status(404).json({
          status: "Not Found",
          message: "terjadi kesalahan diclient",
          errors: ["pengaduan tidak ditemukan"],
          data: [],
        });
      }

      const penVal = new PenangananVal(field);
      penVal.checkLen();
      penVal.checkStatus();

      if (penVal.getErrors.length) {
        await fs.unlink(file.foto_bukti.filepath);
        return res.status(400).json({
          status: "Bad Request",
          message: "terjadi kesalahan diclient",
          errors: penVal.getErrors,
          data: [],
        });
      }

      const imgVal = new ImgVal(file.foto_bukti);

      if (imgVal.getErrors().length) {
        await fs.unlink(file.foto_bukti.filepath);
        return res.status(400).json({
          status: "Bad Request",
          message: "terjadi kesalahan diclient",
          errors: imgVal.getErrors(),
          data: [],
        });
      }

      const img = await moveUploadedFile(parse.files.foto_bukti);
      const imgUrl = `${req.protocol}://${req.headers.host}/public/image/${img}`;

      await mysqlQuery("UPDATE pengaduan SET status = ? WHERE id = ?", [
        penVal.getStatus,
        +field.pengaduanID,
      ]);

      await mysqlQuery(
        "INSERT INTO penanganan (foto_bukti,deskripsi,fk_pengaduan) VALUES (?,?,?)",
        [imgUrl, field.deskripsi, +field.pengaduanID]
      );

      return res.status(201).json({
        status: "Created",
        message: "berhasil menambahkan penanganan",
        errors: [],
        data: [],
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

  static async del(req, res) {
    try {
      const { result } = await mysqlQuery(
        "SELECT pen.id,pen.foto_bukti,p.foto, p.id as id_pengaduan FROM penanganan as pen INNER JOIN pengaduan as p ON pen.fk_pengaduan=p.id WHERE pen.id = ?",
        +req.params.id
      );

      if (!result.length) {
        return res.status(404).json({
          status: "Not Found",
          message: "terjadi kesahalan diclient",
          errors: ["penanganan tidak ditemukan"],
          data: [],
        });
      }

      const dir = `${getDirName()}/images`;
      const pathFotoBukti = `${dir}/${result[0].foto_bukti.split("/").at(-1)}`;

      await fs.unlink(pathFotoBukti);
      await mysqlQuery("DELETE FROM penanganan WHERE id = ?", +req.params.id);
      await mysqlQuery("UPDATE pengaduan SET status = ? WHERE id = ?", [
        "diproses",
        +result[0].id_pengaduan,
      ]);

      return res.status(200).json({
        status: "OK",
        message: "berhasil mengahapus penanganan",
        errors: [],
        data: [],
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
}

export default PenangananControl;
