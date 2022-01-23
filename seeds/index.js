// run this file separately from the node app anytime want to see the database

const mongoose = require('mongoose');
const Campground = require('../models/campground'); // include campground schema
const cities = require('./cities');
const {places, descriptors} = require('./seedHelpers')

mongoose.connect('mongodb://localhost:27017/yelp-camp');

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error: "));
db.once("open", () => {
    console.log("Database connected");
});

// get random value in array based off array length
const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    // delete everything in the database
    await Campground.deleteMany({});
    for (let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() *  1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            author: '61e0c906aebcde2cba312e72',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Nemo suscipit numquam molestiae dicta earum quaerat magni tempore beatae laborum placeat nulla consequatur, neque veritatis consequuntur officiis ad assumenda vitae quas?',
            price,
            images: [
                {
                    url: 'https://res.cloudinary.com/dqzsm4akj/image/upload/v1642886164/BestCamps/y1ndgd84xg4ipis63vyz.jpg',
                    filename: 'BestCamps/y1ndgd84xg4ipis63vyz',
                  },
                {
                    url: 'https://res.cloudinary.com/dqzsm4akj/image/upload/v1642886168/BestCamps/htwghok6vfnsualttxhr.jpg',
                    filename: 'BestCamps/htwghok6vfnsualttxhr',
                },
                {
                    url: 'https://res.cloudinary.com/dqzsm4akj/image/upload/v1642886171/BestCamps/hbkl51g8pjmojg7ljp7v.jpg',
                    filename: 'BestCamps/hbkl51g8pjmojg7ljp7v',
                },
                {
                    url: 'https://res.cloudinary.com/dqzsm4akj/image/upload/v1642886173/BestCamps/ir8pezvpbsllby9uyxai.jpg',
                    filename: 'BestCamps/ir8pezvpbsllby9uyxai',
                },
                {
                    url: 'https://res.cloudinary.com/dqzsm4akj/image/upload/v1642886174/BestCamps/oypqzqh6jkhsbykmoxtt.jpg',
                    filename: 'BestCamps/oypqzqh6jkhsbykmoxtt',
                }
            ]
        })
        await camp.save();
    }
}

// seedDB returns a promise because it is an asnyc func
seedDB().then(() => {
    mongoose.connection.close(); // close database connection
})