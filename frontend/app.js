const express = require('express')
const path = require('path')
const route = require('./routers/user')
const connectDB = require('./connection')
require('dotenv').config()

const PORT = process.env.PORT || 8080

// app setup
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// static setup
const assetsPath=path.join(__dirname,'./views')
app.set('view engine', 'pug')
app.use(express.static(assetsPath))

// load routers
app.use(route)

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`)
})

