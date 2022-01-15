const mongoose = require('mongoose');
const Review = require('./review');
const Schema = mongoose.Schema;

const CampgroundSchema = new Schema({
    title: String,
    price: Number,
    description: String,
    image: String,
    description: String,
    location: String,
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
})

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