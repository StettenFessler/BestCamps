const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new Schema({
    email: {
        type: String, 
        required: true,
        // this is not a validation, it sets up an index
        unique: true
    }
});
// this adds a username and password field to UserSchema
// ensures that usernames are unique and not duplicated
UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', UserSchema);