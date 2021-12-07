require('./redis/redis-server')
require('./db/mongoose')
const express = require('express')
const swaggerJsDoc = require('swagger-jsdoc')
const swaggerUI = require('swagger-ui-express')
const swaggerOptions = require('./utils/swaggerOptions')
const helmet = require('helmet')
const { module: config } = require('./config')
const swaggerSpecs = swaggerJsDoc(swaggerOptions)

const cspDefaults = helmet.contentSecurityPolicy.getDefaultDirectives()
delete cspDefaults['upgrade-insecure-requests']

const port = config.APP_PORT || 3000
const environment = config.NODE_ENV
const apiDescription = config.API_DESCRIPTION

const app = express()

app.use(express.json())
app.use(helmet({ contentSecurityPolicy: { directives: cspDefaults }}))
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerSpecs))
app.use('/users', require('./routes/users-route'))
app.use('/products', require('./routes/products-route'))
app.use('/payment', require('./routes/payment-route'))
app.use('/orders', require('./routes/order-route'))

app.listen(port, () => {
    console.log(`Aplicación escuchando en puerto: ${port}`)
    console.log(`La aplicación se está ejecutando en el ambiente: '${environment}'`)
    console.log(`Description: '${apiDescription}'`)
})