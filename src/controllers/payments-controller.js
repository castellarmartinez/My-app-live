const Payment = require('../models/payment-method')

const addPaymentMethod = async (method) =>
{
    try
    {
        const newMethod = new Payment({method})

        return await newMethod.save()
    }
    catch(error)
    {
        return console.log(error.message)
    }
}

const getPaymentMethods = async () =>
{
    try
    {
        const payments = await Payment.find({})
        
        const methods = payments.map((payment) => 
        {
            const {method, option} = payment
            return {method, option}
        })

        return methods
    }
    catch(error)
    {
        return console.log(error.message)
    }
}

const updatePaymentMethods = async (option, method) =>
{    
    try
    {
        const methodModified = await Payment.findOneAndUpdate({option}, method)

        return methodModified
    }
    catch(error)
    {
        return console.log(error.message)
    }
}

const deletePaymentMethods = async (payment) =>
{
    try
    {   
        return await payment.delete()
    }
    catch(error)
    {
        return console.log(error.message)
    }
}

module.exports = {addPaymentMethod, getPaymentMethods, updatePaymentMethods, deletePaymentMethods}