const nodemailer = require('nodemailer')
const keys = require('../keys/index')
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: keys.EMAIL,
        pass: keys.EMAIL_PASSWORD
    }
})

    function send(mailOptions){
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
            console.log(error);
            } else {
            console.log('Email sent: ' + info.response);
            }
        })
    }
    


module.exports = {send};