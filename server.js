//to start the server we use this file 
require("dotenv").config()
const app = require('./src/app')
const connectToDB = require("./src/config/db")

connectToDB()

app.listen(3000, (req, res) => {
    console.log("Server is running on port 3000")
})