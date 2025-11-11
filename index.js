import express, { response } from 'express'
import jwt from 'jsonwebtoken'
import {PORT} from './config.js'
import {  UserRegistory } from './user-registory.js'


const app = express()

app.set('view engine' , 'ejs')
app.use(express.json())


app.get('/', (req,res) => {
    res.render('index')
})

app.post('/login', async (req, res) => {
    const {username, password } = req.body
    
    try{
        const user = await UserRegistory.login({username, password})
        res.send({user})
    } catch(error){
        res.status(401).send(error.message)
    }
})

app.post('/registro', async (req, res) =>{
    const {username, password} = req.body
    console.log(req.body)

    try{
        const id = await UserRegistory.create({username, password})
        const token = jwt.sign({id: user._id, username: user.username}, secret_jwt_key, 
        {
            expiresIn: '1h'
        })
        res.send({id , token})
    } catch (error) {
        res.status(400).send(error.message)
    }

})


app.listen(port,() => {
    console.log('Servidor escuchando en el puerto ${port}' )
} )