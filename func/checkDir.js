import fs from "fs";

const checkDir = async (path) => {
  return new Promise((resolve, reject) => {
    fs.access(path, (err) => {
      if (err) {
        resolve(false);
      }
      resolve(true);
    });
  });
};

export default checkDir;
