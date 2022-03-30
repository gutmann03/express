const express = require('express')
const path = require('path')
const csrf = require('csurf')
const flash = require('connect-flash')
const helmet = require('helmet')
const compression = require('compression')

const exphbs = require('express-handlebars')
const Handlebars = require('handlebars')
const {allowInsecurePrototypeAccess} = require('@handlebars/allow-prototype-access')

const infoRoutes = require('./routes/info')
const homeRoutes = require('./routes/home')
const addRoutes = require('./routes/add')
const cartRoutes = require('./routes/cart')
const coursesRoutes = require('./routes/courses')
const ordersRoutes = require('./routes/orders')
const authRoutes = require('./routes/auth')
const profileRoutes = require('./routes/profile')

const session = require('express-session')
const varMiddleVare = require('./middleware/variables')
const errorHandler = require('./middleware/error') 
const MongoStore = require('connect-mongodb-session')(session)
const userMiddlevare = require('./middleware/user')
const fileMiddlevare = require('./middleware/file')

const mongoose = require('mongoose')
const keys = require('./keys')

const app = express()
const hbs = exphbs.create({
    defaultLayout:'main',
    extname:'hbs',
    handlebars: allowInsecurePrototypeAccess(Handlebars),
    helpers: require('./utils/hbs-helpers')
})

const store = new MongoStore({
    collection: 'sessions',
    uri: keys.MONGODB_URI
})

app.engine('hbs', hbs.engine)
app.set('view engine', 'hbs')
app.set('views', 'views')

app.use(express.static(path.join(__dirname, 'public')))
app.use('/images', express.static(path.join(__dirname, 'images')))
app.use(express.urlencoded({extended: true}))
app.use(session({
    secret: keys.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store
}))
app.use(fileMiddlevare.single('avatar'))
app.use(csrf())
app.use(flash())
app.use(helmet({contentSecurityPolicy: false}))
app.use(compression())
app.use(varMiddleVare)
app.use(userMiddlevare)

app.use('/', homeRoutes)
app.use('/courses', coursesRoutes)
app.use('/add', addRoutes)
app.use('/cart', cartRoutes)
app.use('/info', infoRoutes)
app.use('/orders', ordersRoutes)
app.use('/auth', authRoutes)
app.use('/profile', profileRoutes)

app.use(errorHandler)

// const pswd = 'qazwsxedcrfv'

async function start() {
    try {
        await mongoose.connect(keys.MONGODB_URI, {useNewUrlParser: true})
        console.log('+\tconnection established')

        app.listen((process.env.PORT || 5000), () => {
            console.log('Serever is running...')
        })
    } catch(e) {
        console.log(e)
    }
}

start()