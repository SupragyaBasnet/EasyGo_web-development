const mongoose = require('mongoose');


function connectToDb() {
    mongoose.connect(process.env.DB_CONNECT, {
        useNewUrlParser: true, // Properly parses the MongoDB URI
        useUnifiedTopology: true, // Ensures stable server discovery and monitoring
    }).then(() => {
        console.log('Connected to DB');
    }).catch(err => console.log(err));
}
module.exports = connectToDb;
