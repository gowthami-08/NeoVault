//Nodemailer is a popular, zero-dependency Node.js module specifically designed to make sending emails from a server simple and secure. It is commonly used to send automated emails—such as welcome messages, OTPs, or verification links—upon the successful registration of a user on a website. 
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({   //Transporter is nothing but the object which is used to send the email 
    service: 'gmail',                          //it communicates with the gmail server to send the email. There is a specific servers for handling the servers like gmail, yahoo and etc ..which is called as SMTP servers 
    auth: {
        user: process.env.EMAIL_USER,             //the transporter act as a messenger btn the SMTP server and the gmail server  
        pass: process.env.EMAIL_PASS,
    }
})

//verify the connection configuration 
transporter.verify((error, success) => {
    if (error) {
        console.error("Error connecting to email server:", error);
    } else {
        console.log("email server is ready to send message");
    }
});

// Function to send email
const sendEmail = async (to, subject, text, html) => {
    try {
        const info = await transporter.sendMail({
            from: `"Backend-Ledger" <${process.env.EMAIL_USER}>`, // sender address
            to, // list of receivers
            subject, // Subject line
            text, // plain text body
            html, // html body
        });

        console.log('Message sent: %s', info.messageId);
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

async function sendRegistrationEmail(userEmail, name) {
    const subject = "Welcome to Backend-Ledger!";
    const text = `Hello ${name},\n\n Thank you for registering at Backend Ledger,
    We're excited to have you on board!\n\nBest regards,\nThe Backend Ledger Team`;

    const html = `<p>Hello ${name},</p>Thank you for registering at Backend Ledger. We're excited to have you on board!<p>Best regards,<br>The Backend Ledger Team<p>`;

    await sendEmail(userEmail, subject, text, html);
}

async function sendTransactionEmail(userEmail, name, amount, toUseraccount) {
    const subject = "Transaction Completed";
    const text = `Hello ${name},\n\n Your transaction of ${amount} has been completed successfully.\n\nBest regards,\nThe Backend Ledger Team`;

    const html = `<p>Hello ${name},</p>Your transaction of ${amount} has been completed successfully.<p>Best regards,<br>The Backend Ledger Team<p>`;

    await sendEmail(userEmail, subject, text, html);
}

async function sendTransactionFailedEmail(userEmail, name, amount, toUseraccount) {
    const subject = "Transaction Failed";
    const text = `Hello ${name},\n\n Your transaction of ${amount} has failed.\n\nBest regards,\nThe Backend Ledger Team`;

    const html = `<p>Hello ${name},</p>Your transaction of ${amount} has failed.<p>Best regards,<br>The Backend Ledger Team<p>`;

    await sendEmail(userEmail, subject, text, html);
}
module.exports = {
    sendRegistrationEmail,
    sendTransactionEmail,
    sendTransactionFailedEmail
};
