'use strict';
const localStrategy = require('passport-local').Strategy;
const BearerStrategy = require('passport-http-bearer').Strategy;
const crypto = require('crypto');

module.exports = function (app, passport, User, AccessToken) {

    passport.use(
        'login',
        new localStrategy(
            {
                usernameField: 'email',
                passwordField: 'password'
            },
            function (email, password, done) {
                //this has to be the User Model
                User.findOne({email: email}, function (err, user) {
                    if (err) {
                        return done(err);
                    }
                    if (!user) {
                        return done(null, false);
                    }
                    if (!user.validPassword(password)) {
                        return done(null, false);
                    }

                    //remove any existing accesstokens
                    AccessToken.deleteOne({userId: user._id}, function (err) {
                        if (err) return done(err);
                    });

                    //create a new token for the session
                    const tokenValue = crypto.randomBytes(32).toString('hex');
                    const token = new AccessToken({token: tokenValue, userId: user._id});

                    token.save(function (err, token) {
                        if (err) {
                            return done(err);
                        }
                        return done(null, {
                            _id: user._id,
                            token: tokenValue,
                            'expires_in': app.config.get('security:tokenLife')
                        });
                    });

                });
            }
        ));

    passport.use(
        'bearer',
        new BearerStrategy(
            function (accessToken, done) {
                AccessToken.findOne({token: accessToken}, function (err, token) {
                    if (err) {
                        return done(err);
                    }
                    if (!token) {
                        return done(null, false);
                    }

                    if (Math.round((Date.now() - token.created) / 1000) > app.config.get('security:tokenLife')) {
                        AccessToken.remove({token: accessToken}, function (err) {
                            if (err) return done(err);
                        });
                        return done(null, false, {message: 'Token expired'});
                    }

                    User.findById(token.userId, function (err, user) {
                        if (err) {
                            return done(err);
                        }
                        if (!user) {
                            return done(null, false, {message: 'Unknown user'});
                        }

                        var info = {scope: '*'}
                        done(null, user, info);
                    });
                });
            }
        ));

    passport.serializeUser(function (user, done) {
        done(null, user._id);
    });

    passport.deserializeUser(function (id, done) {
        User.findById(id, function (err, user) {
            done(err, user);
        });
    });

    return passport;

}