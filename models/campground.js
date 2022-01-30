const mongoose = require('mongoose');
const Review = require('./review');
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
    url: String,
    filename: String
})

// virtuals are not stored in the database
// they are generated on the fly by the virtual function
ImageSchema.virtual('thumbnail').get(function() {
    // this refers to the particular image
    return this.url.replace('/upload', '/upload/w_200');
});

const opts = { toJSON: { virtuals: true }};

const CampgroundSchema = new Schema({
    title: String,
    price: Number,
    location: String,
    description: String,
    images: [ImageSchema], // each campground can have multiple images  
    description: String,
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    // reference to the user who created the campground
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    // reviews stores object IDs from the review model 
    // one to many relationship between a campground and its reviews
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
}, opts);

// by default, mongoose does not inlude virtuals when you convert a document to JSON
// creates a properties object in each campground with key popUpMarkup
CampgroundSchema.virtual('properties.popUpMarkup').get(function() {
    return `<strong><a href="/campgrounds/${this._id}">${this.title}</a></strong>
    <p>${this.description.substring(0, 20)}...</p>
    `;
});

// this query middleware func runs AFTER something is deleted
// doc is the campground document that was deleted
CampgroundSchema.post('findOneAndDelete', async function (doc) {
    if(doc){
        await Review.deleteMany({ 
            // delete any review that has an id in the reviews array of the deleted document
            _id: {
               $in: doc.reviews 
            }
        })
    }
})
                             // 'modelName', modelSchema
module.exports = mongoose.model('Campground', CampgroundSchema);