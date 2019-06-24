const mongoose = require('mongoose');

const MovieSchema = mongoose.Schema({
	title: {
		type: String,
		required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
	},
	backgroundImage: {
		type: String
	},
	movieID: {
		type: String,
		required: true
	},
	creation_date: {
		type: Date,
		default: Date.now
	}
});

module.exports = mongoose.model('Movie', MovieSchema);