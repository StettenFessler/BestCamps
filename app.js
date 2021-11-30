const express = require('express');
const path = require('path'); // allows access to views folder from any other folder
const mongoose = require('mongoose');
const ejsMate= require('ejs-mate');
const methodOverride = require('method-override'); // allows to override request type
const Campground = require('./models/campground'); // include campground schema

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

app.get('/', (req, res) => {
    res.render('home');
})

app.get('/campgrounds', async (req, res) => {
    // find all campgrounds in campground func
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
})

// order matters! this must be above the below get
app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new');
})

// new campgrounds will be sent here
app.post('/campgrounds', async (req, res) => {
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
})

app.get('/campgrounds/:id', async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/show', { campground });
})

app.get('/campgrounds/:id/edit', async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/edit', { campground });
})

app.put('/campgrounds/:id', async (req, res) => {
    const { id }= req.params;
    // (id to search by, what to update)
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground })
    res.redirect(`/campgrounds/${campground._id}`);

})

app.delete('/campgrounds/:id', async (req, res) => {
    const { id }= req.params;
    const campground = await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
})

app.listen(3000, () => {
    console.log('serving on port 3000 ')
})