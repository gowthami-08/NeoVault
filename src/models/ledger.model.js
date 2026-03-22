//ledgerSystem is a type of system where we keep a log of the user accounts ike the user's debited account , credited account, and the balance 
const mongoose = require("mongoose")

//creating the ledgerSystem Schema
const ledgerSchema = new mongoose.Schema({
    account: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "account",
        required: [true, "Ledger must be associated with an account"],
        index: true,
        immutable: true
    },

    amount: {
        type: Number,
        required: [true, "Amount is required for creating a ledger entry"],
        immutable: true
    },
    transaction: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "transaction",
        required: [true, "Ledger must be associated with an account"],
        index: true,
        immutable: true
    },
    type: {
        type: String,
        enum: {
            values: ["CREDIT", "DEBIT"],
            message: "Type can be either CREDIT OR DEBIT"
        },
        required: [true, "Ledger type is required"],
        immutable: true

    }
})


//this is a function where the user try to modifiy or update the ledger system the func throw ths following error 
function preventLedgerModification() {
    throw new Error("Ledger entries are immutable and cannot be modified or deleted")
}


//these are the operations that the user should not perform on the preventLedgerSystem it will throw the above error 
ledgerSchema.pre('findOneAndUpdate', preventLedgerModification);
ledgerSchema.pre('updateOne', preventLedgerModification);
ledgerSchema.pre('deleteOne', preventLedgerModification);
ledgerSchema.pre('remove', preventLedgerModification);
ledgerSchema.pre('deleteMany', preventLedgerModification);
ledgerSchema.pre('updateMany', preventLedgerModification);
ledgerSchema.pre('findOneAndDelete', preventLedgerModification);
ledgerSchema.pre('findOneAndReplace', preventLedgerModification);

const ledgerModel = mongoose.model('ledger', ledgerSchema)

module.exports = ledgerModel; 