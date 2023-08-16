const express = require('express');
const router = express.Router();
const campgrounds = require('../controllers/campgrounds')

const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError.js');

const Campground = require('../models/campground');//import model
const { campgroundSchema } = require('../schemas.js');
const {isLoggedIn, validateCampground, isAuthor} = require('../middleware');


//index
router.get('/', catchAsync(campgrounds.index));

//add new campground form
router.get('/new', isLoggedIn, campgrounds.renderNewForm);

//add new campground
//middleware: valiadate campground
router.post('/', isLoggedIn, validateCampground, catchAsync(campgrounds.createCampground));

//show page
router.get('/:id', catchAsync(campgrounds.showCampground));

//edit form
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm))

//update
router.put('/:id', isLoggedIn, isAuthor, validateCampground, catchAsync(campgrounds.updateCampground))//faking it's a put request

router.delete('/:id', isLoggedIn, catchAsync(campgrounds.deleteCampground));

module.exports = router;
