const Joi = require('joi')
const Payment = require('../models/payment-method')

const PaymentSchema = Joi.object(
{
    method: 
        Joi.string()
        .min(3)
        .max(32)
        .required()
})

// Middlewares

const tryValidMethod = async (req, res, next) => 
{
    const newMethod = req.body

    try
    {
        await PaymentSchema.validateAsync(newMethod)

        next()
    }
    catch(error)
    {
        if(error.message.includes('"method"'))
        {
            res.status(400).send('The method\'s name must have a length between ' 
            + '3-32 characters and only contain letters, numbers and spaces.')
        }
        else
        {
            res.status(400).send('The fields you are trying to add are not allowed.')
        }
    }
}

const tryMethodUpdate = async (req, res, next) => 
{
    const option = req.params.id

    try
    {
        const exist = await Payment.findOne({option})

        if(!exist)
        {
            res.status(400).send('The method you are trying to update' + 
            '/delete does not exist.')
        }
        else
        {
            req.payment = exist
            next()
        }
    }
    catch(error)
    {
        res.status(400).send('Unexpected error in registered method.')
    }
}

module.exports = {tryValidMethod, tryMethodUpdate}