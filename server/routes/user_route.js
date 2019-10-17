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
const Picture = require('../schemas/Picture')
const cleanStr = require('../middlewares/cleanStr');

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
			if (req.body.picture) {
				pictureExists = await Picture.findOne({ src: req.body.picture });
				if (pictureExists !== null) {
					user.picture = req.body.picture;
				} else {
					res.json({ message: "Invalid picture." })
					return;
				}
			}
			if (req.body.lang) {
				if (typeof req.body.lang == "object") {
					res.json({ message: "Duplicate key for lang" });
					return;
				}
				if (typeof req.body.lang == "string") {
					user.lang = req.body.lang;
				}
			}
			if (req.body.username) {
				if (typeof req.body.username == "object") {
					res.json({ message: "Duplicate key for username" });
					return;
				}
				if (typeof req.body.username == "string") {
					exists = await User.findOne({
						username: cleanStr(req.body.username)
					});
					if (exists && exists._id != user._id) {
						res.json({
							message: "Username taken"
						});
						return;
					} else {
						user.username = cleanStr(req.body.username);
					}
				}
			}
			if (req.body.email) {
				if (typeof req.body.email == "object") {
					res.json({ message: "Duplicate key for email" });
					return;
				}
				if (typeof req.body.email == "string") {
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
			}
			if (req.body.password) {
				if (typeof req.body.password == "object") {
					res.json({ message: "Duplicate key for password" });
					return;
				}
				if (typeof req.body.password == "string") {
					var strongRegex = new RegExp(
						"^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})"
					);
					if (user.authProvider == "local") {
						if (strongRegex.test(req.body.password))
							user.password = bcrypt.hashSync(req.body.password, 10);
						else {
							res.json({ message: "Password is not secure enough" });
							return;
						}
					} else {
						res.json({
							message: "You can't modify this with a oAuth account"
						});
						return;
					}
				}
			}
			user.save(error => {
				console.log(error);
			});
			res.json(user);
		} else {
			res.status(200).send("Not found");
		}
	});
});

usersRouter.get('/*', (req, res) => {
	res.send('404');
})

module.exports = usersRouter;