import express, { response } from 'express'
import jwt from 'jsonwebtoken'
import cookieParser from 'cookie-parser'
import {PORT, secret_jwt_key} from './config.js'
import {  UserRegistory } from './user-registory.js'
import db from './db.js'


const app = express()

app.set('view engine' , 'ejs')

app.use(express.json())
app.use(cookieParser())


//verificacion del administracion 
function admin(req, res, next) {
    const token = req.cookies.acceso_token
    if(!token) return res.status(403).send("No estas autorizado")
    
    try{
        const data = jwt.verify(token, secret_jwt_key)
        if (data.role !== "admin") return res.status(403).send("Solo el admin")//verificacion del rol
        
        req.user = data
        next()
    } catch (e) {
        res.status(403).send("token invalido")
    }
}


function JWT(req, res, next) {
    const header = req.headers.authorization

    let token = null

    if (header) {
        token = header.split(" ")[1]
    } else if (req.cookies && req.cookies.acceso_token) {
        token = req.cookies.acceso_token
    }

    if(!token) return res.status(403).send("falta token")

    try{
        const data = jwt.verify(token, secret_jwt_key)
        req.user= data
        next()

    } catch(err) {
        res.status(403).send("Token invalido")
    }
}


app.get('/login-jwt', (req,res) =>{
    res.send("Inicio de sesion con JWT")
})

//Obtencion del user y del rol
app.get('/', (req,res) => {
    const token = req.cookies.acceso_token
    let username = null
    let role = null 

    if (token){

        try{
            const decoded = jwt.verify(token, secret_jwt_key)
            username = decoded.username
            role = decoded.role
        } catch (err) {
            username = null 
            role = null
        }
    }

    res.render('index', {username, role })
})


//Loguear con la cookie
app.post('/login-cookie', async (req, res) => {
    const {username, password } = req.body
    
    try{
        const user = await UserRegistory.login({username, password})
        const token = jwt.sign({id: user.id, username: user.username, role: user.role}, secret_jwt_key , {
            expiresIn : '1h'
        }

        )
        res
            .cookie('acceso_token' , token, {
                httpOnly : true, //solo lee en el servidor
                sameSite : 'lax' 
            })
            .status(200)
            .send({message: 'loguedo', role: user.role})
    } catch(error){
        res.status(401).send(error.message)
    }
})

//Validar con el jwt
app.post('/login-jwt', async (req,res) =>{
      const {username, password } = req.body
    
    try{
        const user = await UserRegistory.login({username, password})
        const token = jwt.sign({id: user.id, username: user.username, role: user.role}, secret_jwt_key , {
            expiresIn : '1h'
        })

        // also set the token as a cookie so browser navigations can send it
        res
            .cookie('acceso_token', token, {
                httpOnly: true,
                sameSite: 'lax'
            })
            .status(200)
            .send({
                message: "Sesion iniciada con JWT",
                token,
                role: user.role
            })

    } catch (error){
        res.status(401).send(error.message)
    } 
})


app.get('/zona-jwt', JWT, (req,res) =>{
    res.send("con jwt valido")

})

//Cierre de sesion 
app.post('/cerrar', async (req, res) =>{
    res
        .clearCookie('acceso_token')
        .json({message : 'Sesion cerrada'})
})


//Registra el nuevo usuario a la base de datos 
app.post('/registro', async (req, res) =>{                   
    const {username, password} = req.body
    console.log(req.body)

    try{
        const id = await UserRegistory.create({username, password})
        const token = jwt.sign({id, username}, secret_jwt_key, 
        {
            expiresIn: '1h'
        })
        res
        .cookie('acceso_token', token, {
            httpOnly: true // solo accede en el servidor 
        })
        .send({id , token})
    } catch (error) {
        res.status(400).send(error.message)
    }

})


//Mostrar el la pagina protegido
app.get('/protegido', (req, res) => {
    const token = req.cookies.acceso_token
    if (!token){
        return res.status(403).send('No esta autorizado')
    }

    try {
        const data = jwt.verify(token, secret_jwt_key) 
        res.render('protegido', data)
    } catch (error) {
        res.status(401).send('No esta autorizado')
        
    }
   
})


//Solo el administrador puede entrar 
app.get("/admin", admin,  async (req, res) =>{
    try { 
        const users = UserRegistory.getAll()
        res.render('admin' , {users})

    } catch (err) {
        res.status(500).send('error al obtener los usuarios')
    }
   
})


//Verificacion del usuario
app.get("/admin/usuarios", admin, (req, res) =>{
    const users = UserRegistory.getAll()
    res.json(users)
} )


//Dar el rol de usuarios a admin
app.post('/admin/makeAdmin', admin, (req,res) =>{
    const {username, newrole } = req.body

    const user = db.prepare("SELECT * FROM usuario WHERE username = ?").get(username)
    if (!user) return res.status(404).send("Usuario no encontrado")
    
    db.prepare("UPDATE usuario SET role = ? WHERE username = ?").run(newrole, username)
    res.send({message : "rol actualizado"})
})


//Elimina al usuario 
app.post('/admin/eliminar', admin, (req, res) => {
    const {username } = req.body

    const resultado = db.prepare("SELECT * FROM usuario WHERE username = ?").get(username)
    if(!resultado) {
        return res.status(404).send({message: "Usuario no encontrado"})
    }

    db.prepare("DELETE FROM usuario WHERE username = ?").run(username)
    
    
    res.send({message: "Usuario eliminado" })
})


//Crea un admin por defecto
async function crearAdmin() {
    try{
        await UserRegistory.create({
            username : "admin",
            password: "admin123",
            role: "admin"
        })

        console.log("Admin creado")
    } catch (e) {

        console.log("Admin ya existe")
    }
    
}

crearAdmin()

app.listen(PORT,() => {
    console.log(`Servidor escuchando en el puerto ${PORT}`)
} )