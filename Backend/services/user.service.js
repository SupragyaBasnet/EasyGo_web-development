const userModel = require('../models/user.model');


module.exports.createUser = async ({
    firstname, lastname, phonenumber,email, password
}) => {
    if (!firstname || !phonenumber || !email|| !password) {
        throw new Error('All fields are required');
    }
    const user = userModel.create({
        fullname: {
            firstname,
            lastname
        },
        email,
        phonenumber,
        password
    })

    return user;
}


