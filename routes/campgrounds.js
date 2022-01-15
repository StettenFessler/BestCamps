const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const Campground = require('../models/campground'); // include campground schema
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');

router.get('/', catchAsync(async (req, res) => {
    // find all campgrounds in campground func
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
}));

// order matters! this must be above the below get
router.get('/new', isLoggedIn, (req, res) => {
    res.render('campgrounds/new');
});

// new campgrounds will be sent here
router.post('/', isLoggedIn, validateCampground, catchAsync(async (req, res, next) => {
    const campground = new Campground(req.body.campground);
    // req.user automatically added in by passport
    campground.author = req.user._id;
    await campground.save();
    req.flash('success', 'Successfully made a new campground!');
    res.redirect(`/campgrounds/${campground._id}`);
}));

router.get('/:id', catchAsync(async (req, res) => {
    // populate replaces the ids in the reviews array on the campground model with the actual review documents
    const campground = await Campground.findById(req.params.id).populate({
        // populate reviews onto the campground
        path: 'reviews',
        // then populate each review author onto each review
        populate: { 
            path: 'author'
        }
        // then populate each campground author onto each campground
    }).populate('author');
    console.log(campground);
    if(!campground) {
        req.flash('error', 'Cannot find that campground!')
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground });
}));


router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(async (req, res) => {   
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground });
}));

router.put('/:id', validateCampground, isAuthor, catchAsync(async (req, res) => {
    const { id } = req.params;
    // the spread operator (...) clones the old campground to a new one, 
    // while only overwriting values that have been edited
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground }) //  (id to search by, what to use to update)
    req.flash('success', 'Successfully updated campground!');
    res.redirect(`/campgrounds/${campground._id}`);
}));

router.delete('/:id', isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    const { id }= req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted campground!');
    res.redirect('/campgrounds');
}));            

module.exports = router;