import mysqlConn from "./mysqlConn.js";

const mysqlQuery = (sql) => {
    return new Promise((resolve,reject) => {
        mysqlConn.query(sql,function(err,result,field){
            if(err) return reject(err)
            return resolve({result,field})
        })
    })
}

export default mysqlQuery