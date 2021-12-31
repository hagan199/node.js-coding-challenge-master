'use strict';

module.exports = function (app, passport, userModel, AccessToken) {
    app.get('/api/profile',
        passport.authenticate('bearer', {session: false}),
        function (req, res) {
            res.json({_id: req.user._id, email: req.user.email, name: req.user.name})
        });


    app.post('/api/login', function (req, res, next) {
        if (!req.body.email || !req.body.password) {
            return res.status(400).send({
                message: 'Bad Request'
            });
        }
        passport.authenticate('login', function (err, user, info, status) {
            if (err) {
                return next(err)
            }

            if (!user) {
                return res.status(401).send("Unauthorized");
            }

            res.json(user);

        })(req, res, next);
    });

    app.route('/api/register')
        .post((req, res) => {
            (async () => {
                try {

                    const exists = await userModel.findOne({email: req.body.email});

                    if (exists) {
                        //if email already exists kill
                        return res.status(400).send({
                            message: 'Bad Request'
                        });
                    }

                    //create user object
                    const user = await userModel.create({
                        name: req.body.name,
                        password: req.body.password,
                        email: req.body.email
                    })

                    passport.authenticate('login', function (err, user, info, status) {
                        if (err || !user) {
                            return res.status(401).send("Unauthorized");
                        }

                        res.status(201).json(user);

                    })(req, res);

                } catch (err) {
                    return res.status(400).send({
                        message: err.message
                    });
                }
            })()
        })

    app.get('/api/logout',
        passport.authenticate('bearer', {session: false}),
        function (req, res) {

            AccessToken.deleteOne({userId: req.user._id}, (err) => {
                if (!err)
                    res.status(200).send("Logged out")
                else
                    res.status(400).send("Bad Request")
            })

        });

    return app;
};