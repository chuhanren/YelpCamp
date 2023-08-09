const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new Schema({
    email: {
        type: String,
        required:true
    }
});

UserSchema.plugin(passportLocalMongoose); //this will make a user name and password for schema

module.exports = mongoose.model('User', UserSchema);