import jwt from 'jsonwebtoken'


const verify = (token,key) => {
    return new Promise((resolve,reject)=>{
        jwt.verify(token,key,function(err){
            if(err) return resolve(false)
            resolve(true)
        })
    })
}


export default verify