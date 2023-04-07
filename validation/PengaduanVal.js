import mysqlQuery from "../DB/mysqlQuery.js"

class PengaduanVal{
    lokasi = ""
    deskripsi = ""
    kategoriPengaduan = ""
    #errors = []
    
    constructor(data){
        this.lokasi = data.lokasi
        this.deskripsi = data.deskripsi
        this.kategoriPengaduan = data.kategoriPengaduan
    }

    checkType(){
        if(typeof this.lokasi !== "string"){
            this.#errors.push("lokasi harus bertype string")
        }

        if(typeof this.deskripsi !== "string"){
            this.#errors.push("deskripsi harus bertype string")
        }

        const check = +this.kategoriPengaduan.toString()

        if(check === "NaN"){
            this.#errors.push("kategori pengaduan harus angka")
        }
    }

    checkLen(){
        if(this.lokasi.length < 3){
            this.#errors.push("lokasi minimal 3 karakter")
        }else if(this.lokasi.length > 191){
            this.#errors.push("lokasi maximal 191 karakter")
        }

        if(this.deskripsi.length < 5){
            this.#errors.push("deskripsi minimal 5 karakter")
        }
    }

    async checkKategori(){
        const {result} = await mysqlQuery(`SELECT * FROM kategori_pengaduan WHERE id = ${+this.kategoriPengaduan}`)

        if(!result.length){
            this.#errors.push("kategori pengaduan tidak ditemukan")
        }
    }

    getErrors(){
        return this.#errors
    }
}

export default PengaduanVal