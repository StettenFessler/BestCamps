const express = require('express');
const path = require('path'); // allows access to views folder from any other folder
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const methodOverride = require('method-override'); // allows to override request type
const ExpressError = require('./utils/ExpressError');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');
const userRoutes = require('./routes/users')

mongoose.connect('mongodb://localhost:27017/yelp-camp');

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error: "));
db.once("open", () => {
    console.log("Database connected");
});

const app = express();

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

app.use(flash());
app.use(session(sessionConfig));

app.use(passport.initialize());
// passport.session allows for persistent login sessions
app.use(passport.session());
// the authentication method LocalStrategy will use is on the User model 
passport.use(new LocalStrategy(User.authenticate()))
// stores a user in the session

passport.serializeUser(User.serializeUser());
// removes a user from the session
passport.deserializeUser(User.deserializeUser());


app.use((req, res, next) => {
    // all templates will have access to currentUser
    res.locals.currentUser = req.user;
    // every request will have access to what is in flash 'success' through res locals under key success
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.use('/', userRoutes);
// every route in the campgrounds router will be prefixed with 'campgrounds'
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);

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