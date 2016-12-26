/*
 * Author:  Kain<kain@foowala.com>
 * Module description: 用户
 */

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    user_Schema = new Schema({
        open_id: String,
        username: String,
        password: String,
        nickname: String,
        admin: { type: Boolean, default: false },
        CreateTime: { type: Date, default: Date.now }
    });

user_Schema.virtual('date').get(() => {
    this._id.getTimestamp();
});

user_Schema.pre('save', (next) => {
    next();
});

user_Schema.statics = {
    findById(_id, callback) {
        this.findOne({
            _id: _id
        }, (err, user) => {
            callback(user);
        });
    }
}

mongoose.model('user', user_Schema, 'user');
