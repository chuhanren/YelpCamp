const express = require('express');
const router = express.Router();

const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError.js');

const Campground = require('../models/campground');//import model
const { campgroundSchema } = require('../schemas.js');
const {isLoggedIn, validateCampground, isAuthor} = require('../middleware');


//index
router.get('/', async(req, res)=> {
    const campgrounds = await Campground.find({}); //list everthing
    res.render('campgrounds/index', {campgrounds})
})

//add new
router.get('/new', isLoggedIn, (req, res) => {
    res.render('campgrounds/new');
})

//add new campground
//middleware: valiadate campground
router.post('/', isLoggedIn, validateCampground, catchAsync(async(req, res)=>{
    const campground = new Campground(req.body.campground);
    campground.author = req.user._id;
    await campground.save();
    req.flash('success', 'Successfully made a new campground!');
    res.redirect(`/campgrounds/${campground._id}`);
}));

//show page
router.get('/:id', catchAsync(async(req, res)=> {
    if(req.params.id.length !==24) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    //nested populate
    const campground = await Campground.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');

    //console.log(campground);
    if(!campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', {campground});
}));

//edit page
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(async(req, res)=>{
    const { id } = req.params;
    const campground = await Campground.findById(id)
    if (!campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground });
}))

//edit
router.put('/:id', isLoggedIn, isAuthor, validateCampground, catchAsync(async(req, res)=>{
    const {id} = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground})
    req.flash('success', 'Successfully updated campground');
    res.redirect(`/campgrounds/${campground._id}`);
}))//faking it's a put request

router.delete('/:id', isLoggedIn, catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted campground')
    res.redirect('/campgrounds');
}));

module.exports = router;
