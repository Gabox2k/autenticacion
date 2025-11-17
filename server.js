import express, { response } from 'express'
import jwt from 'jsonwebtoken'
import cookieParser from 'cookie-parser'
import {PORT, secret_jwt_key} from './config.js'
import {  UserRegistory } from './user-registory.js'


const app = express()

app.set('view engine' , 'ejs')

app.use(express.json())
app.use(cookieParser())


function admin(req, res, next) {
    const token = req.cookies.acceso_token
    if(!token) return res.status(403).send("No estas autorizado")
    
    try{
        const data = jwt.verify(token, secret_jwt_key)
        if (data.role !== "admin") return res.status(403).send("Solo el admin")
        
        req.user = data
        next()
    } catch (e) {
        res.status(403).send("token invalido")
    }
}


app.get('/', (req,res) => {
    const token = req.cookies.acceso_token
    let username = null
    let role = null 

    if (token){

        try{
            const decoded = jwt.verify(token, secret_jwt_key)
            username = decoded.username
        } catch (err) {
            username = null 
            role = null
        }
    }

    res.render('index', {username, role })
})


app.post('/login', async (req, res) => {
    const {username, password } = req.body
    
    try{
        const user = await UserRegistory.login({username, password})
        const token = jwt.sign({id: user.id, username: user.username, role: user.role}, secret_jwt_key , {
            expiresIn : '1h'
        }

        )
        res
            .cookie('acceso_token' , token, {
                httpOnl : true,
                sameSite : 'lax'
            })
            .status(200)
            .send({message: 'loguedo', role: user.role})
    } catch(error){
        res.status(401).send(error.message)
    }
})


app.post('/cerrar', async (req, res) =>{
    res
        .clearCookie('acceso_token')
        .json({message : 'Sesion cerrada'})
})


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

app.get("/admin", admin,  async (req, res) =>{
    try { 
        const users = UserRegistory.getAll()
        res.render('admin' , {users})

    } catch (err) {
        res.status(500).send('error al obteenr los usuarios')
    }
   
})


app.post('/admin/role', admin, (req,res) =>{
    const {username, newrole } = req.body

    const user = UserRegistory.users.find(u => u.username == username)
    if (!user) return res.status(404).send("Usuario no encontrado")
    
    user.role= newrole
    res.send({message : "rol actualizado"})
})

app.post('/admin/delete', admin, (req, res) => {
    const {username } = req.body

    const index = UserRegistory.users.findIndex(u => u.username == username)
    if (index === -1) return res.status(404).send({message: "Usuario no encontrado"})
    
    UserRegistory.users.splice(index, 1)
    res.send({message: "Usuario eliminado" })
})

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