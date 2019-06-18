const express = require('express');
const axios = require('axios');

const filmRouter = express.Router({
    mergeParams: true
});

require('dotenv').config();

filmRouter.get('/:query', async (req, res) => {
        // console.log(req.params.query);
        axios
        .get('https://ytss.unblocked.is/api/v2/list_movies.json?' + req.params.query)
        .then(response => {
            res.json(response.data);
        })
        .catch(error => {
            res.json({
                message: error
            })
        })
});

filmRouter.get('/preview/:id', async (req, res) => {
    // console.log(req.params.params);
    axios
    .get('https://ytss.unblocked.is/api/v2/movie_details.json?movie_id=' + req.params.id)
    .then(response => {
        res.json(response.data);
    })
    .catch(error => {
        res.json({
            message: error
        })
    })
})

module.exports = filmRouter;