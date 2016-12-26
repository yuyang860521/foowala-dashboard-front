/*
 * Author:  MagicZhang<magic@foowala.com>
 * Module description: 登录查询数据 uid
 */

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    uid_Schema = new Schema({
        uid       : String, //唯一的标识，用于登录和注册成功时的查询
        open_id   : String, //微信open_id
        staff_id  : Schema.Types.ObjectId, //staff id
        nickname  : String, //wc nickname
        scene     : {type:String, default:"login"}, //scence describtion
        isLogin   : { type: Number, default: 0 },
        isStaff   : { type: Boolean, default: false },
        CreateTime: { type: Date, default: Date.now }
    });

uid_Schema.virtual('date').get(() => {
    this._id.getTimestamp();
});

uid_Schema.pre('save', (next) => {
    next();
});

uid_Schema.statics = {
    findById(_id, callback) {
        this.findOne({
            _id: _id
        }, (err, staff) => {
            callback(staff);
        });
    }
}

mongoose.model('uid', uid_Schema, 'uid');
