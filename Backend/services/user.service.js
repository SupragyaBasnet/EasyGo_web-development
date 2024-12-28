const userModel = require('../models/user.model');


module.exports.createUser = async ({
    firstname, lastname, phonenumber, password
}) => {
    if (!firstname || !phonenumber || !password) {
        throw new Error('All fields are required');
    }
    const user = userModel.create({
        fullname: {
            firstname,
            lastname
        },
        phonenumber,
        password
    })

    return user;
}