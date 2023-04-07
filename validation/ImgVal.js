class ImgVal{
    #size = 0
    #mimetype = ""
    #errors = []

    constructor(gambar){
        this.#size = gambar.size
        this.#mimetype = gambar.mimetype
    }

    checkSize(){
        if(this.#size > 10000000){
            this.#errors.push("maximal gambar 10mb")
        }
    }

    checkIsImg(){
        const [fileName,ext] = this.#mimetype.split("/")
        if(fileName != 'image'){
            this.#errors.push("file yang dikirimkan harus image")
        }

        const extValid = ['jpg','png','jpeg']

        if(!extValid.includes(ext)){
            this.#errors.push(`extention file harus ${extValid.join('/')}`)
        }
    }

    getErrors(){
        return this.#errors
    }
}

export default ImgVal