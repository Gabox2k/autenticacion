import crypto from 'crypto'
import bcrypt from 'bcrypt'
import db from './db.js'


export class UserRegistory {
    static async create ({username, password, role = "user"}) {
        //Validacion de usuario 
        if (typeof username !== 'string') throw new Error ('El usuario debe ser texto')
        if (username.length < 3) throw new Error('El usuario debe tener al menos 3 caracteres')
        
        //Validacion de contraseña
        if (typeof password !== 'string') throw new Error ('El usuario debe ser texto')
        if (password.length < 6) throw new Error('La contraseña debe tener al menos 6 caracteres')
        
        //Usuario si ya existe
        const existir = db.prepare("SELECT * FROM usuario WHERE  username = ? ").get(username)
        if (existir) throw new Error('El usuario ya existe')

        const id = crypto.randomUUID()

        //contraseña hasheada 
        const hashed = await bcrypt.hash(password, 10)

        db.prepare("INSERT INTO usuario (id, username, password, role) VALUES (?, ?, ?, ?)")
            .run(id, username, hashed, role)
        
        return id 
    }

    static getAll(){
        return db.prepare("SELECT id, username, role FROM usuario").all()
    }

    static async login ({username, password}) {
        //validacion de usuario
        if (typeof username !== 'string') throw new Error ('El usuario debe ser texto')
        if (username.length < 3) throw new Error('El usuario debe tener al menos 3 caracteres')
        
        //Validacion de contraseña
        if (typeof password !== 'string') throw new Error ('El usuario debe ser texto')
        if (password.length < 6) throw new Error('La contraseña debe tener al menos 6 caracteres')
        
        const user = db.prepare("SELECT * FROM usuario WHERE username =?").get(username)
        if (!user) throw new Error ('usuario no existe')
        
        const valido = await bcrypt.compare(password, user.password)
        if(!valido) throw new Error ('La contraseña es invalida')
        
        return user

        
    }
}

