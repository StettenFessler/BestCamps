const Campground = require('../models/campground'); 
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });

const { cloudinary } = require("../cloudinary");

module.exports.index = async (req, res) => {
    // find all campgrounds in campground collection
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
}

module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new');
}

module.exports.createCampground = async (req, res, next) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()
    const campground = new Campground(req.body.campground);
    campground.geometry = geoData.body.features[0].geometry;
    // creates an array of objects containing the url and filename of each image
    campground.images = req.files.map(f => ({url: f.path, filename: f.filename})); // req.files is an array created by multer containing file objects
    // req.user automatically added in by passport
    campground.author = req.user._id;
    await campground.save();
    console.log(campground);
    req.flash('success', 'Successfully made a new campground!');
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.showCampground = async (req, res) => {
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
    if(!campground) {
        req.flash('error', 'Cannot find that campground!')
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground });
}

module.exports.renderEditForm = async (req, res) => {   
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground });
}

module.exports.updateCampground = async (req, res) => {
    const { id } = req.params;
    // the spread operator (...) clones the old campground to a new one, 
    // while only overwriting values that have been edited
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground }) //  (id to search by, what to use to update)
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename })); // req.files is an array created by multer containing file objects
    // use push so that existing images aren't overwritten
    campground.images.push(...imgs);
    await campground.save();
    if (req.body.deleteImages) {
        // delete images from cloudinary
        for(let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        // pull removes elements from an array
        // in campground images, delete images that have a filename that is in the deleteImages array
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages }}}});
    }
    req.flash('success', 'Successfully updated campground!');
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.destroyCampground = async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted campground!');
    res.redirect('/campgrounds');
}