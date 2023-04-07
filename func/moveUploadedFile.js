import fs from 'fs'


const moveUploadedFile = (file) => {
    const waktu = Date.now()
    const newFileName = `${waktu}_${file.originalFilename}`


    // baca file dari url
    const data = fs.readFileSync(file.filepath);

    // buat file baru dengan nama yang ditentukan
    // lalu isi dengan data hasil dari file yang diupload
    fs.writeFileSync(`images/${newFileName}`,data)
    // hapus file
    fs.unlinkSync(file.filepath)

    return newFileName
}

export default moveUploadedFile