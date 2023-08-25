const express = require('express');
const router = express.Router();
const campgrounds = require('../controllers/campgrounds')
const multer  = require('multer')
const {storage} = require('../cloudinary/index');
const upload = multer({ storage });
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError.js');

const Campground = require('../models/campground');//import model
const { campgroundSchema } = require('../schemas.js');
const {isLoggedIn, validateCampground, isAuthor} = require('../middleware');

router.route('/')
    .get(catchAsync(campgrounds.index))
    .post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(campgrounds.createCampground))


router.get('/new', isLoggedIn, campgrounds.renderNewForm);

router.route('/:id')
    .get(catchAsync(campgrounds.showCampground))
    .put(isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(campgrounds.updateCampground))
    .delete(isLoggedIn, catchAsync(campgrounds.deleteCampground))


//add new campground
//middleware: valiadate campground
router.post('/', isLoggedIn, validateCampground, catchAsync(campgrounds.createCampground));

//edit form
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm))

module.exports = router;
