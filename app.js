if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const Joi = require('joi');
const {campgroundSchema, reviewSchema} = require('./schemas');
const catchAsync = require('./utils/catchAsync');
const methodOverride = require('method-override');
const session = require('express-session');
const flash = require('connect-flash');
const ExpressError = require('./utils/ExpressError.js');
const passport = require('passport');
const localStrategy = require('passport-local');
const User = require('./models/user');

const userRoutes = require('./routes/users');
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');

mongoose.connect('mongodb://localhost:27017/yelp-camp')
.then(()=> {
    console.log('Database Connected')
})
.catch(err => {
    console.log('Connection Error!!!')
    console.log(err);
})

const app = express();

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('veiws', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public'))); //serve public directory

const sessionConfig = {
    secret: 'thisshouldbeabettersecret!',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate())); //to use 

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//set flash middleware on every request
//before route handler
app.use((req, res, next)=>{
    console.log(req.session);
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.get('/fakeUser', async(req, res)=>{
    const user = new User({email:'renchuhan521@gmail.com', username:'chuhan'});
    const newUser = await User.register(user, 'mochi');
    res.send(newUser);
})

app.use('/', userRoutes);
app.use('/campgrounds', campgroundRoutes)
app.use('/campgrounds/:id/reviews', reviewRoutes)

app.get('/', (req, res)=> {
    res.render('home')
});


//sets up a route handler that will be executed for all HTTP methods (app.all) and all routes ('*')
//made an new express error object
//Calling next with an error object triggers the execution of the next error-handling middleware.
app.all('*', (req, res, next)=> {
    next(new ExpressError('Page Not Found', 404));//it will hit the error handler
})

// error-handling middleware function
app.use((err, req, res, next)=> {
    //destructuring assignment to extract the status code and message properties from the err object
    const{ statusCode = 500} = err;
    if(!err.message) err.message = 'Oh no, something went wrong!';
    res.status(statusCode).render('error', {err}); //res.status() set the status code
})

app.listen(3000, ()=>{
    console.log('Serving on port 3000.')
})