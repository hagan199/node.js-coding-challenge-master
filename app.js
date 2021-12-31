'use strict';

const express = require('express');
const http = require('http')
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const passport = require('passport');
// Create express app
const app = express();

const routes = require('./routes')

const UserModel = require('./models/user')
const AccessTokenModel = require('./models/accesstoken')

//secret for session
const session = require('express-session')({
    secret: 'bofolekOSl',
    resave: false,
    saveUninitialized: false
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session);
app.use(passport.initialize());
app.use(passport.session());

//initialize strategies and routes
require('./passport/strategies')(app, passport, UserModel, AccessTokenModel)
require('./routes')(app, passport, UserModel, AccessTokenModel)




//client app entry point and serving of static libraries
app.use(express.static(path.join(__dirname, 'app_client')));
app.use(express.static(path.join(__dirname, 'public')));

(async () => {
    try {

        await mongoose.connect(app.config.get('mongoose:uri'), {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true
        });

        console.log('MongoDB successfully connected')

        //now start server after successful db initialization
        await http.createServer(app).listen(app.config.get('port'), app.config.get('hostname'));
        console.log(`Server running at http://${app.config.get('hostname')}:${app.config.get('port')}/`);

    } catch (error) {
        //console.log(error.message)
        process.exit(error)
    }
})();

module.exports = app;
