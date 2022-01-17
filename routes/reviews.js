const express = require('express');
const router = express.Router({ mergeParams: true}); // mergeParams allows reviews.js to use params received in app.js
const catchAsync = require('../utils/catchAsync');
const reviews = require('../controllers/reviews');
const { validateReview, isLoggedIn, isReviewAuthor} = require('../middleware');

// validate review middleware validates before new review is created
router.post('/', validateReview, isLoggedIn, catchAsync(reviews.createReview));

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview));

module.exports = router;


