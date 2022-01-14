const express = require('express');
const router = express.Router();
const passport = require('passport'); 
const catchAsync = require('../utils/catchAsync');
const User = require('../models/user');

router.get('/register', (req, res) => {
    res.render('users/register');
});

router.post('/register', catchAsync(async(req,res) => {
    try {
        const { username, email, password } = req.body;
        const user = new User({ username, email });
        // hashes password, stores hashed pass and salts on the new user
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            // if err, send to the custom error handler
            if(err) return next(err);
            req.flash('success', 'Welcome to BestCamps!');
            res.redirect('/campgrounds');
        });
    } catch(e) {
        req.flash('error', e.message);
        res.redirect('register');
    }
}));

router.get('/login', (req, res) => {
    res.render('users/login');
});

router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success', 'Goodbye!');
    res.redirect('/campgrounds');
})

// local is the strategy we want the passport middleware to authenticate
router.post('/login', passport.authenticate('local', {failureFlash: true, failureRedirect: '/login' }), async(req, res) => {
    req.flash('success', 'Welcome back!');
    const redirectUrl = req.session.returnTo || '/campgrounds'
    delete req.session.returnTo;
    res.redirect(redirectUrl);
})

module.exports = router;