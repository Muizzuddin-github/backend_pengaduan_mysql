import fs from 'fs'
import getDirName from "../func/getDirName.js"

class Gambar{
    static getSingle(req,res){
        try{
            const imgName = req.params.img
            const dirName = getDirName()
    
            const img = `/images/${imgName}`

            const checkImg = fs.existsSync(`.${img}`)
            if(!checkImg){
                return res.status(404).json({
                    status : "Not Found",
                    message : "terjadi kesalahan diclient",
                    errors : ["gambar tidak ditemukan"],
                    data : []
                })
            }

            return res.sendFile(img,{root : dirName})
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

export default Gambar