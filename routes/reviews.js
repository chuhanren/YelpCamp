const express = require('express');
const router = express.Router({mergeParams:true});
const {validateReview, isLoggedIn, isReviewAuthor} = require('../middleware');
const Campground = require('../models/campground');
const Review = require('../models/review');//import model
const reviews =require('../controllers/reviews')
const {reviewSchema} = require('../schemas');//joi schema
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError.js');

//create new review
router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview))

//delete reviews
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview))

module.exports = router;
