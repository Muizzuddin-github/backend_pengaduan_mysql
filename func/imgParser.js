import formidable from "formidable";


const imgParser = (req) => {
    return new Promise((resolve,reject) => {
        const option = {
            uploadDir : "images"
        }

        const form = formidable(option)

        form.parse(req,(err,field,files)=>{
            if(err){
                reject(err)
            }

            resolve({field,files})
        })
    })
}


export default imgParser