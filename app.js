import express from 'express'
import roles from './routes/roles.js'
import users from './routes/users.js'
import katPengaduan from './routes/kategoriPengaduan.js'
import gambar from './routes/gambar.js'
import pengaduan from './routes/pengaduan.js'
import krisar from './routes/krisar.js'
import morgan from 'morgan'

const app = express()
app.use(express.json())
app.use(morgan("tiny"))


app.use("/roles",roles)
app.use("/users",users)
app.use("/kategori-pengaduan",katPengaduan)
app.use("/pengaduan",pengaduan)
app.use("/gambar",gambar)
app.use('/krisar',krisar)

app.listen(8080,function(){
    console.log("server is listening")
})