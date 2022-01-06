const express = require('express');
const router = express.Router({ mergeParams: true}); // mergeParams allows reviews.js to use params received in app.js
const catchAsync = require('../utils/catchAsync');
const Review = require('../models/review'); 
const Campground = require('../models/campground'); 
const ExpressError = require('../utils/ExpressError');
const { reviewSchema } = require('../schemas.js');

const validateReview = (req, res, next) => {
    // check if returned object contains an error
    const { error} = reviewSchema.validate(req.body);
    if (error){
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

// validate review middleware validates before new review is created
router.post('/', validateReview, catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    // push review onto reviews array in campground
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'Successfully created a new review.');
    res.redirect(`/campgrounds/${campground._id}`);
}))

router.delete('/:reviewId', catchAsync(async (req, res) => {
    // $pull removes all instances of a value in an array that match a specified condition
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, {$pull:{reviews: reviewId }});
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted review.');
    res.redirect(`/campgrounds/${id}`);
}))

module.exports = router;