/*
 * Author:  Magic<magic@foowala.com>
 * Module description: admin schema
 */

var mongoose       = require('mongoose'),
    Schema         = mongoose.Schema,
    admin_Schema    = new Schema({
      name:{type:String, required:true},
      phone:Number,
      password:String,
      CreateTime: {type: Date, default: Date.now}
    });

admin_Schema.virtual('date').get(() => {
  this._id.getTimestamp();
});

admin_Schema.pre('save', (next) => {
  next();
});

admin_Schema.statics = {
  findById(_id, callback) {
    this.findOne({
      _id: _id
    }, (err, admin) => {
      callback(admin);
    });
  }
}

mongoose.model('admin', admin_Schema, 'admin');
