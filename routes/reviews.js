const express = require('express');
const router = express.Router({ mergeParams: true}); // mergeParams allows reviews.js to use params received in app.js
const catchAsync = require('../utils/catchAsync');
const Review = require('../models/review'); 
const Campground = require('../models/campground'); 
const { validateReview, isLoggedIn, isReviewAuthor} = require('../middleware');

// validate review middleware validates before new review is created
router.post('/', validateReview, isLoggedIn, catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    // push review onto reviews array in campground
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'Successfully created a new review.');
    res.redirect(`/campgrounds/${campground._id}`);
}))

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    // $pull removes all instances of a value in an array that match a specified condition
    await Campground.findByIdAndUpdate(id, {$pull:{reviews: reviewId }});
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted review.');
    res.redirect(`/campgrounds/${id}`);
}))

module.exports = router;


