const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const Joi = require('joi');
const {campgroundSchema} = require('./schemas');
const catchAsync = require('./utils/catchAsync');
const methodOverride = require('method-override');
const Campground = require('./models/campground.js');//import model
const ExpressError = require('./utils/ExpressError.js');


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

const validateCampground = (req, res, next) => {
    const {error} =  campgroundSchema.validate(req.body);
    if(error) {
        const msg = error.details.map(el=>el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

app.get('/', (req, res)=> {
    res.render('home')
})

//index
app.get('/campgrounds', async(req, res)=> {
    const campgrounds = await Campground.find({}); //list everthing
    res.render('campgrounds/index', {campgrounds})
})

//add new 
app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new');
})

//add new campground
//middleware: valiadate campground
app.post('/campgrounds', validateCampground, catchAsync(async(req, res)=>{
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
}));

//show
app.get('/campgrounds/:id', catchAsync(async(req, res)=> {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/show', {campground});
}));

//edit 
app.get('/campgrounds/:id/edit', catchAsync(async(req, res)=>{
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/edit', {campground});
}))

//edit
app.put('/campgrounds/:id', validateCampground, catchAsync(async(req, res)=>{
    const {id} = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground})
    res.redirect(`/campgrounds/${campground._id}`);
}))//faking it's a put request

app.delete('/campgrounds/:id', catchAsync(async(req, res)=>{
    const {id} = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}))

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