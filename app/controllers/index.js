const jwt = require('jsonwebtoken');
const User = require('../models/user');

const register = ((req, res, next) => {
  if (!req.body.email || !req.body.name || !req.body.password) {
    return res.status(400).json({ error: 'Data missing' });
  }

  const userData = {
    email: req.body.email,
    name: req.body.name,
    password: req.body.password
  };

  User.create(userData, function (err, user) {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    return res.status(201).json({
      token: signToken({ name: user.name, password: user.password, email: user.email })
    });
  });
});

const login = ((req, res) => {
  if (!req.body.email || !req.body.password) {
    return res.status(400).json({ error: err.message });;
  }

  User.findOne({ email: req.body.email })
    .exec((err, user) => {
      if (err || !user) {
        return res.status(400).json({ error: err.message });
      }

      if(!user.comparePassword(req.body.password)) {
        return res.status(400).json({ error: 'Wrong password' });
      }

      res.json({
        token: signToken({ name: user.name, password: user.password, email: user.email })
      })
    });
});

const profile = ((req, res) => {
  if (!req.user) {
    return res.status(400).json({ error: 'User not found' });
  }

  return res.json(req.user);
});

const auth = (req, res, next) => {
  if (!req.headers || !req.headers.authorization || req.headers.authorization.split(' ').length < 2) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  jwt.verify(req.headers.authorization.split(' ')[1], 'UPSTACK_API', (err, decoded) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    User.findOne({ email: decoded.email })
      .exec((err, user) => {
        if (err) {
          return res.status(400).json({ error: err.message });
        }

        req.user = user;
        next();
      });
  });
};

const signToken = ({ name, password, email }) =>
  jwt.sign({ name, password, email }, 'UPSTACK_API')

module.exports = {
  login,
  register,
  profile,
  auth
}
