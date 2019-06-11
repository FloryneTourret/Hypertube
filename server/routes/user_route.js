const express = require('express');
const bcrypt = require('bcrypt');
const usersRouter = express.Router({
    mergeParams: true
});
const User = require('../schemas/User');

usersRouter.get('/', (req, res) => {
    User.find({}, (err, docs) => {
        res.json(docs);
    })
});
usersRouter.get('/:userId', async (req, res) => {
    User.findById(req.params.userId, (err, doc) => {
        if (err)
            console.log(err);
        else
            res.json(doc);
    })
})

usersRouter.post('/', async (req, res) => {
    user = new User({
        email: req.body.email,
        username: req.body.username,
        password: bcrypt.hashSync(req.body.password, 10)
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
        username: { $regex: new RegExp(req.body.username, "i") }
    });
    if (user) {
        if (bcrypt.compareSync(req.body.password, user.password)) {
            req.session.id = user._id;
            req.session.username = user.username;
            res.status(200).send("OK");
        } else {
            res.status(401).send("KO");
        }
    } else {
        res.status(404).send("Not found");
    }
})

module.exports = usersRouter;