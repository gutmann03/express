const keys = require('../keys/index')

function registration(to, name) {
    return {
        from: keys.EMAIL_FROM,
        to,
        subject: `Congratulations dear ${name}!`,
        html: `
            <h1>Welcome to our shop</h1>
            <p>Your account has been created!</p>
            <a href="${keys.BASE_URL}">COURSES SHOP</a>
        `
    }
}

function reset(to, name, token) {
    return {
        from: keys.EMAIL_FROM,
        to,
        subject: `Recovering password`,
        html: `
            <h1>Hello dear ${name}!</h1>
            <p>To restore your password click below</p>
            <a href="${keys.BASE_URL}/auth/password/${token}">##>>click here<<##</a>
            <h2>If it wasn't you, ignore this message</h2>
        `
    }
}

module.exports = {registration, reset}