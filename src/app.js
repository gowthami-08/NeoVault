//The main agenda of the file is 1. to create the server instance & 2.to configure the server Configure means -- the API's we are going to use and what middleware's we are going to use 

const express = require("express")
const cookieParser = require("cookie-parser")

//Routes required
const authRouter = require("./routes/auth.routes")
const accountRouter = require("./routes/accounts.routes")
const transactionRouter = require("./routes/transaction.routes")

const app = express()


app.use(express.json()) //this is used to parse the json data from the request body (middleware)
app.use(cookieParser())

//use Router
app.use("/api/auth", authRouter)  //whenever the user hits the server with /api/auth it will be directed to authRouter
app.use("/api/accounts", accountRouter) //whenever the user hits the server with /api/accounts it will be directed to accountRouter
app.use("/api/transactions", transactionRouter)


module.exports = app;