const {Router} = require('express')
const router = Router()
const Course = require('../models/course')
const auth = require('../middleware/auth')

function mapCartItems(cart) {
 return cart.items.map(c => ({
    ...c.courseID._doc,
    id: c.courseID.id,
    count: c.count
    
 }))
}

function getPrice(courses) {
    return courses.reduce((total, course) => {
        return total += course.price * course.count
    }, 0)
}

router.post('/add', auth, async (req, res) => {
    const course = await Course.findById(req.body.id)
    await req.user.addToCart(course)
    res.redirect('/cart')
})

router.delete('/remove/:id', auth, async (req, res) => {
    await req.user.removeById(req.params.id)
    const user = await req.user.populate('cart.items.courseID')
    
    const courses = mapCartItems(user.cart)
    const cart = {
        courses, price: getPrice(courses)
    }
    res.status(200).json(cart)
})

router.get('/', auth, async (req, res) => {
    const user = await req.user.populate('cart.items.courseID')

    const courses = mapCartItems(user.cart)
    res.render('cart', {
        title: 'Cart',
        isCart: true,
        courses: courses,
        price: getPrice(courses)
    })
})

module.exports = router