const redisClient = require("../redis/redis-server")

const cacheUsers = (req, res, next) =>
{
    redisClient.get('Users', (error, data) =>
    {
        try
        {
            if(error)
            {
                throw error
            }

            if(data)
            {
                const users = JSON.parse(data)
                res.json(users)
            }
            else
            {
                console.log('Data no stored in cached.')
                next()
            }
        }
        catch(err)
        {
            console.error(`Error: `, err.message)
        }
    })
}

module.exports = cacheUsers