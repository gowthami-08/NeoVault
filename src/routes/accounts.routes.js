const express = require("express")
const authMiddleware = require("../middleware/auth.middleware")
const accountController = require("../controllers/account.controller")
const router = express.Router();

/**
 * POST /api/accounts/
 * create a new account
 * proctected Route
*/
router.post("/", authMiddleware.authMiddleware, accountController.createAccountController)


/**
 * - GET/api/account
 * -Gst all accounts of the logged-in user
 * -Protected ROute
 */
//this api will get/fetch all the accounts of the logged in user
router.get("/", authMiddleware.authMiddleware, accountController.getUserAccountsController)

/**
 * -GET /api/accounts/balance/:accountId
 * 
 */
router.get("/balance/:accountId", authMiddleware.authMiddleware, accountController.getAccountBalanceController)
module.exports = router