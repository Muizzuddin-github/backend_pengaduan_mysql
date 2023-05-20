import mysqlQuery from "../DB/mysqlQuery.js";
import fs from "fs/promises";
import imgParser from "../func/imgParser.js";
import KategoriPengaduanVal from "../validation/KategoriPengaduanVal.js";
import ImgVal from "../validation/ImgVal.js";
import moveUploadedFile from "../func/moveUploadedFile.js";
import getDirName from "../func/getDirName.js";
import checkDir from "../func/checkDir.js";

class KatControl {
  static async getAll(req, res) {
    try {
      const { result } = await mysqlQuery("SELECT * FROM kategori_pengaduan");

      return res.status(200).json({
        status: "OK",
        message: "semua data kategori pengaduan",
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
      const ubah = JSON.stringify(data);
      const parse = JSON.parse(ubah);

      if (typeof parse.files.foto === "undefined") {
        const keyUp = Object.keys(parse.files)[0];
        if (keyUp) {
          await fs.unlink(parse.files[keyUp].filepath);
        }
        return res.status(400).json({
          status: "Bad Request",
          message: "terjadi kesalahan diclient",
          errors: ["harus mengupload foto dengan properti foto"],
          data: [],
        });
      }

      const urlFileUpload = parse.files.foto.filepath;
      const val = new KategoriPengaduanVal(parse.field);
      val.checkType();

      if (val.getErrors().length) {
        await fs.unlink(urlFileUpload);
        return res.status(400).json({
          status: "Bad Request",
          message: "terjadi kesalahan diclient",
          errors: val.getErrors(),
          data: [],
        });
      }

      val.checkLen();
      await val.uniqKategori();

      if (val.getErrors().length) {
        await fs.unlink(urlFileUpload);
        return res.status(400).json({
          status: "Bad Request",
          message: "terjadi kesalahan diclient",
          errors: val.getErrors(),
          data: [],
        });
      }

      const checkImg = new ImgVal(parse.files.foto);
      checkImg.checkSize();
      checkImg.checkIsImg();

      if (checkImg.getErrors().length) {
        await fs.unlink(urlFileUpload);
        return res.status(400).json({
          status: "Bad Request",
          message: "terjadi kesalahan diclient",
          errors: checkImg.getErrors(),
          data: [],
        });
      }

      const gambar = await moveUploadedFile(parse.files.foto);
      const imgUrl = `${req.protocol}://${req.headers.host}/public/image/${gambar}`;

      const sql = `INSERT INTO kategori_pengaduan (nama,foto,deskripsi) VALUES ('${val.nama}','${imgUrl}','${val.deskripsi}')`;
      await mysqlQuery(sql);

      return res.status(201).json({
        status: "Created",
        message: "berhasil menambahkan kategori pengaduan",
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

  static async put(req, res) {
    try {
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

      const { result } = await mysqlQuery(
        `SELECT * FROM kategori_pengaduan WHERE id = ${req.params.id}`
      );
      if (!result.length) {
        const keyUp = Object.keys(parse.files)[0];
        if (keyUp) {
          await fs.unlink(parse.files[keyUp].filepath);
        }
        return res.status(404).json({
          status: "Not Found",
          message: "terjadi kesalahan diclient",
          errors: ["kategori pengaduan tidak ditemukan"],
          data: [],
        });
      }

      if (typeof parse.files.foto === "undefined") {
        const val = new KategoriPengaduanVal(parse.field);
        val.checkType();

        if (val.getErrors().length) {
          return res.status(400).json({
            status: "Bad Request",
            message: "terjadi kesalahan diclient",
            errors: val.getErrors(),
            data: [],
          });
        }

        val.checkLen();
        if (val.getErrors().length) {
          return res.status(400).json({
            status: "Bad Request",
            message: "terjadi kesalahan diclient",
            errors: val.getErrors(),
            data: [],
          });
        }

        const sql = `UPDATE kategori_pengaduan SET nama = '${val.nama}', deskripsi = '${val.deskripsi}' WHERE id = ${req.params.id}`;

        await mysqlQuery(sql);

        return res.status(200).json({
          status: "OK",
          message: "berhasil mengubah kategori pengaduan",
          errors: [],
          data: [],
        });
      }

      const urlFileUpload = parse.files.foto.filepath;
      const val = new KategoriPengaduanVal(parse.field);
      val.checkType();

      if (val.getErrors().length) {
        await fs.unlink(urlFileUpload);
        return res.status(400).json({
          status: "Bad Request",
          message: "terjadi kesalahan diclient",
          errors: val.getErrors(),
          data: [],
        });
      }

      val.checkLen();

      if (val.getErrors().length) {
        await fs.unlink(urlFileUpload);
        return res.status(400).json({
          status: "Bad Request",
          message: "terjadi kesalahan diclient",
          errors: val.getErrors(),
          data: [],
        });
      }

      const checkImg = new ImgVal(parse.files.foto);
      checkImg.checkSize();
      checkImg.checkIsImg();

      if (checkImg.getErrors().length) {
        await fs.unlink(urlFileUpload);
        return res.status(400).json({
          status: "Bad Request",
          message: "terjadi kesalahan diclient",
          errors: checkImg.getErrors(),
          data: [],
        });
      }

      const gambar = await moveUploadedFile(parse.files.foto);
      const imgUrl = `${req.protocol}://${req.headers.host}/public/image/${gambar}`;

      const sql = `UPDATE kategori_pengaduan SET nama = '${val.nama}', foto = '${imgUrl}', deskripsi = '${val.deskripsi}' WHERE id = ${req.params.id}`;

      const dirName = getDirName();

      const imgOld = result[0].foto.split("/");
      const imgUrlOld = imgOld[imgOld.length - 1];

      await fs.unlink(`${dirName}/images/${imgUrlOld}`);

      await mysqlQuery(sql);

      return res.status(200).json({
        status: "OK",
        message: "berhasil mengubah kategori pengaduan",
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
        `SELECT * FROM kategori_pengaduan WHERE id = ${req.params.id}`
      );

      if (!result.length) {
        return res.status(404).json({
          status: "Not Found",
          message: "terjadi kesalahan diclient",
          errors: ["kategori pengaduan tidak ditemukan"],
          data: [],
        });
      }

      const img = result[0].foto.split("/");
      const imgName = img[img.length - 1];

      await mysqlQuery(
        `DELETE FROM kategori_pengaduan WHERE id = ${req.params.id}`
      );

      const dirName = getDirName();

      await fs.unlink(`${dirName}/images/${imgName}`);

      return res.status(200).json({
        status: "OK",
        message: "berhasil menghapus pengaduan dan relasinya",
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

export default KatControl;
