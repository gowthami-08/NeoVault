const transactionModel = require("../models/transaction.model")
const ledgerModel = require("../models/ledger.model")
const accountModel = require("../models/account.model")
const emailService = require("../services/email.service")
const mongoose = require("mongoose")

/**
 * -Create a new transaction
 * THE 10-STEP TRANSFER FLOW:
 * 1. Validate req
 * 2.Validate idempotency key
 * 3.Check account status
 * 4.Derive sender balance from ledger
 * 5.Create transaction (PENDING)
 * 6.Create DEBIT ledger entry
 * 7.Create CREDIT ledger entry
 * 8. Mark Transaction COMPLETED
 * 9.Commit MongoDB session
 * 10. Send email notification
 */

async function createTransaction(req, res) {
    /**
     * 1.Validate request 
     */
    const { fromAccount, toAccount, amount, idempotencyKey } = req.body

    //validate the request 
    if (!fromAccount || !toAccount || !amount || !idempotencyKey) {
        return res.status(400).json({
            message: "FromAccount, toAccount, amount and idempotencyKey are required"
        })
    }

    const fromUserAccount = await accountModel.findOne({
        _id: fromAccount,
    })

    const toUseraccount = await accountModel.findOne({
        _id: toAccount,
    })

    if (!fromUserAccount || !toUseraccount) {
        return res.status(400).json({
            message: "Invalid fromAccount or toAccount"
        })
    }

    /**
     * Validate idempotency Key
     * Purpose: It prevents duplicate transactions if a network error occurs or if the user clicks a button multiple times.
     * Process: When a request is made, a unique key (e.g., x y z) is generated for that specific transaction.
     * Validation: The server checks if a transaction already exists for that key. If a pending transaction with that key already exists, the server will not initiate a new one, thereby preventing duplicate processing 
     */

    const isTransactionAlreadyExists = await transactionModel.findOne({
        idempotencyKey: idempotencyKey
    })

    if (isTransactionAlreadyExists) {
        if (isTransactionAlreadyExists.status === "COMPLETED") {
            return res.status(200).json({
                message: "Transaction already processed",
                transaction: isTransactionAlreadyExists
            })
        }
        if (isTransactionAlreadyExists.status === "PENDING") {
            return res.status(200).json({
                message: "Transaction already in progress",

            })
        }
        if (isTransactionAlreadyExists.status === "FAILED") {
            return res.status(500).json({
                message: "Transaction already failed",

            })
        }
        if (isTransactionAlreadyExists.status === "REVERSED") {
            return res.status(500).json({
                message: "Transaction already reversed, Please try again",

            })
        }
    }

    /**
     * 3.Check account status
     */
    if (fromUserAccount.status !== "ACTIVE") {
        return res.status(400).json({
            message: "From account is not active"
        })
    }
    if (toUseraccount.status !== "ACTIVE") {
        return res.status(400).json({
            message: "To account is not active"
        })
    }


    /**
     * 4.Derive sender balance from ledger
     */
    const balance = await fromUserAccount.getBalance()
    if (balance < amount) {
        res.status(400).json({
            message: `Insufficient Balaance. Current Blance is ${balance}. Requested amount is ${amount}`
        })
    }

    /**
     * 5.Create transaction (PENDING)
     */
    const session = await mongoose.startSession()
    session.startTransaction()

    const [transaction] = await transactionModel.create([{
        fromAccount,
        toAccount,
        amount,
        idempotencyKey,
        status: "PENDING"
    }], { session })


    const [debitLedgerEntry] = await ledgerModel.create([{
        account: fromAccount,
        amount: amount,
        type: "DEBIT",
        transaction: transaction._id,
    }], { session })

    const [creditLedgerEntry] = await ledgerModel.create([{
        account: toAccount,
        amount: amount,
        type: "CREDIT",
        transaction: transaction._id,

    }], { session })

    transaction.status = "COMPLETED"
    await transaction.save({ session })

    await session.commitTransaction()
    session.endSession()

    /**
     * 10. Send email notification
     */
    await emailService.sendTransactionEmail(req.user.email, req.user.name, amount, toUseraccount.user)
    return res.status(200).json({
        message: "Transaction completed successfully",
        transaction
    })
}

async function createInitialFundsTransaction(req, res) {
    const { toAccount, amount, idempotencyKey } = req.body
    if (!toAccount || !amount || !idempotencyKey) {
        return res.status(400).json({
            message: "toAccount, amount and idempotencyKey are required"
        })
    }
    const toUseraccount = await accountModel.findOne({
        _id: toAccount,
    })
    if (!toUseraccount) {
        return res.status(400).json({
            message: "Invalid toAccount"
        })
    }

    const fromUserAccount = await accountModel.findOne({
        user: req.user._id
    })
    if (!fromUserAccount) {
        return res.status(400).json({
            message: "Invalid fromAccount"
        })
    }

    const session = await mongoose.startSession()
    session.startTransaction()

    //the transaction model here is saved at client side not in the Database
    const transaction = new transactionModel({
        fromAccount: fromUserAccount._id,
        toAccount,
        amount,
        idempotencyKey,
        status: "PENDING"
    })

    const debitLedgerEntry = await ledgerModel.create([{
        account: fromUserAccount._id,
        amount: amount,
        transaction: transaction._id,
        type: "DEBIT",
    }], { session })


    const creditLedgerEntry = await ledgerModel.create([{
        account: toAccount,
        amount: amount,
        transaction: transaction._id,
        type: "CREDIT",

    }], { session })

    transaction.status = "COMPLETED"
    await transaction.save({ session })

    await session.commitTransaction()
    session.endSession()

    return res.status(201).json({
        message: "Transaction completed successfully",
        transaction: transaction
    })
}

module.exports = {
    createTransaction,
    createInitialFundsTransaction
}
