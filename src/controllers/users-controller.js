const jwt = require('jsonwebtoken')
const User = require('../models/user')
const Address = require('../models/address')
const {module: config} = require('../config')
const Order = require('../models/order')

exports.addUser = async (newUser) =>
{   
    const user = new User(newUser)

    try
    {
        return await user.save()
    }
    catch(error)
    {
        return console.log(error.message)
    }
}

exports.addAddress = async (address, user) =>
{   
    const addressInfo = 
    {
        address,
        owner: user._id
    }

    const newAddress = new Address(addressInfo)
    
    try
    {
        return await newAddress.save()
    }
    catch(error)
    {
        return console.log(error.message)
    }
}

exports.getUsers = async () =>
{
    try
    {
        const users = await User.find({})
        
        const userList = users.map((user) => 
        {
            const {name, usermane, email, phone, isAdmin, isActive} = user
            return {name, usermane, email, phone, isAdmin, isActive}
        })

        return userList
    }
    catch(error)
    {
        return console.log(error.message)
    }
}

exports.getAddressList = async (user) =>
{
    try
    {
       const addresses = await Address.find({owner: user._id})

       if(addresses.length > 0)
       {
           const userAddresses = addresses.map((element) => 
           {
                return {address: element.address, option: element.option}
           })

           return userAddresses
       }

       else
       {
            return 'You do not have addresses saved.'
       }
    }
    catch(error)
    {
        return console.log(error.message)
    }
}

exports.userLogIn = async (user) =>
{   
    try
    {
        const token = jwt.sign({_id: user._id.toString()}, config.SECRET_PASS)
        user.token = token
        await user.save()

        return token
    }
    catch(error)
    {
        return console.log(error.message)
    }
}

exports.userLogOut = async (user) =>
{   
    try
    {
        user.token = ''

        return await user.save()
    }
    catch(error)
    {
        return console.log(error.message)
    }
}

exports.suspendUser = async (user, order) =>
{   
    try
    {
        user.isActive = !user.isActive
        user.token = ''
        const hasOpenOrder = await Order.findOne({owner: user._id})

        if(hasOpenOrder)
        {
            hasOpenOrder.state = 'cancelled'
            await hasOpenOrder.save()
        }

        const success = await user.save()
        const message = user.isActive ? 'unsuspended.' : 'suspended.'

        return {success, message}
    }
    catch(error)
    {
        return console.log(error.message)
    }
}