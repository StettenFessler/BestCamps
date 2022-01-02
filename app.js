const express = require('express');
const path = require('path'); // allows access to views folder from any other folder
const mongoose = require('mongoose');
const ejsMate= require('ejs-mate');
const { campgroundSchema, reviewSchema } = require('./schemas.js');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override'); // allows to override request type
const Campground = require('./models/campground'); // include campground schema
const Review = require('./models/review'); 

mongoose.connect('mongodb://localhost:27017/yelp-camp');

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error: "));
db.once("open", () => {
    console.log("Database connected");
});

const app = express();

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); // set views path

// parse req.body
app.use(express.urlencoded({ extended: true}));
// _method is the query string string
app.use(methodOverride('_method'));

const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error){
        // details is an array of objects
        // for each object in details that has an err message, map that err message to msg
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

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

app.get('/', (req, res) => {
    res.render('home');
});

app.get('/campgrounds', catchAsync(async (req, res) => {
    // find all campgrounds in campground func
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
}));

// order matters! this must be above the below get
app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new');
});

// new campgrounds will be sent here
app.post('/campgrounds', validateCampground, catchAsync(async (req, res, next) => {
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
}));

app.get('/campgrounds/:id', catchAsync(async (req, res) => {
    // populate replaces the ids in the reviews array with the actual review documents
    const campground = await Campground.findById(req.params.id).populate('reviews');
    res.render('campgrounds/show', { campground });
}));


app.get('/campgrounds/:id/edit', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/edit', { campground });
}));

app.put('/campgrounds/:id', validateCampground, catchAsync(async (req, res) => {
    const { id }= req.params;
    // (id to search by, what to update)
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground })
    res.redirect(`/campgrounds/${campground._id}`);

}));

app.delete('/campgrounds/:id', catchAsync(async (req, res) => {
    const { id }= req.params;
    const campground = await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}));

// validate review middleware validates before new review is created
app.post('/campgrounds/:id/reviews', validateReview, catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    // push review onto reviews array in campground
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
}))

app.delete('/campgrounds/:id/reviews/:reviewId', catchAsync(async (req, res) => {
    // $pull removes all instances of a value in an array that match a specified condition
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, {$pull:{reviews: reviewId }});
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/campgrounds/${id}`);
}))

// for every unknown request and path
app.all('*', (req, res, next) => {
    next(new ExpressError('Page not found', 404))
});

app.use((err, req, res, next) => {
    // desctructure statusCode and message from error, set defaults
    const { statusCode = 500 }= err;
    if (!err.message) err.message = "Oh no, something went wrong!"
    res.status(statusCode).render('error', { err });
});

app.listen(3000, () => {
    console.log('serving on port 3000 ')
});