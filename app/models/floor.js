/*
 * Author:  Magic<magic@foowala.com>
 * Module description: floor
 */

var mongoose       = require('mongoose'),
    Schema         = mongoose.Schema,
    floor_Schema    = new Schema({
      store_id    : Schema.Types.ObjectId,
      number      : {type: Number, default: 1},
      CreateTime  : {type: Date, default: Date.now}
    });

floor_Schema.virtual('date').get(() => {
  this._id.getTimestamp();
});

floor_Schema.pre('save', (next) => {
  next();
});

floor_Schema.statics = {
  findById(_id, callback) {
    this.findOne({
      _id: _id
    }, (err, desk) => {
      callback(desk);
    });
  }
}

mongoose.model('floor', floor_Schema, 'floor');
