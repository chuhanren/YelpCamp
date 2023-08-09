const express = require('express');
const router = express.Router({mergeParams:true});

const Campground = require('../models/campground');
const Review = require('../models/review');//import model
const {reviewSchema} = require('../schemas');//joi schema
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError.js');

const validateReview = (req, res, next) =>{
    const { error } = reviewSchema.validate(req.body);
    if(error) {
        const msg = error.details.map(el=>el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

//create new review
router.post('/', validateReview, catchAsync(async(req, res)=>{
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'Created new review!');
    res.redirect(`/campgrounds/${campground._id}`);//redirect to show page
   
}
))

//delete reviews
router.delete('/:reviewId', catchAsync(async(req, res)=>{
    const{ id, reviewId} = req.params;
    await Campground.findByIdAndUpdate(id, {$pull:{ reviews:reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted review');
    res.redirect(`/campgrounds/${id}`);

}))

module.exports = router;
