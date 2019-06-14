const express = require('express');
const router = express.Router();
const User = require('../schemas/User');

router.get('/', (req, res) => {
	res.send("No strategy chosen");
})

router.post('/google/login', async (req, res) => {
	var user = await User.findOne({
		email: req.body.email,
		authProvider: "google"
	});
	if (user) {
		req.session.id = user._id;
		req.session.username = user.username;
		res.status(200).send(user);
	} else {
		res.status(404).send("Not found");
	}
});

router.post('/google/register', async (req, res) => {
	console.log(req.body.user);
	user = new User({
		email: req.body.user.U3.toLowerCase(),
		username: req.body.user.ofa + req.body.user.wea,
		firstName: req.body.user.ofa.charAt(0).toUpperCase() + req.body.user.ofa.slice(1),
		lastName: req.body.user.wea ? req.body.user.wea.toUpperCase() : req.body.user.ofa ? req.body.user.ofa : req.body.user.ig,
		authProvider: "google"
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

router.post('/42/login', async (req, res) => {
	let user = await User.findOne({
		email: req.body.data.email,
		authProvider: "42"
	});
	if (user) {
		req.session.id = user._id;
		req.session.username = user.username;
		res.status(200).json(user);
	} else {
		res.json({
			message: "You need to register first."
		})
	}
})

router.post('/42/register', async (req, res) => {
	console.log(req.body);
	user = new User({
		email: req.body.data.email,
		username: req.body.data.login,
		firstName: req.body.data.first_name,
		lastName: req.body.data.last_name,
		authProvider: "42"
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
})

module.exports = router;