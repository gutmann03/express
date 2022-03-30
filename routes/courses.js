const {Router} = require('express')
const Course = require('../models/course')
const router = Router()
const auth = require('../middleware/auth')
const {courseValidators} = require('../utils/validators')
const {validationResult} = require('express-validator')

router.get('/', async (req, res) => {
    try {
        const courses = await Course.find().populate('userID', 'name email')

        res.render('courses', {
            title: 'Courses',
            isCourses: true,
            userID: req.user ? req.user._id.toString() : null,
            courses: courses
        })
    } catch (error) {
        console.log(error)
    }
})

router.get('/:id/edit', auth, async (req, res) => {
    if(!req.query.allow) {
        res.redirect('/')
        return
    }

    try {
        const course = await Course.findById(req.params.id)

        if(course.userID.toString() !== req.user._id.toString()){
            return res.redirect('/courses')
        }

        res.render('course_edit', {
            title: `Edit course ${course.title}`,
            course
        })
    } catch (error) {
        console.log(error)
    }
})

router.post('/edit', auth, courseValidators, async (req, res) => {
    const errors = validationResult(req)
    const {id} = req.body
    if(errors.isEmpty()){
        return res.status(422).redirect(`/courses/${id}/edit?allow=true`)
    }
    await Course.findByIdAndUpdate(req.body.id, req.body)
    res.redirect('/courses')
})

router.post('/remove', auth,  async (req, res) => {
    try{
        await Course.deleteOne({
            _id: req.body.id,
            userID: req.user._id
        })
    
        res.redirect('/courses')
    } catch(e) {
        console.log(e)
    }
})

router.get('/:id', async (req, res) => {
    try {
        const course = await Course.findById(req.params.id)
        res.render('course', {
            layout: 'empty',
            title: `Course ${course.title}`,
            course
        })
    } catch (error) {
        console.log(error)
    }
})

module.exports = router