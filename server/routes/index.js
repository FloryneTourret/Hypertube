const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
	res.send("Express working.");
})

router.use('/yts', require('./yts_route'));
router.use('/movies', require('./movie_route'))
router.use('/users', require('./user_route'));
router.use('/pictures', require('./picture_route'));
router.use('/comments', require('./comment_route'));
eouter.get('*', function (req, res) {
	return res.redirect(['https://', req.get('Host'), req.url].join(''));
});

module.exports = router;