module.exports = function (mongoose) {
    const crypto = require('crypto');

    const Schema = mongoose.Schema;
    const userSchema = new Schema({
            email: {
                type: String,
                required: true,
                index: {
                    unique: true
                }
            },
            password: {
                type: String,
                required: true
            },
            salt: String,
            name: {
                type: String,
                required: true
            },
        },
        {
            timestamps: {
                createdAt: 'created_at',
                updatedAt: 'updated_at'
            }
        });

    //adding email validator
    userSchema.path('email').validate(function (email) {
        var emailRegex = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
        return emailRegex.test(email); // Assuming email has a text attribute
    }, 'The e-mail is invalid')

    userSchema.pre('save', function (next) {
        const user = this;

        // only hash the password if it has been modified (or is new)
        if (!user.isModified('password')) return next();

        this.salt = crypto.randomBytes(16).toString('hex');
        this.password = crypto.pbkdf2Sync(user.password, this.salt,
            1000, 32, `sha512`).toString(`hex`);

        next();
    });

    // Method to check the entered password is correct or not
    userSchema.methods.validPassword = function (password) {
        var hash = crypto.pbkdf2Sync(password,
            this.salt, 1000, 32, `sha512`).toString(`hex`);
        return this.password === hash;
    };

    //return model
    return mongoose.model('user', userSchema);

}