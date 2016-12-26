/*
 * Author:  Magic<magic@foowala.com>
 * Module description: func mongo
 */

var mongoose       = require('mongoose'),
    Schema         = mongoose.Schema,
    func_Schema    = new Schema({
      name: {type:String, required: true},
      uri: {type: String, required: true}
    });

func_Schema.virtual('date').get(() => {
  this._id.getTimestamp();
});

func_Schema.pre('save', (next) => {
  next();
});

func_Schema.statics = {
  findById(_id, callback) {
    this.findOne({
      _id: _id
    }, (err, func) => {
      callback(func);
    });
  }
}

mongoose.model('func', func_Schema, 'func');
