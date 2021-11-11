const redis = require('redis')
const {module: config} = require('../config')

const redisClient = redis.createClient(
{
    host: config.REDIS_HOST,
    port: config.REDIS_PORT
})

redisClient.on('error', () =>
{
    console.error('Error connecting to ' + config.REDIS_HOST 
    + ':' + config.REDIS_PORT + '.\nCaused by: Connection refused.')
})

module.exports = redisClient