const mongoose = require('mongoose')
const redisClient = require('../redis/redis-server')
const {module: config} = require('../config')
const User = require('../models/user')

const uri = `mongodb+srv://${config.MONGODB_USER}:${config.MONGODB_PASSWORD}\
@${config.MONGODB_CLUSTER}/${config.DB_NAME}?retryWrites=true&w=majority`

async function database()
{
    try
    {
        await mongoose.connect(uri)
        console.log('Connected to the database:', config.DB_NAME)
    }
    catch(err)
    {
        console.error(err.message)
    }
}

database()


