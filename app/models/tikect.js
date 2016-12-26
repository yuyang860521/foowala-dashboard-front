/*
 * Author:  Magic<Magic@foowala.com>
 * Module description: 二维码
 */

var mongoose     = require('mongoose'),
  Schema         = mongoose.Schema,
  qr_Schema   = new Schema({
    store_id    : Schema.Types.ObjectId,
    is_admin    : {type: Boolean, default: false},
    qr_url      : {type: String},
    CreateTime  : {type: Date, default: Date.now}
  });

qr_Schema.virtual('date').get(() => {
  this._id.getTimestamp();
});

qr_Schema.pre('save', (next) => {
  next();
});

qr_Schema.statics = {
  findById(_id, callback) {
    this.findOne({
      _id: _id
    }, (err, qr) => {
      callback(qr);
    });
  }
}

mongoose.model('qr', qr_Schema, 'qr');
