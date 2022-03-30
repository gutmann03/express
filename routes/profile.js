const {Router} = require('express')
const router = Router()
const auth = require('../middleware/auth')
const User = require('../models/user')

router.get('/', auth, async (req, res) => {
    res.render('profile', {
        title: 'Profile',
        isProfile: true,
        user: req.user.toObject()
    })
})

router.post('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id)

        const toCange = {
            name: req.body.name,
        }

        //console.log(req.file)

        if(req.file){
            toCange.avatarUrl = req.file.path
        }

        Object.assign(user, toCange)
        await user.save()
        res.redirect('/profile')
    } catch (error) {
        console.log(error)
    }
})

module.exports = router