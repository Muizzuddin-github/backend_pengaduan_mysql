import fs from "fs";
import getDirName from "../func/getDirName.js";
import Response from "../func/Response.js";

class Gambar {
  static getSingle(req, res) {
    try {
      const imgName = req.params.img;
      const dirName = getDirName();

      const img = `/images/${imgName}`;

      const checkImg = fs.existsSync(`.${img}`);
      if (!checkImg) {
        return Response.notFound(res, "gambar tidak ditemukan");
      }

      return res.sendFile(img, { root: dirName });
    } catch (err) {
      return Response.serverError(res, err.message);
    }
  }
}

export default Gambar;
