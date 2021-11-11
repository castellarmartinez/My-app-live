const mongoose = require('mongoose')
const User = require('./user')

const addressSchema = mongoose.Schema( 
{ 
    address:
    {
        type: String,
        required: true
    },

    option:
    {
        type: Number,
    },

    owner:
    {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
})
    
// addressSchema.pre('save', async function(next)
// {
//     const addresses = this
//     const length = addresses.addressList.length
//     addresses.addressList[length - 1].option = length

//     next()
// })

addressSchema.pre('save', async function(next)
{
    const address = this
    const addresses = await Address.find({owner: address.owner})

    if(addresses.length === 0)
    {
        address.option = 1
    }
    else
    {
        const length = addresses.length
        address.option = length + 1
    }

    next()
})

const Address = mongoose.model('Address', addressSchema)

module.exports = Address