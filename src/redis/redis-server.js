const redis = require('redis')

const redisClient = redis.createClient(
{
    host: "mysecondclusterinredis.i7nbeo.0001.use1.cache.amazonaws.com",
    port: 6379
})

redisClient.on('error', () =>
{
    console.log('Error connecting to ' + "mysecondclusterinredis.i7nbeo.0001.use1.cache.amazonaws.com" 
    + ':' + 6379 + '.\nCaused by: Connection refused.')
})

module.exports = redisClient