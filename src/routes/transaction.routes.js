const { Router } = require('express');
const authMiddleware = require('../middleware/auth.middleware');
const transactionController = require("../controllers/transaction.controller")

const transactionRoutes = Router();

/**
 * -POST /api/transactions/
 * -Creates a new transaction 
 */

transactionRoutes.post("/", authMiddleware.authMiddleware, transactionController.createTransaction)


/**
 * POST /api/transactions/system/initial-funds
 * Create initial funds transaction from system usder
 */
transactionRoutes.post("/system/initial-funds", authMiddleware.authSystemUsermiddleware, transactionController.createInitialFundsTransaction)
module.exports = transactionRoutes;