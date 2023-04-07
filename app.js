import express from 'express'
import katPengaduan from './routes/kategoriPengaduan.js'
import gambar from './routes/gambar.js'
import pengaduan from './routes/pengaduan.js'
import morgan from 'morgan'

const app = express()
app.use(express.json())
app.use(morgan("tiny"))

app.use("/kategori-pengaduan",katPengaduan)
app.use("/pengaduan",pengaduan)
app.use("/gambar",gambar)

app.listen(8080,function(){
    console.log("server is listening")
})