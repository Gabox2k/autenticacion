import express, { response } from 'express'
import {  UserRegistory } from './user-registory.js'

const app = express()
app.use(express.json())

const port = process.env.port || 3000

app.get('/', (req,res) => {
    res.send('hola mundo')
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
        res.send({id})
    } catch (error) {
        res.status(400).send(error.message)
    }

})


app.listen(port,() => {
    console.log('Servidor escuchando en el puerto ${port}' )
} )