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

const campgrounds = require('./routes/campgrounds');
const reviews = require('./routes/reviews');

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

app.use(express.urlencoded({extended: true}))
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

//set flash middleware on every request
//before route handler
app.use((req, res, next)=>{
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})
app.use('/campgrounds', campgrounds);
app.use('/campgrounds/:id/reviews', reviews);

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