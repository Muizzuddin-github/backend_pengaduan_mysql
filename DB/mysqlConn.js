import mysql from 'mysql'

const mysqlConn = mysql.createConnection({
    host : "localhost",
    port : 3306,
    user : "root",
    password : "",
    database : "project_pengaduan"
})

mysqlConn.connect(function(err){
    if(err) throw err
})

export default mysqlConn