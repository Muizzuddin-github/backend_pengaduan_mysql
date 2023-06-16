import mysqlQuery from "../DB/mysqlQuery.js";
import fs from "fs/promises";
import imgParser from "../func/imgParser.js";
import KategoriPengaduanVal from "../validation/KategoriPengaduanVal.js";
import ImgVal from "../validation/ImgVal.js";
import moveUploadedFile from "../func/moveUploadedFile.js";
import getDirName from "../func/getDirName.js";
import checkDir from "../func/checkDir.js";
import Response from "../func/Response.js";

class KatControl {
  static async getAll(req, res) {
    try {
      const { result } = await mysqlQuery("SELECT * FROM kategori_pengaduan");

      return Response.success(res, "semua data pengaduan", result, req.user);
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

      const urlFileUpload = parse.files.foto.filepath;
      const val = new KategoriPengaduanVal(parse.field);
      val.checkType();

      if (val.getErrors().length) {
        await fs.unlink(urlFileUpload);
        return Response.badRequest(res, val.getErrors());
      }

      val.checkLen();
      await val.uniqKategori();

      if (val.getErrors().length) {
        await fs.unlink(urlFileUpload);
        return Response.badRequest(res, val.getErrors());
      }

      const checkImg = new ImgVal(parse.files.foto);
      checkImg.checkSize();
      checkImg.checkIsImg();

      if (checkImg.getErrors().length) {
        await fs.unlink(urlFileUpload);
        return Response.badRequest(res, val.getErrors());
      }

      const gambar = await moveUploadedFile(parse.files.foto);
      const imgUrl = `${req.protocol}://${req.headers.host}/public/image/${gambar}`;

      const sql =
        "INSERT INTO kategori_pengaduan (nama,foto,deskripsi) VALUES (?,?,?)";

      await mysqlQuery(sql, [val.nama, imgUrl, val.deskripsi]);

      return Response.created(res, "berhasil menambahkan kategori pengaduan");
    } catch (err) {
      return Response.serverError(res, err.message);
    }
  }

  static async put(req, res) {
    try {
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

      const { result } = await mysqlQuery(
        `SELECT * FROM kategori_pengaduan WHERE id = ${req.params.id}`
      );
      if (!result.length) {
        const keyUp = Object.keys(parse.files)[0];
        if (keyUp) {
          await fs.unlink(parse.files[keyUp].filepath);
        }
        return Response.notFound(res, "kategori pengaduan tidak ditemukan");
      }

      if (typeof parse.files.foto === "undefined") {
        const val = new KategoriPengaduanVal(parse.field);
        val.checkType();

        if (val.getErrors().length) {
          return Response.badRequest(res, val.getErrors());
        }

        val.checkLen();
        if (val.getErrors().length) {
          return Response.badRequest(res, val.getErrors());
        }

        const sql =
          "UPDATE kategori_pengaduan SET nama = ?, deskripsi = ? WHERE id = ?";

        await mysqlQuery(sql, [val.nama, val.deskripsi, req.params.id]);

        return Response.success(res, "berhasil mengubah kategori pengaduan");
      }

      const urlFileUpload = parse.files.foto.filepath;
      const val = new KategoriPengaduanVal(parse.field);
      val.checkType();

      if (val.getErrors().length) {
        await fs.unlink(urlFileUpload);
        return Response.badRequest(res, val.getErrors());
      }

      val.checkLen();

      if (val.getErrors().length) {
        await fs.unlink(urlFileUpload);
        return Response.badRequest(res, val.getErrors());
      }

      const checkImg = new ImgVal(parse.files.foto);
      checkImg.checkSize();
      checkImg.checkIsImg();

      if (checkImg.getErrors().length) {
        await fs.unlink(urlFileUpload);
        return Response.badRequest(res, checkImg.getErrors());
      }

      const gambar = await moveUploadedFile(parse.files.foto);
      const imgUrl = `${req.protocol}://${req.headers.host}/public/image/${gambar}`;

      const sql = `UPDATE kategori_pengaduan SET nama = '${val.nama}', foto = '${imgUrl}', deskripsi = '${val.deskripsi}' WHERE id = ${req.params.id}`;

      const dirName = getDirName();

      const imgOld = result[0].foto.split("/");
      const imgUrlOld = imgOld[imgOld.length - 1];

      await fs.unlink(`${dirName}/images/${imgUrlOld}`);

      await mysqlQuery(sql);

      return Response.success(res, "berhasil mengubah kategori pengaduan");
    } catch (err) {
      return Response.serverError(res, err.message);
    }
  }

  static async del(req, res) {
    try {
      const { result } = await mysqlQuery(
        `SELECT * FROM kategori_pengaduan WHERE id = ${req.params.id}`
      );

      if (!result.length) {
        return Response.notFound(res, "kategori pengaduan tidak ditemukan");
      }

      const img = result[0].foto.split("/");
      const imgName = img[img.length - 1];

      await mysqlQuery(
        `DELETE FROM kategori_pengaduan WHERE id = ${req.params.id}`
      );

      const dirName = getDirName();

      await fs.unlink(`${dirName}/images/${imgName}`);

      return Response.success(
        res,
        "berhasil menghapus kategori pengaduan dan relasinya"
      );
    } catch (err) {
      return Response.serverError(res, err.message);
    }
  }
}

export default KatControl;
