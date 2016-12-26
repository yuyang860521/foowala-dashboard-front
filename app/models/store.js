/*
 * Author:  Kain<kain@foowala.com>
 * Module description: 门店
 */

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    store_Schema = new Schema({
        name: String,
        type: String,
        register_qr: String,
        register_info_id: {type: Schema.Types.ObjectId}, //注册人信息
        admin_qr: String,
        address: {
            province: String,
            city: String,
            district: String,
            address: String
        },
        principal:String,//负责人
        principal_phone:Number,
        principal_email:String,
        CreateTime: { type: Date, default: Date.now }
    });

store_Schema.virtual('date').get(() => {
    this._id.getTimestamp();
});

store_Schema.pre('save', (next) => {
    next();
});

store_Schema.statics = {
    findById(_id, callback) {
        this.findOne({
            _id: _id
        }, (err, test) => {
            callback(test);
        });
    }
}

mongoose.model('store', store_Schema, 'store');
