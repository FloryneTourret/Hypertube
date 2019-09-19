const mongoose = require('mongoose');

const commentSchema = mongoose.Schema({
	author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    movie: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Movie'
	},
    content: String,
	creation_date: {
		type: Date,
		default: Date.now
	}
});

module.exports = mongoose.model('Comment', commentSchema);