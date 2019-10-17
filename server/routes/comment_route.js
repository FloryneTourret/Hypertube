const express = require("express");
const Comment = require("../schemas/Comment");
const Movie = require("../schemas/Movie");
const User = require("../schemas/User");

const commentRouter = express.Router({
    mergeParams: true
});
const tokenVerification = require('../middlewares/tokenVerification')

commentRouter.get("/", tokenVerification, async (req, res) => {
    if (req.query.movieID) {
        var movie = await Movie.findOne({ movieID: req.query.movieID });
        if (movie) {
            console.log("movie exists");
            Comment.aggregate(
                [
                    {
                        $match: {
                            movie: movie._id
                        },
                    },
                    {
                        $lookup: {
                            from: 'users',
                            localField: 'author',
                            foreignField: '_id',
                            as: 'user',

                        },
                    },
                    {
                        $unwind: {
                            path: "$user"
                        }
                    }
                ]
            ).then(comments => {
                res.json(comments);
            }).catch(error => {
                throw error;
            })
        } else {
            res.json({ message: "error" });
        }
    } else if (req.query.username) {
        var user = await User.findOne({ username: req.query.username });
        if (user) {
            Comment.aggregate(
                [
                    {
                        $match: {
                            author: user._id
                        },
                    },
                    {
                        $lookup: {
                            from: 'movies',
                            localField: 'movie',
                            foreignField: '_id',
                            as: 'movies',

                        },
                    },
                ]
            ).then(comments => {
                res.json(comments);
            }).catch(error => {
                throw error;
            })
        } else {
            res.json({ message: "No user" });
        }
    } else {
        var comments = await Comment.find();
        if (comments)
            res.json(comments);
    }
});

commentRouter.post("/", tokenVerification, async (req, res) => {
    if (req.decoded.userid && req.body.movieID && req.body.content && req.body.content.trim().length > 0) {
        var movie = await Movie.findOne({ movieID: req.body.movieID });
        if (movie) {
            var comment = new Comment({
                author: req.decoded.userid,
                movie: movie._id,
                content: req.body.content.trim()
            });
            comment.save(err => {
                if (err)
                    throw err;
            })
            res.status(200).send("ok");
        } else {
            res.json({ message: "Wrong username or movie" });
        }
    } else {
        res.json({message: "Invalid user"})
    }
});

module.exports = commentRouter;