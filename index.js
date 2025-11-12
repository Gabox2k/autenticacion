import express, { response } from 'express'
import jwt from 'jsonwebtoken'
import cookieParser from 'cookie-parser'
import {PORT, secret_jwt_key} from './config.js'
import {  UserRegistory } from './user-registory.js'


const app = express()

app.set('view engine' , 'ejs')

app.use(express.json())
app.use(cookieParser())



app.get('/', (req,res) => {
    const token = req.cookies.acceso_token
    let username = null

    if (token){

        try{
            const decoded = jwt.verify(token, secret_jwt_key)
            username = decoded.username
        } catch (err) {
            username = null 
        }
    }

    res.render('index', {username })
})

app.post('/login', async (req, res) => {
    const {username, password } = req.body
    
    try{
        const user = await UserRegistory.login({username, password})
        const token = jwt.sign({id: user.id, username: user.username}, secret_jwt_key , {
            expiresIn : '1h'
        }

        )
        res
            .cookie('acceso_token' , token, {
                httpOnl : true,
                sameSite : 'lax'
            })
            .status(200)
            .send({message: 'loguedo'})
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


app.listen(PORT,() => {
    console.log(`Servidor escuchando en el puerto ${PORT}`)
} )