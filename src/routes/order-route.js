const express = require('express')
const { addOrder, getOrders, getOrdersByUser, addProductToOrder, 
    removeProductFromOrder, updatePaymentInOrder,updateOrderState, 
    updateAddress } = require('../controllers/orders-controller')
const { customerAuthentication, adminAuthentication } = 
require('../middlewares/auth')
const { tryOpenOrder, tryValidOrder, tryHaveOrders, tryCanEditOrder, 
    tryValidAddition, tryValidElimination, tryValidStateCustomer, 
    tryValidStateAdmin, tryOrderExist} = require('../middlewares/order-validation')
const { tryMethodUpdate } = require('../middlewares/payment-validation')
const { tryProductExist } = require('../middlewares/product-validation')
const { tryAddressExist } = require('../middlewares/user-validation')

const router = express.Router()

/**
 * @swagger
 * /orders/add/{productId}:
 *  post:
 *      tags: [Orders]
 *      summary: Make an order.
 *      description: Allow addition of new orders.
 *      parameters:
 *      -   name: "productId"
 *          in: "path"
 *          required: true
 *          type: "string"
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/add'
 *      responses:
 *          201:
 *              description: Order created.
 *          400:
 *              description: Order data is invalid.
 *          403:
 *              description: You need to be authenticate to perform this operation.
 *          409:
 *              description: You have an open order.
 *          500:
 *              description: Internal error.
 */

router.post('/add/:id/', customerAuthentication, tryProductExist, 
tryOpenOrder, tryValidOrder, async (req, res) => 
{
    const product = req.product
    const payment = req.payment
    const address = req.address
    const {quantity, state} = req.body
    const user = req.user

    const success = await addOrder(product, quantity, payment, address, state, user)

    if(success)
    {
        res.status(201).send('The order has been added.')
    }
    else
    {
        res.status(500).send('Unable to add order.')
    }
})

/**
 * @swagger
 * /orders/list:
 *  get:
 *      tags: [Orders]
 *      summary: Obtain all orders.
 *      description: Allow to see all orders.
 *      parameters: []
 *      responses:
 *          200:
 *              description: Successful operation.
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: array
 *                          items:
 *                              $ref: '#/components/schemas/list'
 *          403:
 *              description: You need admin privilages to perform this operation.
 *          500:
 *              description: Internal error.
 */

router.get('/list', adminAuthentication, async (req, res) => 
{
    const orders = await getOrders()

    if(orders)
    {
        res.status(200).json(orders)
    }
    else
    {
        res.status(500).send('Could not access orders.')
    }
})

/**
 * @swagger
 * /orders/history:
 *  get:
 *      tags: [Orders]
 *      summary: Obtain all orders made by an user.
 *      description: Allow to see all user's orders.
 *      parameters: []
 *      responses:
 *          200:
 *              description: Successful operation.
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: array
 *                          items:
 *                              $ref: '#/components/schemas/history'
 *          403:
 *              description: You need to be logged in as a customer.
 *          404:
 *              description: You do not have orders.
 *          500:
 *              description: Internal error.
 */

router.get('/history', customerAuthentication, tryHaveOrders, async (req, res) => 
{
    const orders = req.orders
    const ordersDetails = await getOrdersByUser(orders)

    if(ordersDetails)
    {
        res.status(200).json(ordersDetails)
    }
    else
    {
        res.status(500).send('Could not access this user\'s orders.')
    }
})

/**
 * @swagger
 * /orders/addProduct/{productId}:
 *  put:
 *      tags: [Orders]
 *      summary: Add a new product to an order. 
 *      description: Allow addition of a new product in the order.
 *      parameters:
 *      -   name: "productId"
 *          in: "path"
 *          required: true     
 *      -   name: "quantity"
 *          in: "query"
 *          required: true     
 *      responses:
 *          200:
 *              description: Succesful operation.
 *          400:
 *              description: Order data is invalid.
 *          401:
 *              description: You need to be logged in as a customer.
 *          409:
 *              description: You cannot edit orders.
 *          500:
 *              description: Internal error.
 */

router.put('/addProduct/:id/', customerAuthentication, tryCanEditOrder, 
tryProductExist, tryValidAddition, async (req, res) => 
{
    const order = req.order
    const {quantity} = req.query
    const quantityToAdd = parseInt(quantity, 10)
    const product = req.product
    const success = await addProductToOrder(product, quantityToAdd, order)
    
    if(success)
    {
        res.status(200).send('The product has been added to the order.')
    }
    else
    {
        res.status(500).send('Could not add the product.')
    }
})

/**
 * @swagger
 * /orders/removeProduct/{productId}:
 *  put:
 *      tags: [Orders]
 *      summary: Delete a product from an order. 
 *      description: Allow elimination of products in an order.
 *      parameters:
 *      -   name: "productId"
 *          in: "path"
 *          required: true     
 *      -   name: "quantity"
 *          in: "query"
 *          required: true     
 *      responses:
 *          200:
 *              description: Succesful operation.
 *          400:
 *              description: Order data is invalid.
 *          401:
 *              description: You need to be logged in as a customer.
 *          409:
 *              description: You cannot edit orders.
 *          500:
 *              description: Internal error.
 */

router.put('/removeProduct/:id/', customerAuthentication, tryCanEditOrder,
tryProductExist, tryValidElimination, async (req, res) => 
{
    const {quantity} = req.query
    const quantityToRemove = parseInt(quantity, 10)
    const product = req.product
    const order = req.order
    const success = await removeProductFromOrder(product, quantityToRemove, order)
    
    if(success)
    {
        res.status(200).send('The product has been deleted/reduced from the order.')
    }
    else
    {
        res.status(500).send('Could not delete/reduce the product.')
    }
})

/**
 * @swagger
 * /orders/updatePayment/{option}:
 *  put:
 *      tags: [Orders]
 *      summary: Change payment method in an order. 
 *      description: Allow changing the payment method in an order.
 *      parameters:
 *      -   name: "option"
 *          in: "path"
 *          required: true      
 *      responses:
 *          200:
 *              description: Succesful operation.
 *          400:
 *              description: Order data is invalid.
 *          401:
 *              description: You need to be logged in as a customer.
 *          409:
 *              description: You cannot edit orders.
 *          500:
 *              description: Internal error.
 */

router.put('/updatePayment/:id', customerAuthentication, tryCanEditOrder, 
tryMethodUpdate, async (req, res) => 
{
    const payment = req.payment
    const order = req.order
    const success = await updatePaymentInOrder(payment, order)
    
    if(success)
    {
        res.status(200).send('The payment method has been changed.')
    }
    else
    {
        res.status(500).send('Could not change the payment method.')
    }
})

/**
 * @swagger
 * /orders/updateAddress:
 *  put:
 *      tags: [Orders]
 *      summary: Change orders address. 
 *      description: Allow changing the address in an order.
 *      parameters:
 *      -   name: "option"
 *          in: "query"
 *          required: true      
 *      responses:
 *          200:
 *              description: Succesful operation.
 *          400:
 *              description: Order data is invalid.
 *          401:
 *              description: You need to be logged in as a customer.
 *          409:
 *              description: You cannot edit orders.
 *          500:
 *              description: Internal error.
 */

router.put('/updateAddress', customerAuthentication, tryCanEditOrder, 
tryAddressExist, async (req, res) => 
{
    const address = req.address
    const order = req.order
    const success = await updateAddress(address, order)
    
    if(success)
    {
        res.status(200).send('The address has been updated.')
    }
    else
    {
        res.status(500).send('Could not change the address.')
    }
})

/**
 * @swagger
 * /orders/updateState/customer:
 *  put:
 *      tags: [Orders]
 *      summary: Change the state in an order. 
 *      description: Allow changing the state in an order.
 *      parameters:
 *      -   name: "state"
 *          in: "query"
 *          required: true
 *          type: "array"
 *          items:
 *          schema:
 *              type: "string"
 *              enum:
 *              -   "confirmed"
 *              -   "cancelled"        
 *      responses:
 *          200:
 *              description: Successful operation.
 *          401:
 *              description: You need to be logged in as a customer.
 *          409:
 *              description: You cannot edit orders.
 *          500:
 *              description: Internal error.
 */

router.put('/updateState/customer', customerAuthentication, tryCanEditOrder, 
tryValidStateCustomer, async (req, res) => 
{
    const {state} = req.query
    const order = req.order
    const success = await updateOrderState(state, order)
    
    if(success)
    {
        res.status(200).send('The order\'s state has been changed.')
    }
    else
    {
        res.status(500).send('Could not change the order\'s state.')
    }
})

/**
 * @swagger
 * /orders/updateState/admin:
 *  put:
 *      tags: [Orders]
 *      summary: Change the state or the orders as an admin. 
 *      description: Allow changin the state of the orders.
 *      parameters:
 *      -   name: "orderId"
 *          in: "query"
 *          required: true
 *          type: "string"
 *      -   name: "state"
 *          in: "query"
 *          required: true
 *          type: "array"
 *          items:
 *          schema:
 *              type: "string"
 *              enum:
 *              -   "preparing"
 *              -   "shipping"
 *              -   "cancelled"
 *              -   "delivered"         
 *      responses:
 *          200:
 *              description: Successful operation.
 *          401:
 *              description: You need admin privileges to perform this operation.
 *          500:
 *              description: Internal error.
 */

router.put('/updateState/admin', adminAuthentication, tryOrderExist, 
tryValidStateAdmin, async (req, res) => 
{
    const {state} = req.query
    const order = req.order
    const success = await updateOrderState(state, order)
    
    if(success)
    {
        res.status(200).send('The order\'s state has been changed.')
    }
    else
    {
        res.status(500).send('Could not change the order\'s state.')
    }
})

/**
 * @swagger
 * tags:
 *  name: Orders
 *  description: Orders section
 * 
 * components: 
 *  schemas:
 *      list:
 *          type: object
 *          properties:
 *              name:
 *                  type: string
 *              username:
 *                  type: string
 *              email:
 *                  type: string
 *              phone:
 *                  type: integer
 *              address:
 *                  type: string
 *              total:
 *                  type: integer
 *              payment:
 *                  type: string
 *              order:
 *                  type: string
 *              state:
 *                  type: string
 *          example:
 *              name: Pancracio Anacleto
 *              username: panacleto
 *              email: señorpancracio@nubelar.com
 *              phone: 4630107
 *              address: Calle los ahogados
 *              description: 1xArepa 3xPandebonos
 *              total: 36000
 *              payment: Efectivo
 *              order: '#16'
 *              state: confirmado
 */

/**
 * @swagger
 * tags:
 *  name: Orders
 *  description: Orders section
 * 
 * components: 
 *  schemas:
 *      history:
 *          type: object
 *          properties:
 *              total:
 *                  type: integer
 *              payment:
 *                  type: string
 *              order:
 *                  type: string
 *              state:
 *                  type: string
 *          example:
 *              address: Calle los ahogados
 *              description: 1xArepa 3xPandebonos
 *              total: 36000
 *              payment: Efectivo
 *              order: '#16'
 *              state: confirmado
 */

/**
 * @swagger
 * tags:
 *  name: Orders
 *  description: Orders section
 * 
 * components: 
 *  schemas:
 *      add:
 *          type: object
 *          properties:
 *              qunatity:
 *                  type: integer
 *              payment:
 *                  type: integer
 *              state:
 *          example:
 *              quantity: 5
 *              payment: 2
 *              address: 1
 *              state: open
 */


module.exports = router;
