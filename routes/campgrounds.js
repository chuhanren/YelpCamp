const express = require('express');
const router = express.Router();
const Campground = require('../models/campground.js');//import model
const {campgroundSchema, reviewSchema} = require('../schemas');
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError.js');

//middleware
const validateCampground = (req, res, next) => {
    const {error} =  campgroundSchema.validate(req.body);
    if(error) {
        const msg = error.details.map(el=>el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

//index
router.get('/', async(req, res)=> {
    const campgrounds = await Campground.find({}); //list everthing
    res.render('campgrounds/index', {campgrounds})
})

//add new
router.get('/new', (req, res) => {
    res.render('campgrounds/new');
})

//add new campground
//middleware: valiadate campground
router.post('/', validateCampground, catchAsync(async(req, res)=>{
    const campground = new Campground(req.body.campground);
    await campground.save();
    req.flash('success', 'Successfully made a new campground!');
    res.redirect(`/campgrounds/${campground._id}`);
}));

//show page
router.get('/:id', catchAsync(async(req, res)=> {
    const campground = await Campground.findById(req.params.id).populate('reviews');
    //console.log(campground);
    res.render('campgrounds/show', {campground});
}));

//edit page
router.get('/:id/edit', catchAsync(async(req, res)=>{
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/edit', {campground});
}))

//edit
router.put('/:id', validateCampground, catchAsync(async(req, res)=>{
    const {id} = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground})
    res.redirect(`/campgrounds/${campground._id}`);
}))//faking it's a put request

router.delete('/:id', catchAsync(async(req, res)=>{
    const {id} = req.params;
    await Campground.findByIdAndDelete(id);//will call the find one and delete middleware
    res.redirect('/campgrounds');
}))

module.exports = router;
