const express = require("express");
const Comment = require("../schemas/Comment");
const Movie = require("../schemas/Movie");
const User = require("../schemas/User");

const commentRouter = express.Router({
    mergeParams: true
});

require("dotenv").config();

commentRouter.get("/", async (req, res) => {
    // parameters : username, movieID
    if (req.query.movieID) {
        console.log(req.query.movieID)
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

commentRouter.post("/", async (req, res) => {
    console.log("je suis ici", req.body);
    if (req.body.username && req.body.movieID && req.body.content) {
        console.log("oui");
        var user = await User.findOne({ username: req.body.username });
        var movie = await Movie.findOne({ movieID: req.body.movieID });
        if (user && movie) {
            var comment = new Comment({
                author: user._id,
                movie: movie._id,
                content: req.body.content
            });
            comment.save(err => {
                if (err)
                    throw err;
            })
        } else {
            res.json({ message: "Wrong username or movie" });
        }
    }
});

module.exports = commentRouter;