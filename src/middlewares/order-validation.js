const Joi = require("joi");
const Address = require("../models/address");
const Order = require("../models/order")
const Payment = require("../models/payment-method");
const Product = require("../models/product");

const OrderSchema = Joi.object(
{
    payment: 
        Joi.number()
        .min(1)
        .required(),

    quantity:
        Joi.number()
        .min(1)
        .required(),

    state:
        Joi.string().
        valid('open', 'closed').
        required(),

    address:
        Joi.number()
        .required()
})

// Funciones usadas para crear los middlewares

function orderErrorMessage(message)
{
    if(message.includes('"payment"'))
    {
        return 'You need to use an existing ' +
        'payment method (payment).'
    }
    else if(message.includes('"state"'))
    {
        return 'Only "open" and "closed" are valid states' +
        ' for new orders.'
    }
    else if(message.includes('"quantity"'))
    {
        return 'The product quantity must be greater than 0.'
    }
    else if(message.includes('"address"'))
    {
        return 'You need to provide an adress.'
    }
    else
    {
        return error.message
    }
}

function stateAdmin(state)
{
    let stateValid = false;

    switch(state)
    {
        case 'preparing':
        case 'shipping':
        case 'cancelled':
        case 'delivered':
            stateValid = true
            break
        default:
            break
    }

    return stateValid;
}

function stateCustomer(state)
{
    let stateValid = false;

    switch(state)
    {
        case 'confirmed':
        case 'cancelled':
            stateValid = true
            break
        default:
            break
    }

    return stateValid
}

// Middlewares

const tryOpenOrder = async (req, res, next) => 
{
    const user = req.user
    const order = await Order.findOne({owner: user._id, state: 'open'})

    if(order)
    {
        res.status(409).send('You can\'t have more than one open order.\n' +
        'Close or cancel that order to be able to create another order.')
    }
    else
    {
        next()
    }
}

const tryCanEditOrder = async (req, res, next) => 
{
    const user = req.user
    const order = await Order.findOne({owner: user._id, state: 'open'})

    if(order)
    {
        req.order = order
        next()
    }
    else
    {
        res.status(409).send('You don\'t have any open order you can edit.')
    }
}

const tryValidOrder = async (req, res, next) => 
{
    const newOrder = req.body
    const user = req.user

    try
    {
        await OrderSchema.validateAsync(newOrder)
        const {payment, address} = newOrder
        const methodExist = await Payment.findOne({option: payment})
        const addressExist = await Address.findOne({owner: user._id, option: address})

        if(!methodExist)
        {
            throw new Error('"payment"')
        }
        else if(!addressExist)
        {
            throw new Error('"address"')
        }
        else
        {
            req.payment = methodExist
            req.address = addressExist
            next()
        }
    }
    catch(error)
    {
        const message = orderErrorMessage(error.message)
        res.status(400).send(message)
    }
}

const tryHaveOrders = async (req, res, next) => 
{
    const user = req.user
    const orders = await Order.find({owner: user._id})

    if(orders.length > 0)
    {
        req.orders = orders
        next()
    }
    else
    {
        res.status(404).send('You do not have orders.')
    }
}

const tryValidAddition = async (req, res, next) => 
{
    const {quantity} = req.query;
    const validQuantity = quantity % 1 === 0 && quantity > 0

    if(validQuantity)
    {
        next()
    }
    else
    {
        res.status(400).send('The units to add must be greater than 0.')
    }
}

const tryValidElimination = async (req, res, next) =>
{
    const ID = req.params.id
    const user = req.user
    const {quantity} = req.query
    const validQuantity = quantity % 1 === 0 && quantity > 0

    if(!validQuantity)
    {
        res.status(400).send('The units to remove must be greater than 0.')
    }
    else
    {
        const product = await Product.findOne({ID})
        const order = await Order.findOne({owner: user._id, state: "open", 
        "products.product": product._id})
    
        if(order)
        {
            req.order = order
            next()
        }
        else
        {
            res.status(400).send('You do not have an open order with the product '
            + 'you are trying to remove.')
        }
    }
}

const tryValidStateCustomer = (req, res, next) => 
{
    const {state} = req.query

    if(stateCustomer(state))
    {
        next()
    }
    else
    {
        res.status(400).send('The state could not be changed.\n' +
         'Only "confirmed" and "cancelled" are valid.')
    }
}

const tryValidStateAdmin = (req, res, next) => 
{
    const {state} = req.query

    if(stateAdmin(state))
    {
        next()
    }
    else
    {
        res.status(400).send('The state could not be changed.\n' +
        'Only "preparing", "shipping", "cancelled" and "delivered" are valid.')
    }
}

const tryOrderExist = async (req, res, next) => 
{
    const {orderId} = req.query
    const order = await Order.findOne({orderId})

    if(order)
    {
        req.order = order
        next()
    }
    else{
        res.status(404).send('The order you are trying to edit does not exist.')
    }
}

module.exports = {tryOpenOrder, tryValidOrder, tryHaveOrders, 
    tryCanEditOrder, tryValidAddition, tryValidElimination, tryValidStateCustomer,
    tryValidStateAdmin, tryOrderExist}