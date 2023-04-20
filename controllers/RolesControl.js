import mysqlQuery from "../DB/mysqlQuery.js"

class RolesControl{
    static async getAll(req,res){
        try{
            const {result} = await mysqlQuery("SELECT * FROM roles")
            return res.status(200).json({
                status : "OK",
                message : "semua data roles",
                errors : [],
                data : result
            })

        }catch(err){
            return res.status(200).json({
                status : "Internal Server Error",
                message : "terjadi kesalahan diserver",
                errors : [err.message],
                data : []
            })
        }
    }
}

export default RolesControl