import validator from "validator"
import mysqlQuery from "../DB/mysqlQuery.js"

class UserValidation{
    #username = ""
    #email = ""
    #password = ""
    #errors = []

    constructor(user){
        this.#username = user.username
        this.#email = user.email
        this.#password = user.password
    }

    get getUsername(){
        return this.#username
    }
    get getEmail(){
        return this.#email
    }
    get getPassword(){
        return this.#password
    }

    checkType(){
        if(typeof this.#username != 'string'){
            this.#errors.push("username harus string")
        }
        if(typeof this.#email != "string"){
            this.#errors.push("email harus string")
        }
        if(typeof this.#password != "string"){
            this.#errors.push("password harus string")
        }
    }

    checkLen(){
        if(this.#username.length < 3){
            this.#errors.push("username minimal 3 karakter")
        }else if(this.#username.length > 20){
            this.#errors.push("username maximal 20 karakter")
        }

        if(this.#password.length < 6){
            this.#errors.push("password minimal 6 karakter")
        }else if(this.#password.length > 225){
            this.#errors.push("password maximal 225")
        }
    }

    checkIsEmail(){
        if(!validator.isEmail(this.#email)){
            this.#errors.push("silahkan masukkan email yang valid")
        }
    }

    async checkUniqEmail(){
        const {result} = await mysqlQuery(`SELECT * FROM users WHERE email = '${this.#email}'`)

        if(result.length){
            this.#errors.push("email sudah ada")
        }
    }

    get getErrors(){
        return this.#errors
    }
    
}

export default UserValidation