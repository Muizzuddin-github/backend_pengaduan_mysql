import fs from "fs/promises";

const moveUploadedFile = async (file) => {
  const waktu = Date.now();
  const newFileName = `${waktu}_${file.originalFilename}`;
  await fs.rename(file.filepath, `./images/${newFileName}`);

  return newFileName;
};

export default moveUploadedFile;
