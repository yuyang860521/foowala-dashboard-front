/*
 * Author:  Magic<magic@foowala.com>
 * Module description: auth mongo
 */

var mongoose       = require('mongoose'),
    Schema         = mongoose.Schema,
    auth_Schema    = new Schema({
      staff_id: Schema.Types.ObjectId,
      func_id:[Schema.Types.ObjectId], //func id
      CreateTime: {type: Date, default: Date.now}
    });

auth_Schema.virtual('date').get(() => {
  this._id.getTimestamp();
});

auth_Schema.pre('save', (next) => {
  next();
});

auth_Schema.statics = {
  findById(_id, callback) {
    this.findOne({
      _id: _id
    }, (err, auth) => {
      callback(auth);
    });
  }
}

mongoose.model('auth', auth_Schema, 'auth');
