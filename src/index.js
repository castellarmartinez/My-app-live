require('./redis/redis-server')
const express = require('express')
const mongo = require('./db/mongoose')
const redisClient = require('./redis/redis-server')
const cacheUsers = require('./middlewares/cache')

const app = express()
const port = 3000
const environment = process.env.NODE_ENV
const apiDescription = process.env.API_DESCRIPTION

app.get('/', (req, res) =>
{
    res.send('¡Esta es información obtenida desde tu API!')
})

app.post('/users', async (req, res) => 
{
    try 
    {
        await mongo.addNewUser()
        res.sendStatus(200)
    }
    catch (err) 
    {
        console.error(`Error: `, err.message)
    }
})

app.get('/users', cacheUsers, async (req, res) => 
{
    try 
    {
        let users = await mongo.getAllUsers()
        redisClient.setex('Users', 60*60, JSON.stringify(users))

        res.send(users)
    }
    catch(err) 
    {
        console.error(`Error: `, err.message)
    }
})

app.listen(port, () => 
{
    console.log(`Aplicación escuchando en puerto: ${port}`)
    console.log(`La aplicación se está ejecutando en el ambiente: '${environment}'`)
    console.log(`Description: '${apiDescription}'`)
})