import mysqlQuery from "../DB/mysqlQuery.js"
import fs from 'fs'
import imgParser from "../func/imgParser.js"
import KategoriPengaduanVal from "../validation/KategoriPengaduanVal.js"
import ImgVal from '../validation/ImgVal.js'
import moveUploadedFile from "../func/moveUploadedFile.js"

class KatPengaduanControl{
    static async getAll(req,res){
        try{

            const {result} = await mysqlQuery("SELECT * FROM kategori_pengaduan")

            return res.status(200).json({
                status : "OK",
                message : "semua data kategori pengaduan",
                errors : [],
                data : result
            })

        }catch(err){
            return res.status(500).json({
                status : "Internal Server Error",
                message : "terjadi kesalahan diserver",
                errors : [err.message],
                data : []
            })
        }
    }
    static async post(req,res){
        try{

            const checkFolder = fs.existsSync("./images")
            if(!checkFolder){
                fs.mkdirSync("./images")
            }

            const checkContentType = req.is('multipart/form-data')
            if(!checkContentType){
                return res.status(400).json({
                    status : "Bad Request",
                    message : "terjadi kesalahan diclient",
                    errors : ["content type harus multipart/form-data"],
                    data : []
                })
            }

            const data = await imgParser(req)
            const ubah = JSON.stringify(data)
            const parse = JSON.parse(ubah)

            if( typeof parse.files.foto === "undefined"){
                const keyUp = Object.keys(parse.files)[0]
                fs.unlinkSync(parse.files[keyUp].filepath)
                return res.status(400).json({
                    status : "Bad Request",
                    message : "terjadi kesalahan diclient",
                    errors : ["harus mengupload foto dengan properti foto"],
                    data : []
                })
            }

            const urlFileUpload = parse.files.foto.filepath
            const val = new KategoriPengaduanVal(parse.field)
            val.checkType()

            if(val.getErrors().length){
                fs.unlinkSync(urlFileUpload)
                return res.status(400).json({
                    status : "Bad Request",
                    message : "terjadi kesalahan diclient",
                    errors : val.getErrors(),
                    data : []
                })
            }
            
            val.checkLen()
            await val.uniqKategori()
            
            
            if(val.getErrors().length){
                fs.unlinkSync(urlFileUpload)
                return res.status(400).json({
                    status : "Bad Request",
                    message : "terjadi kesalahan diclient",
                    errors : val.getErrors(),
                    data : []
                })
            }

            const checkImg = new ImgVal(parse.files.foto)
            checkImg.checkSize()
            checkImg.checkIsImg()

            if(checkImg.getErrors().length){
                fs.unlinkSync(urlFileUpload)
                return res.status(400).json({
                    status : "Bad Request",
                    message : "terjadi kesalahan diclient",
                    errors : checkImg.getErrors(),
                    data : []
                })
            }


            const gambar = moveUploadedFile(parse.files.foto)
            const imgUrl = `${req.protocol}://${req.headers.host}/gambar/${gambar}`
            
            const sql = `INSERT INTO kategori_pengaduan (nama,foto,deskripsi) VALUES ('${val.nama}','${imgUrl}','${val.deskripsi}')`
            await mysqlQuery(sql)

            return res.status(201).json({
                status : "Created",
                message : "berhasil menambahkan kategori pengaduan",
                errors : [],
                data : []
            })


        }catch(err){
            return res.status(500).json({
                status : "Internal Server Error",
                message : "terjadi kesalahan diserver",
                errors : [err.message],
                data : []
            })
        }
    }
}

export default KatPengaduanControl