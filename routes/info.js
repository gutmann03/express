const {Router} = require('express')
const router = Router()
//const sendler = require('../email/sendler')

router.get('/', (req, res) => {
    res.status(200)
    const date = new Date()
    res.render('info', {
        title: 'Info page',
        time: `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
    })
    //sendler.send()
})

module.exports = router