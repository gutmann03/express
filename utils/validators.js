const {body} = require('express-validator')
const User = require('../models/user')

module.exports = {
    registerValidators: [
        body('email', 'Incorrect email.').isEmail()
            .custom(async (value, {req}) => {
                try {
                    const candidate = await User.findOne({email: value})
                    if(candidate){
                        return Promise.reject('A user with this email already exists')
                    }
                } catch (error) {
                    console.log(error)
                }
            }).normalizeEmail(),
        body('password', 'Pasword must have at least 6 symbols...').isLength({min: 6, max: 52})
            .isAlphanumeric()
            .trim(),
        body('confirm').custom((value, {req}) => {
            if(value !== req.body.password){
                throw new Error('Passwords must be identical.')
            }
            return true
        }).trim(),
        body('name', 'Field "Name" must consist at least 2 letters.').isLength({min: 2}).trim()
    ],
    courseValidators: [
        body('title', 'Title must consist more than 2 symbols').isLength({min: 3}).trim(),
        body('price', 'Enter correct price').isNumeric(),
        body('img', 'Incorect URL').isURL()
    ],
    loginValidators: []
}