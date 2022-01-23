const express = require('express');
const router = express.Router();
const campgrounds = require('../controllers/campgrounds');
const catchAsync = require('../utils/catchAsync');
const multer = require('multer');
const { storage } = require('../cloudinary/'); // node automatically looks for an index.js file
const upload = multer({ storage });
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');

router.route('/')    
    .get(catchAsync(campgrounds.index)) // campgrounds is an object containing several methods
    .post(isLoggedIn,  upload.array('image'), validateCampground, catchAsync(campgrounds.createCampground));
    

// order matters! this must be above the get below this, otherwise 'new' will be seen as an id
router.get('/new', isLoggedIn, campgrounds.renderNewForm);

router.route('/:id')
    .get(catchAsync(campgrounds.showCampground))
    // images are found in the form data under the key "image"
    .put(isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(campgrounds.updateCampground))
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.destroyCampground))            

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));

module.exports = router;