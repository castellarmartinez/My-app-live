const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema(
{
    orderId: 
    {
        type: String,
        unique: true
    },

    products: 
    [
        {
            product: 
            {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
                ref: 'Product'
            },
            
            quantity:
            {
                type: Number,
                required: true
            }
        }
    ],
    
    total:
    {
        type: Number,
        required: true
    },
        
    paymentMethod:
    {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Payment'
    },

    address:
    {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Adress'
    },
    
    state:
    {
        type: String,
        required: true
    },
    
    owner:
    {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
})

orderSchema.pre('save', async function(next)
{
    const order = this

    if(!order.orderId)
    {
        try
        {
            const allOrders = await Order.find({})
            const count = allOrders.length
    
            if(count === 0)
            {
                order.orderId = '#'.concat(1)
            }
            else
            {          
                order.orderId = '#'.concat(count + 1)
            }
        
            next()
        }
        catch(error)
        {
            console.log(error.message)
        }
    }
    else
    {
        next()
    }
})

const Order = mongoose.model('Order', orderSchema)

module.exports = Order