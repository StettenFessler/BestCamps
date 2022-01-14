module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        // if the user requests a url but don't have access, save the requested url
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'You must be signed in first!');
        return res.redirect('/login');
    }
    next();
}