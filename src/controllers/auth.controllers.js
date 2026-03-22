// auth.controller.js is that department. It's where the actual processing happens.
//r 

// userRegisterController
//  function, its job is to:

// Receive the Data: It takes the data the user sent in their request (like email, password, and name from req.body).
// Process the Data (Business Logic): It will check if the user already exists, hash their password (though your model handles some of this), and use the userModel to try and save them to the database.
// Send a Response: Finally, it determines what to tell the user. It will either send back a "Success! Account created" message (res.send(...)) or an "Error: Email already in use" message.


const userModel = require("../models/user.model")
const jwt = require("jsonwebtoken")
const emailService = require("../services/email.service")
const tokenBlackListModel = require("../models/blackList.model")

/*
* -user register controller
* -POST /api/auth/register
*/
//
async function userRegisterController(req, res) {
    const { email, password, name } = req.body
    const isExists = await userModel.findOne({
        email: email
    })
    if (isExists) {
        return res.status(422).json({
            message: "User already exists with this email",
            status: "failed"
        })
    }
    const user = await userModel.create({
        email, password, name

    })

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "3d" })
    res.cookie("token", token)
    res.status(201).json({
        user: {
            _id: user._id,
            email: user.email,
            name: user.name
        },
        token
    })

    await emailService.sendRegistrationEmail(user.email, user.name)
}

/**
 * - UserLogin Controller
* - POST/api/auth/login
*/

async function userLoginController(req, res) {
    const { email, password } = req.body
    const user = await userModel.findOne({
        email
    }).select("+password")
    if (!user) {
        return res.status(401).json({
            message: "Email or password is invalid"
        })
    }
    const isValidPassword = await user.comparePassword(password)
    if (!isValidPassword) {
        return res.status(401).json({
            message: "Email or password is invalid"
        })
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "3d" })
    res.cookie("token", token)
    res.status(200).json({
        user: {
            _id: user._id,
            email: user.email,
            name: user.name
        },
        token
    })
}


async function userLogoutController(req, res) {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1]
    if (!token) {
        return res.status(200).json({
            message: "User logged out succesfully"
        })
    }
    res.clearCookie("token")
    await tokenBlackListModel.create({
        token: token
    })
    res.status(200).json({
        message: "User logged out successfully"
    })
}

module.exports = {
    userRegisterController,
    userLoginController,
    userLogoutController
}