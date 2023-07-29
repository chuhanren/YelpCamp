const express = require('express');
const router = express.Router({mergeParams:true});

const Campground = require('../models/campground.js');
const Review = require('../models/review.js');//import model
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
    res.redirect(`/campgrounds/${campground._id}`);//redirect to show page
   
}
))

//delete reviews
router.delete('/:reviewId', catchAsync(async(req, res)=>{
    const{ id, reviewId} = req.params;
    await Campground.findByIdAndUpdate(id, {$pull:{ reviews:reviewId}});
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/campgrounds/${id}`);

}))

module.exports = router;
