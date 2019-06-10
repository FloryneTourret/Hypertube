const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
        email: {
                type: String,
                required: true
        },
        username: {
                type: String,
                required: true
        },
        password: {
                type: String,
                required: true
        },
        creation_date: {
                type: Date,
                default: Date.now
        }
});

module.exports = mongoose.model('User', UserSchema);