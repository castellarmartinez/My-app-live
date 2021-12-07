const redisClient = require("../redis/redis-server")

const cacheProducts = (req, res, next) => {
    redisClient.get('Products', (error, data) => {
        if (error) {
            throw error
        }

        if (data) {
            const products = JSON.parse(data)
            res.json(products)
        }
        else {
            return next()
        }
    })
}

module.exports = cacheProducts