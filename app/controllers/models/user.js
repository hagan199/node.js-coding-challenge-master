const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const connection = mongoose.createConnection('mongodb://localhost/upstack_api');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
  }
});

UserSchema.pre('save', function (next) {
  const user = this;
  bcrypt.hash(user.password, 10, function (err, hash){
    if (err) {
      return next(err);
    }

    user.password = hash;
    next();
  })
});

UserSchema.methods.comparePassword = function (password) {
  return bcrypt.compareSync(password, this.password);
};

module.exports = connection.model('User', UserSchema);
