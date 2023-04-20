import mysqlQuery from "../DB/mysqlQuery.js"
import UserValidation from "../validation/UserValidation.js"
import bcryptjs from 'bcryptjs'

class UsersControl{
    static async getAll(req,res){
        try{

            const {result} = await mysqlQuery(
                `SELECT 
                    users.id,
                    users.username,
                    users.email,
                    roles.role 
                FROM users INNER JOIN roles ON roles.id=users.fk_role`)

            return res.status(200).json({
                status : "OK",
                message : "semua data users",
                errors : [],
                data : result
            })

        }catch(err){
            return res.status(500).json({
                status : "Internal Server Error",
                message : "terjadi kesalahan diserver",
                errors : [],
                data : []
            })
        }
    }
    
    static async post(req,res){
        try{

            const userVal = new UserValidation(req.body)
            userVal.checkType()


            if(userVal.getErrors.length){
                return res.status(400).json({
                    status : "Bad Request",
                    message : "terjadi kesalahan diclient",
                    errors : userVal.getErrors,
                    data : []
                })
            }
            
            userVal.checkLen()
            userVal.checkIsEmail()
            
            
            if(userVal.getErrors.length){
                return res.status(400).json({
                    status : "Bad Request",
                    message : "terjadi kesalahan diclient",
                    errors : userVal.getErrors,
                    data : []
                })
            }
            
            await userVal.checkUniqEmail()
            
            if(userVal.getErrors.length){
                return res.status(400).json({
                    status : "Bad Request",
                    message : "terjadi kesalahan diclient",
                    errors : userVal.getErrors,
                    data : []
                })
            }

            const salt = bcryptjs.genSaltSync(10)
            const hashPassword = bcryptjs.hashSync(userVal.getPassword,salt)

            await mysqlQuery(`INSERT INTO 
                users (
                    username,
                    email,
                    password
                ) VALUES (
                    '${userVal.getUsername}',
                    '${userVal.getEmail}',
                    '${hashPassword}'
                )
            `)

            return res.status(201).json({
                status : "Created",
                message : "berhasil menambahkan user",
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

export default UsersControl