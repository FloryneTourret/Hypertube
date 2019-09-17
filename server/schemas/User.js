const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
	email: {
		type: String,
		unique: true
	},
	picture: {
		type: String
	},
	username: {
		type: String,
		required: true,
		unique: true
	},
	firstName: {
		type: String,
		required: true
	},
	lastName: {
		type: String,
		required: true
	},
	password: {
		type: String,
	},
	movies: [{
		type: mongoose.Schema.Types.ObjectId,
			ref: 'Movie'
	}],
	facebookID: String,
	authProvider: String,
	resetPasswordToken: String,
	resetPasswordExpires: Date,
	creation_date: {
		type: Date,
		default: Date.now
	},
	lang: {
		type: String
	}
});

module.exports = mongoose.model('User', UserSchema);