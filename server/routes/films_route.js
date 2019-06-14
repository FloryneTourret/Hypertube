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
            console.log(response);
            res.send(response);
        })
        .catch(error => {
            console.log(error);
        })
})

module.exports = filmRouter;