const express = require('express');
const axios = require('axios');

const filmRouter = express.Router({
    mergeParams: true
});

require('dotenv').config();

filmRouter.get('/', async (req, res) => {
    axios
    .get('https://yts.lt/api/v2/list_movies.json')
    .then(response => {
        res.send(response.data);
    })
    .catch(error => {
        res.json({
            message: error
        })
    })
});

module.exports = filmRouter;