import mysqlQuery from "../DB/mysqlQuery.js";
import imgParser from "../func/imgParser.js";
import checkDir from "../func/checkDir.js";
import fs from "fs/promises";
import moveUploadedFile from "../func/moveUploadedFile.js";
import ImgVal from "../validation/ImgVal.js";
import PenangananVal from "../validation/PenangananVal.js";
import getDirName from "../func/getDirName.js";
import Response from "../func/Response.js";

class PenangananControl {
  static async getAll(req, res) {
    try {
      const { result } = await mysqlQuery(
        "SELECT pen.id,pen.foto_bukti,pen.deskripsi,pen.tanggal,users.username,users.email FROM penanganan as pen INNER JOIN pengaduan as p ON pen.fk_pengaduan=p.id INNER JOIN users ON p.fk_user=users.id WHERE p.status = ? ORDER BY pen.tanggal DESC",
        "selesai"
      );

      return Response.success(res, "semua data penanganan anda", result);
    } catch (err) {
      return Response.serverError(res, err.message);
    }
  }
  static async getAllAdmin(req, res) {
    try {
      const status = ["selesai", "ditolak"];

      if (!status.includes(req.params.status)) {
        return Response.badRequest(res, "status harus selesai atau ditolak");
      }

      const { result } = await mysqlQuery(
        "SELECT pen.id,pen.foto_bukti,pen.deskripsi,pen.tanggal,users.username,users.email  FROM penanganan as pen INNER JOIN pengaduan as p ON pen.fk_pengaduan=p.id INNER JOIN users ON p.fk_user=users.id WHERE p.status = ?",
        req.params.status
      );

      return Response.success(res, "semua data penanganan", result);
    } catch (err) {
      return Response.serverError(res, err.message);
    }
  }
  static async getAllUser(req, res) {
    try {
      const status = ["selesai", "ditolak"];

      if (!status.includes(req.params.status)) {
        return Response.badRequest(res, "status harus selesai atau ditolak");
      }

      const { result } = await mysqlQuery(
        "SELECT pen.id,pen.foto_bukti,pen.deskripsi,pen.tanggal,users.username,users.email FROM penanganan as pen INNER JOIN pengaduan as p ON pen.fk_pengaduan=p.id INNER JOIN users ON p.fk_user=users.id WHERE users.id = ? AND p.status = ?",
        [req.user.id, req.params.status]
      );

      return Response.success(res, "semua data penanganan anda", result);
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
      const jsonString = JSON.stringify(data);
      const parse = JSON.parse(jsonString);
      const field = parse.field;
      const file = parse.files;

      const status = ["selesai", "ditolak"];

      if (!status.includes(field.status)) {
        return Response.badRequest(res, "status harus selesai atau ditolak");
      }

      if (field.status === "selesai") {

        if (typeof parse.files.foto_bukti === "undefined") {
          const keyUp = Object.keys(parse.files)[0];
          if (keyUp) {
            await fs.unlink(parse.files[keyUp].filepath);
          }
          return Response.badRequest(
            res,
            "harus mengupload foto dengan properti foto_bukti"
          );
        }
  
        const { result } = await mysqlQuery(
          "SELECT * FROM pengaduan WHERE id = ? AND status = ?",
          [+field.pengaduanID, "diproses"]
        );

        if (!result.length) {
          await fs.unlink(file.foto_bukti.filepath);
          return Response.notFound(res, "pengaduan selesai harus diproses terlebih dahulu");
        }

        const penVal = new PenangananVal(field);
        penVal.checkLen();
  
        if (penVal.getErrors.length) {
          await fs.unlink(file.foto_bukti.filepath);
          return Response.badRequest(res, penVal.getErrors);
        }
  
        const imgVal = new ImgVal(file.foto_bukti);
  
        if (imgVal.getErrors().length) {
          await fs.unlink(file.foto_bukti.filepath);
          return Response.badRequest(res, imgVal.getErrors());
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
  
        return Response.created(res, "berhasil menambahkan penanganan");
      } else if (field.status === "ditolak") {

        if (typeof parse.files.foto_bukti === "undefined") {
          const keyUp = Object.keys(parse.files)[0];
          if (keyUp) {
            await fs.unlink(parse.files[keyUp].filepath);
          }

          const { result } = await mysqlQuery(
            "SELECT * FROM pengaduan WHERE id = ? AND (status = ? OR status = ? )",
            [+field.pengaduanID, "terkirim", "diproses"]
          );
  
          if (!result.length) {
            return Response.notFound(res, "pengaduan tidak ditemukan");
          }
  
          const penVal = new PenangananVal(field);
          penVal.checkLen();
    
          if (penVal.getErrors.length) {
            return Response.badRequest(res, penVal.getErrors);
          }
  
          const imgUrl = "https://iili.io/Higl6b4.png";
          await mysqlQuery("UPDATE pengaduan SET status = ? WHERE id = ?", [
            penVal.getStatus,
            +field.pengaduanID,
          ]);
    
          await mysqlQuery(
            "INSERT INTO penanganan (foto_bukti,deskripsi,fk_pengaduan) VALUES (?,?,?)",
            [imgUrl, field.deskripsi, +field.pengaduanID]
          );
    
          return Response.created(res, "berhasil menambahkan penanganan");

        }else{
          const { result } = await mysqlQuery(
            "SELECT * FROM pengaduan WHERE id = ? AND status = ?",
            [+field.pengaduanID, "diproses"]
          );
  
          if (!result.length) {
            await fs.unlink(file.foto_bukti.filepath);
            return Response.notFound(res, "pengaduan selesai harus diproses terlebih dahulu");
          }
  
          const penVal = new PenangananVal(field);
          penVal.checkLen();
    
          if (penVal.getErrors.length) {
            await fs.unlink(file.foto_bukti.filepath);
            return Response.badRequest(res, penVal.getErrors);
          }
    
          const imgVal = new ImgVal(file.foto_bukti);
    
          if (imgVal.getErrors().length) {
            await fs.unlink(file.foto_bukti.filepath);
            return Response.badRequest(res, imgVal.getErrors());
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
    
          return Response.created(res, "berhasil menambahkan penanganan");
        }
      }
    } catch (err) {
      return Response.serverError(res, err.message);
    }
  }

  static async del(req, res) {
    try {
      const { result } = await mysqlQuery(
        "SELECT pen.id,pen.foto_bukti,p.foto, p.id as id_pengaduan FROM penanganan as pen INNER JOIN pengaduan as p ON pen.fk_pengaduan=p.id WHERE pen.id = ?",
        +req.params.id
      );

      if (!result.length) {
        return Response.notFound(res, "penanganan tidak ditemukan");
      }

      const dir = `${getDirName()}/images`;
      const pathFotoBukti = `${dir}/${result[0].foto_bukti.split("/").at(-1)}`;

      await fs.unlink(pathFotoBukti);
      await mysqlQuery("DELETE FROM penanganan WHERE id = ?", +req.params.id);
      await mysqlQuery("UPDATE pengaduan SET status = ? WHERE id = ?", [
        "diproses",
        +result[0].id_pengaduan,
      ]);

      return Response.success(res, "berhasil mengahpus penanganan");
    } catch (err) {
      return Response.serverError(res, err.message);
    }
  }
}

export default PenangananControl;
