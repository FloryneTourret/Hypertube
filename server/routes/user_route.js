const express = require('express');
const bcrypt = require('bcrypt');
const usersRouter = express.Router({
	mergeParams: true
});
const User = require('../schemas/User');
const Movie = require('../schemas/Movie');
const tokenVerification = require('../middlewares/tokenVerification');
const jwt = require('jsonwebtoken');
require('dotenv').config();

usersRouter.get('/', tokenVerification, async (req, res) => {
	User.find({}, (err, docs) => {
		res.json(docs);
	})
});

usersRouter.get('/:username', tokenVerification, async (req, res) => {
	User.findOne({
		username: req.params.username
	}, (err, doc) => {
		if (err)
			console.log(err);
		else
			res.json(doc);
	})
})

usersRouter.get('/:username/movies', tokenVerification, async (req, res) => {
	User.findOne({
		username: req.params.username
	}, async (err, doc) => {
		if (err)
			console.log(err);
		else {
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

usersRouter.post('/', tokenVerification, async (req, res) => {
	user = new User({
		email: req.body.email.toLowerCase(),
		picture: "img/default.png",
		lang: "en",
		username: req.body.username,
		firstName: req.body.firstName.charAt(0).toUpperCase() + req.body.firstName.slice(1),
		lastName: req.body.lastName.toUpperCase(),
		password: bcrypt.hashSync(req.body.password, 10),
		authProvider: "local"
	});
	user.save()
		.then((data) => {
			res.json(data);
		})
		.catch((err) => {
			res.json({
				message: err
			});
		})
});

usersRouter.post('/login', async (req, res) => {
	var user = await User.findOne({
		username: {
			$regex: new RegExp(req.body.username, "i")
		}
	});
	if (user && user.authProvider === 'local') {
		console.log(user);
		if (bcrypt.compareSync(req.body.password, user.password)) {
			const payload = {
				check: true
			}

			var token = jwt.sign(payload, process.env.SECRET, {
				expiresIn: "2 days"
			});

			res.status(200).send({ user: user, token: token });
		} else {
			res.status(200).send("KO");
		}
	} else {
		res.status(200).send("Not found");
	}
})

usersRouter.put('/user/:username', tokenVerification, async (req, res) => {
	User.findOne({
		username: req.params.username
	}, async (err, user) => {
		if (err) {
			res.json({
				message: err
			});
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
				exists = await User.findOne({
					email: req.body.email
				});
				if (exists && exists._id != user._id) {
					res.json({
						message: "Email taken"
					});
					return;
				} else {
					user.email = req.body.username;
				}
			}
			if (req.body.password) {
				user.password = bcrypt.hashSync(req.body.password, 10)
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

module.exports = usersRouter;