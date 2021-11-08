const mongoose = require('mongoose')

const schema = 
{
    name: String, 
    lastName: String, 
    age: Number
}

const Users = mongoose.model("Users", schema)

const uri = "mongodb+srv://admin:David007@firstmongodbatlascluste.qxdyc.mongodb.net/FirstMongoDBAtlasCluster?retryWrites=true&w=majority"

async function database()
{
    try
    {
        await mongoose.connect(uri)
    }
    catch(err)
    {
        console.log(err.message)
    }
}

database()

exports.addNewUser = async function addNewUser() 
{
    const newPerson = 
    {
        name: "Juan", 
        lastName: "Perez", 
        age: 24
    }

    let newUser = new Users(newPerson)
    await newUser.save()
}

exports.getAllUsers = async function getAllUsers()
{
	return await Users.findOne({name: "Juan"})
}
