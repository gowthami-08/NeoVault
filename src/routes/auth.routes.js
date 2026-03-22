//all the authentication related code will be written here (register and login)
//this is a router file 
// acts like a receptionist. It takes the URL (like /register) and says, "Oh, you want to register? Let me send you to the registration department."


const express = require("express")
const authController = require("../controllers/auth.controllers")

const router = express.Router()

/*POST /api/auth/register*/
router.post("/register", authController.userRegisterController)

/*POST /api/auth/Login*/

router.post("/login", authController.userLoginController)
module.exports = router


/**
 * POST /api/auth/logout
 */
router.post("/logout", authController.userLogoutController)

module.exports = router;