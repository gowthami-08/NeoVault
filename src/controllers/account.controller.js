const accountModel = require("../models/account.model");
//we have to create a middleware which will check wheather the user logged in or not i.e checking wheather the req recived is from vald user or not
//so to do that we ll use the tokes that were created during the register time

async function createAccountController(req, res) {
    const user = req.user;
    const account = await accountModel.create({
        user: user._id
    })

    res.status(201).json({
        account
    })
}

async function getUserAccountsController(req, res) {
    const accounts = await accountModel.find({ user: req.user._id });
    res.status(200).json({
        accounts
    })
}

async function getAccountBalanceController(req, res) {
    const { accountId } = req.params;

    const account = await accountModel.findOne({
        _id: accountId,
        user: req.user._id
    })

    if (!account) {
        return res.status(404).json({
            message: "Account not found"
        })
    }

    const balance = await account.getBalance();
    res.status(200).json({
        accountId: account._id,
        balance: balance
    })

}
module.exports = {
    createAccountController,
    getUserAccountsController,
    getAccountBalanceController
}