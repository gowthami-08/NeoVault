const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");
const tokenBlackListModel = require("../models/blackList.model")

async function authMiddleware(req, res, next) {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1]  //this will check wheather the token is present in the cookies or in the headers 

    if (!token) {
        return res.status(401).json({
            message: "Unauthorized access, token is missing"
        })   //if the token is not present in both header and cookie then we will return the error message
    }

    const isBlackListed = await tokenBlackListModel.findOne({ token: token })
    if (isBlackListed) {
        return res.status(401).json({
            message: "Unauthorized access, token is invalid"
        })
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const user = await userModel.findById(decoded.userId)
        req.user = user
        return next() //if the token is valid then we will find the user from the Db and attach it to the request object
    }
    catch (err) {
        return res.status(401).json({
            message: "Unauthorized access, token is invalid"
        })
    }
}

async function authSystemUsermiddleware(req, res, next) {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1]
    if (!token) {
        return res.status(401).json({
            message: "Unauthorized access, token is missing"
        })
    }

    const isBlacklisted = await tokenBlackListModel.findOne({ token })
    if (isBlacklisted) {
        return res.status(401).json({
            message: "Unauthorized access, token is invalid"
        })
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const user = await userModel.findById(decoded.userId).select("+SystemUser")
        if (!user.SystemUser) {
            return res.status(403).json({
                message: "Forbidden access, user not found"
            })
        }

        req.user = user
        return next() //if the token is valid then we will find the user from the Db and attach it to the request object
    }
    catch (err) {
        return res.status(401).json({
            message: "Unauthorized access, token is invalid"
        })
    }
}


module.exports = {
    authMiddleware,
    authSystemUsermiddleware,
}