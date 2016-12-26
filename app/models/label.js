/*
 * Author:  Kain<kain@foowala.com>
 * Module description: 备注
 */

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    label_Schema = new Schema({
        store_id: Schema.Types.ObjectId, // 所属门店
        label: String,
        CreateTime: { type: Date, default: Date.now },
        isChecked: false    // 此字段忽略
    });

label_Schema.pre('save', (next) => {
    next();
});

label_Schema.statics = {
    findById(_id, callback) {
        this.findOne({
            _id: _id
        }, (err, label) => {
            callback(label);
        });
    }
}

mongoose.model('label', label_Schema, 'label');
