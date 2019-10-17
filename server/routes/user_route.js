const express = require('express');
const bcrypt = require('bcrypt');
const usersRouter = express.Router({
	mergeParams: true
});
const User = require('../schemas/User');
const Movie = require('../schemas/Movie');
const tokenVerification = require('../middlewares/tokenVerification');
const jwt = require('jsonwebtoken');
const userController = require('../controllers/user');
require('dotenv').config();
const sanitize = require('../controllers/sanitize');

usersRouter.get('/', tokenVerification, async (req, res) => {
	User.find({}, (err, docs) => {
		res.json(docs);
	})
});

usersRouter.get('/:username', tokenVerification, async (req, res) => {
	User.findOne({
		username: req.params.username
	}, (err, doc) => {
		if (err) {
			console.log(err);
		} else if (doc) {
			console.log(doc);
			if (req.decoded.userid == doc._id) {
				res.json(doc);
			} else {
				res.json({
					username: doc.username,
					picture: doc.picture
				});
			}
		} else {
			res.send("not found");
		}
	});
})

usersRouter.get('/:username/movies', tokenVerification, async (req, res) => {
	User.findById(req.decoded.userid, async (err, doc) => {
		if (err)
			console.log(err);
		else if (doc) {
			movies = await Movie.find({
				"_id": {
					$in: doc.movies
				}
			})
			console.log(movies);
			res.json(movies);
		}
	})
})

usersRouter.post('/', userController.validate('createUser'),
	userController.createUser
);

usersRouter.post('/login', async (req, res) => {
	if (req.body.username && req.body.password) {
		var user = await User.findOne({
			username: req.body.username
		});
		console.log(user);
		if (user && user.authProvider === 'local') {
			if (bcrypt.compareSync(req.body.password, user.password)) {
				const payload = {
					check: true,
					userid: user._id
				}

				var token = jwt.sign(payload, process.env.SECRET, {
					expiresIn: "2 days"
				});

				res.status(200).send({
					user: user,
					token: token
				});
			} else {
				res.status(200).send("KO");
			}
		} else {
			res.status(200).send("Not found");
		}
	} else {
		res.send("Missing credentials");
	}
})

usersRouter.put('/', tokenVerification, async (req, res) => {
	User.findById(req.decoded.userid, async (err, user) => {
		if (err) {
			res.json({
				message: err
			});
		} else if (user && user._id != req.decoded.userid) {
			res.json({
				error: "You don't have the permission to do that."
			})
		} else if (user && (req.body.picture || req.body.lang || req.body.username || req.body.email || req.body.password)) {
			if (req.body.picture)
				user.picture = req.body.picture;
			if (req.body.lang)
				user.lang = req.body.lang;
			if (req.body.username) {
				exists = await User.findOne({
					username: req.body.username
				});
				if (exists && exists._id != user._id) {
					res.json({
						message: "Username taken"
					});
					return;
				} else {
					user.username = req.body.username;
				}
			}
			if (req.body.email) {
				if (user.authProvider == "local") {
					exists = await User.findOne({
						email: req.body.email
					});
					if (exists && exists._id != user._id) {
						res.json({
							message: "Email taken"
						});
						return;
					} else {
						user.email = req.body.email;
					}
				} else {
					res.json({
						message: "You can't modify this with a oAuth account"
					});
					return;
				}
			}
			if (req.body.password) {
				if (user.authProvider == "local") {
					user.password = bcrypt.hashSync(req.body.password, 10);
				} else {
					res.json({
						message: "You can't modify this with a oAuth account"
					});
					return;
				}
			}
			user.save(error => {
				console.log(error);
			});
			res.json(user);
		} else {
			res.status(404).send("Not found");
		}
	});
});

usersRouter.get('/*', (req, res) => {
	res.send(404);
})

module.exports = usersRouter;