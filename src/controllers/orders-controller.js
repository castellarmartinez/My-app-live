const Address = require('../models/address')
const Order = require('../models/order')
const Payment = require('../models/payment-method')
const Product = require('../models/product')
const User = require('../models/user')

exports.addOrder = async (product, quantity, payment, theAddress, state, user) =>
{
    try
    {
        const newOrder = 
        {
            products:
            [
                {
                    product: product._id,
                    quantity
                }
            ],

            paymentMethod: payment._id,

            total: product.price * quantity,

            address: theAddress._id,

            state,

            owner: user._id
        }

        const order = new Order(newOrder)

        return await order.save()
    }
    catch(error)
    {
        return console.log(error.message)
    }
}

exports.getOrders = async () =>
{
    try
    {
        const result = await Order.find({})
        let orders = []

        for(let i = 0; i < result.length; i++)
        {
            const {orderId, products, total, paymentMethod, address:thisAddress, state, owner} = result[i]
            let productList = []

            for(let j = 0; j < products.length; j++)
            {
                const {ID, name, price} = await Product.findById(products[j].product)
                const quantity = products[j].quantity
                productList[j] = {ID, name, price, quantity}
            }

            const {method} = await Payment.findById(paymentMethod)
            const {address} = await Address.findOne(thisAddress)
            const {name, email} = await User.findById(owner)
            orders[i] = {orderId, products:productList, total, paymentMethod:method, 
                address, state, name, email}
        }

        return orders
    }
    catch(error)
    {
        return console.log(error.message)
    }
}

exports.getOrdersByUser = async (orders) =>
{
    try
    {
        let ordersList = []

        for(let i = 0; i < orders.length; i++)
        {
            const {products, total, paymentMethod, state, address:thisAddress} = orders[i]
            let productList = []

            for(let j = 0; j < products.length; j++)
            {
                const {ID, name, price} = await Product.findById(products[j].product)
                const quantity = products[j].quantity
                productList[j] = {ID, name, price, quantity}
            }

            const {method} = await Payment.findById(paymentMethod)
            const {address} = await Address.findById(thisAddress)

            ordersList[i] = {products:productList, total, paymentMethod:method,
                address, state}
        }

        return ordersList
    }
    catch(error)
    {
        return console.log(error.message)
    }
}

exports.addProductToOrder = async (product, quantityToAdd, order) =>
{
    try
    {
        order.total += quantityToAdd * product.price
        let hasProduct = false

        for(let i = 0; i < order.products.length; i++)
        {
            if(JSON.stringify(order.products[i].product) === JSON.stringify(product._id))
            {
                order.products[i].quantity += quantityToAdd
                hasProduct = true
                break
            }
        }

        if(!hasProduct)
        {
            order.products.push({product: product._id, quantity: quantityToAdd})
        }

        return await order.save()
    }
    catch(error)
    {
        return console.log(error.message)
    }
}

exports.removeProductFromOrder = async (product, quantityToRemove, order) =>
{
    try
    {
        const original = order.products.filter((element) => 
        JSON.stringify(element.product) === JSON.stringify(product._id))
        const originalQuantity = original[0].quantity

        if(originalQuantity < quantityToRemove)
        {
            throw new Error('You cannot remove a quantity greater than the original quantity.')
        }
        else if(originalQuantity === quantityToRemove)
        {
            const orderUpdate = removeAllAmounts(order, quantityToRemove, product)

            return await orderUpdate.save()
        }
        else // no removal of all units
        {
            const orderUpdate = decreaseAmount(order, originalQuantity, quantityToRemove, product)

            return await orderUpdate.save()
        }
    }
    catch(error)
    {
        return console.log(error.message)
    }
}

exports.updatePaymentInOrder = async (payment, order) =>
{
    try
    {
        order.paymentMethod = payment._id

        return await order.save()
    }
    catch(error)
    {
        return console.log(error.message)
    }
}

exports.updateOrderState = async (state, order) =>
{
    try
    {
        order.state = state

        return await order.save()
    }
    catch(error)
    {
        return console.log(error.message)
    }
}

exports.updateAddress = async (address, order) =>
{
    try
    {
        order.address = address._id

        return await order.save()
    }
    catch(error)
    {
        return console.log(error.message)
    }
}

function removeAllAmounts(order, quantityToRemove, product)
{
    order.total -= quantityToRemove * product.price

    for(let i = 0; i < order.products.length; i++)
    {
        if(JSON.stringify(order.products[i].product) === JSON.stringify(product._id))
        {
            order.products.splice(i, 1)
            break
        }
    }

    return order
}

function decreaseAmount(order, originalQuantity, quantityToRemove, product)
{
    const newQuantity = originalQuantity - quantityToRemove
    order.total -= quantityToRemove * product.price
    
    for(let i = 0; i < order.products.length; i++)
    {
        if(JSON.stringify(order.products[i].product) === JSON.stringify(product._id))
        {
            order.products[i].quantity = newQuantity
            break
        }
    }

    return order
}