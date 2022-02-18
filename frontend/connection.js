const mongoose = require('mongoose')
require('dotenv').config()

const connectionPrams = {
    useNewUrlParser: true, 
    useCreateIndex: true,
    useUnifiedTopology: true
    // useFindAndModify: false // We get warnings without this for some reason.
}

const connectDB = mongoose.connect(process.env.MONGO_URI, connectionPrams).then(() => {console.log('connected to mongodb')})
.catch((err) => console.log(err))

module.exports = connectDB
