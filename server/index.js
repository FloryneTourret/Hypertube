const express = require('express');
const cors = require('cors');
require('dotenv').config();
const morgan = require('morgan');
const mongoose = require('mongoose');
const fs = require('fs')
const https = require('https')
const PORT = 5001;

const app = express();

app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));

app.use(morgan('combined'));

mongoose.connect(process.env.DB_CONNECTION, {
    useNewUrlParser: true
}, () => {
    console.log("Connected to db!");
})

app.get('/', (req, res) => {
    res.send("<h1>coucou</h1>");
})

app.use(cors());

server = https.createServer({
    key: fs.readFileSync('server.key'),
    cert: fs.readFileSync('server.cert')
}, app);

const io = require('socket.io')(server, {
    origins: '*:*'
});

server.listen(PORT, function() {
    console.log('Listening on port 5001! Go to https://localhost:5001/')
})

