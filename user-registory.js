import DBLocal from 'db-local'

import crypto from 'crypto'
import bcrypt from 'bcrypt'

const { Schema } = new DBLocal({ path: './db'})

const usuario = Schema ('usuario', {
    _id: {type: String, required: true},
    username: {type: String, required: true},
    password: {type: String, required: true}
})

export class UserRegistory {
    static async create ({username, password}) {
        //Validacion de usuario 
        if (typeof username !== 'string') throw new Error ('El usuario debe ser texto')
        if (username.length < 3) throw new Error('El usuario debe tener al menos 3 caracteres')
        
        //Validacion de contraseña
        if (typeof password !== 'string') throw new Error ('El usuario debe ser texto')
        if (password.length < 6) throw new Error('La contraseña debe tener al menos 6 caracteres')
        
        //Usuario si ya existe
        const user = usuario.findOne({username})
        if (user) throw new Error('El usuario ya existe')

        const id = crypto.randomUUID()

        //contraseña hasheada 
        const hashed = await bcrypt.hash(password, 10)

        usuario.create({
            _id: id,
            username,
            password: hashed
        }).save()

        return id 
    }
    static async login ({username, password}) {
        //validacion de usuario
        if (typeof username !== 'string') throw new Error ('El usuario debe ser texto')
        if (username.length < 3) throw new Error('El usuario debe tener al menos 3 caracteres')
        
        //Validacion de contraseña
        if (typeof password !== 'string') throw new Error ('El usuario debe ser texto')
        if (password.length < 6) throw new Error('La contraseña debe tener al menos 6 caracteres')
        
        const user = usuario.findOne({username}) 
        if (!user) throw new Error ('usuario no existe')
        
        const valido = await bcrypt.compare(password, user.password)
        if(!valido) throw new Error ('La contraseña es valida')
        
        return user

        
    }
}

