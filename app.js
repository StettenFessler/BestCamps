const express = require('express');
const path = require('path'); // allows access to views folder from any other folder
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const methodOverride = require('method-override'); // allows to override request type
const ExpressError = require('./utils/ExpressError');

const campgrounds = require('./routes/campgrounds');
const reviews = require('./routes/reviews');

const app = express();

mongoose.connect('mongodb://localhost:27017/yelp-camp');
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error: "));
db.once("open", () => {
    console.log("Database connected");
});

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); // allows views to be executed outside of its directory

// parse req.body
app.use(express.urlencoded({ extended: true}));
// _method is the query string string
app.use(methodOverride('_method'));
// tells express to serve the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

const sessionConfig = {
    secret: 'badSecret',
    resave: false,
    saveUninitialized: true,
    cookie: { // the 'key' to the session 
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig));
app.use(flash());

// every request will have access to what is in flash 'success' through res locals under key success
app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

// every route in the campgrounds router will be prefixed with 'campgrounds'
app.use('/campgrounds', campgrounds);
app.use('/campgrounds/:id/reviews', reviews);

// for every unknown request and path
app.all('*', (req, res, next) => {
    next(new ExpressError('Page not found', 404))
});

app.use((err, req, res, next) => {
    // desctructure statusCode and message from error, set defaults
    const { statusCode = 500 } = err;
    if (!err.message) err.message = "Oh no, something went wrong!"
    res.status(statusCode).render('error', { err });
});

app.listen(3000, () => {
    console.log('serving on port 3000 ')
});