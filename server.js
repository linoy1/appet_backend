const express = require('express');
const bodyParser = require('body-parser');

const dogsRoutes = require('./routes/dogs-routes');
const usersRoutes = require('./routes/users-routes');
const HttpError = require('./models/http-error');
// const mongoose = require('mongoose');
const port = process.env.PORT || 3000;
require('dotenv').config();
require('./db_connection');



const app = express();

app.use(bodyParser.json());

app.use('/api/dogs', dogsRoutes); // => /api/places...
app.use('/api/users', usersRoutes);

app.use((req, res, next) => {
    const error = new HttpError('Could not find this route.', 404);
    throw error;
});

app.use((error, req, res, next) => {
    if (res.headerSent) {
        return next(error);
    }
    res.status(error.code || 500);
    res.json({ message: error.message || 'An unknown error occured' })
});

app.listen(port, () =>
    console.log(`Express server is running on port ${port}`)
);