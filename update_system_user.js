require('dotenv').config();
const mongoose = require('mongoose');
const userModel = require('./src/models/user.model');
const accountModel = require('./src/models/account.model');
const connectToDB = require('./src/config/db');

async function updateSystemUser() {
    await connectToDB();
    const email = 'system@test.com';
    
    // 1. Update user
    let user = await userModel.findOne({ email });
    
    if (!user) {
        console.log("User system@test.com not found. Please register it first in Postman.");
        process.exit(1);
    }
    
    user.SystemUser = true;
    await user.save({ validateBeforeSave: false }); // Bypass validation or immutable if needed
    
    // Actually, Model.updateOne works better for immutable fields sometimes
    await userModel.updateOne({ email }, { $set: { SystemUser: true } });
    
    console.log("User updated to SystemUser: true");

    // 2. Update their account
    const accountResponse = await accountModel.updateOne(
        { user: user._id },
        { $set: { systemUser: true } }
    );

    console.log("Account updated to systemUser: true");
    process.exit(0);
}

updateSystemUser();
