const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CampgroundSchema = new Schema({
    title: String,
    price: Number,
    description: String,
    image: String,
    description: String,
    location: String
})

                             // 'modelName', modelSchema
module.exports = mongoose.model('Campground', CampgroundSchema);