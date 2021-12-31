module.exports = function (mongoose) {

    const Schema = mongoose.Schema;
    const AccessToken = new Schema({
        userId: {
            type: mongoose.ObjectId,
            required: true
        },
        token: {
            type: String,
            unique: true,
            required: true
        },
        created: {
            type: Date,
            default: Date.now
        }
    });

    return mongoose.model('accessToken', AccessToken);
}