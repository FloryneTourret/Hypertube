const express = require('express');
const bcrypt = require('bcrypt');
const usersRouter = express.Router({
	mergeParams: true
});
const User = require('../schemas/User');
const Movie = require('../schemas/Movie');
const Picture = require('../schemas/Picture');

require('dotenv').config();

usersRouter.get('/', (req, res) => {
	User.find({}, (err, docs) => {
		res.json(docs);
	})
});

usersRouter.get('/:username', async (req, res) => {
	User.findOne({
		username: req.params.username
	}, (err, doc) => {
		if (err)
			console.log(err);
		else
			res.json(doc);
	})
})

usersRouter.get('/:username/movies', async (req, res) => {
	User.findOne({
		username: req.params.username
	}, (err, doc) => {
		if (err)
			console.log(err);
		else {
			Movie.find({
				user: doc._id
			}, (err, movies) => {
				if (movies)
					res.json(movies);
				else 
					console.log(err);
			})
		}
	})
})

usersRouter.post('/', async (req, res) => {
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
	if (user) {
		if (bcrypt.compareSync(req.body.password, user.password)) {
			req.session.id = user._id;
			req.session.username = user.username;
			res.status(200).send(user);
		} else {
			res.status(401).send("KO");
		}
	} else {
		res.status(404).send("Not found");
	}
})

usersRouter.put('/user/:username', async function (req, res) {
	if (req.params.username !== '' && req.body.picture === '') {
		var conditions = { username: req.params.username };
	User.update(conditions, { username: req.body.username })
	.then(async (doc) => {
		if (!doc) { return res.status(404).end(); }
		user = await User.findOne({username: req.body.username});
		return res.status(200).json(user);
	})
	.catch(err => next(err));
	}
	if (req.body.picture !== '')
	User.findOne({username: req.params.username})
	.then(doc => {
		if (doc) {
			doc.picture = req.body.picture;
			doc.save();
			res.status(200).json(doc);
		} else {
			res.status(404).send("nope");
		}
	});
	if (req.body.lang !== '')
	User.findOne({username: req.params.username})
	.then(doc => {
		if (doc) {
			doc.lang = req.body.lang;
			doc.save();
			res.status(200).json(doc);
		} else {
			res.status(404).send("nope");
		}
	});
})

module.exports = usersRouter;