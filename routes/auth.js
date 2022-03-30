const {Router} = require('express')
const router = Router()
const crypto = require('crypto')
const bcrypt = require('bcryptjs')
const User = require('../models/user')
const sendler = require('../email/sendler')
const message = require('../email/texts')
const {validationResult} = require('express-validator')
const {registerValidators} = require('../utils/validators')

router.get('/login', async (req, res) => {
    res.render('auth/login', {
        title: 'Authorization',
        isLogin: true,
        registerError: req.flash('registerError'),
        loginError: req.flash('loginError')
    })
})

router.get('/logout', async (req, res) => {
    req.session.destroy(() => {
        res.redirect('/auth/login#login')
    })
})

router.get('/password/:token', async (req, res) => {
    if (!req.params.token) {
        return res.redirect('/auth/login')
    }

    try {
        const user = await User.findOne({
            resetToken: req.params.token,
            resetTokenExp: {$gt: Date.now()}
        })

        if(!user){
            return res.redirect('/auth/login')
        }else{
            res.render('auth/password', {
                title: 'recovering access',
                passwordError: req.flash('passwordError'),
                userID: user._id.toString(),
                token: req.params.token
            })
        }
    } catch (error) {
        console.log(error)
    }
    
})

router.get('/reset', (req, res) => {
    res.render('auth/reset', {
        title: 'Recovering password',
        resetError: req.flash('resetError')
    })
})

router.post('/login', async (req, res) => {
    try {
        const {email, password} = req.body

        const candidate = await User.findOne({email})

        if(candidate){
            const areSame = await bcrypt.compare(password, candidate.password)

            if (areSame) {
                req.session.user = candidate
                req.session.isAuth = true
                req.session.save(err => {
                    if(err) {
                        throw err
                    }
                    res.redirect('/')
                })
            }else{
                req.flash('loginError', 'Incorrect login or password')
                res.redirect('/auth/login#login')
            }
        }else{
            req.flash('loginError', 'Incorrect login or password')
            res.redirect('/auth/login#login')
        }
    } catch (error) {
        console.log(error)
    }
})

router.post('/register', registerValidators, async (req, res) => {
    try {
        const {email, password, name} = req.body

        const errorsValidations = validationResult(req)
        if(!errorsValidations.isEmpty()){
            req.flash('registerError', errorsValidations.array()[0].msg)
            return res.status(422).redirect('/auth/login#register')
        }

        const hashPassword = await bcrypt.hash(password, 10)
        const user = new User({
            email, name, password: hashPassword, cart: {items: []}
        })
        await user.save()
        res.redirect('/auth/login#login')
        await sendler.send(message.registration(email, name))
    } catch (error) {
        console.log(error)
    }
})

router.post('/reset', (req, res) => {
    try {
        crypto.randomBytes(32, async (err, buffer) => {
            if (err) {
                req.flash('resetError', 'Something went wrong :(\nPlease, try again.')
                return res.redirect('/auth/reset')
            }

            const token = buffer.toString('hex')

            const candidate = await User.findOne({email: req.body.email})

            if (candidate) {
                candidate.resetToken = token
                candidate.resetTokenExp = Date.now() + 60 * 60 * 100
                await candidate.save()
                await sendler.send(message.reset(candidate.email, candidate.name, token))
                res.redirect('/auth/login')
            } else {
                req.flash('resetError', 'Such user odes not exist')
            }
        })
    } catch (error) {
        console.log(error)
    }
})

router.post('/password', async (req, res) => {
    try {
        const user = await User.findOne({
            _id: req.body.userID,
            resetToken: req.body.token,
            resetTokenExp: {$gt: Date.now()}
        })

        if(user){
            user.password = await bcrypt.hash(req.body.password, 10)
            user.resetToken = undefined
            user.resetTokenExp = undefined
            await user.save()
            res.redirect('/auth/login')
        }else{
            req.flash('loginError', 'recovery time is up')
            res.redirect('/auth/login')
        }
    } catch (error) {
        console.log(error)
    }
})

module.exports = router