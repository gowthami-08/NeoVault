
const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, "Email is required for creating a user"],
        trim: true,
        lowercase: true,
        match: [/^[a-zA-Z0-9_%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "Invalid Email address"],
        unique: [true, "Email already exists"]
    },

    name: {
        type: String,
        required: [true, "Name is required for creating a user"],

    },

    password: {
        type: String,
        required: [true, "Password is required for creating an account"],
        minlength: [6, "Password should contain more that 6 characters"],
        select: false
    },
    SystemUser: {
        type: Boolean,
        default: false,
        immutable: true,
        select: false
    }
}, { timestamps: true })
//this is used when the user wants to change or modify the password in future after changing it it checks the if case 
userSchema.pre("save", async function () {
    if (!this.isModified("password")) {          //this case checks whether the password is modified or not
        return
    }
    const hash = await bcrypt.hash(this.password, 10)   //if the password is changed then the password will be converted to hash 
    this.password = hash   //and the hash will be stored in the database and will again goes into password 
    return
})

//Method to compare the password given by the user matches with the password in the database
userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password)
}

//creating a model
const userModel = mongoose.model("user", userSchema)
module.exports = userModel 