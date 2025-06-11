const express = require('express')
const db = require('./config/db')

const app = express()
db()
app.listen(5000, () => { console.log("Server up")})
