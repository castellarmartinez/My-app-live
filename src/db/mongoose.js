const mongoose = require('mongoose')

const schema = 
{
    name: String, 
    lasName: String, 
    age: Number
}

const Users = mongoose.model("Users", schema)

const uri = "mongodb+srv://Deivic:<password>@firstmongodbatlascluste.qxdyc.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"

mongoose.connect(uri)

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
